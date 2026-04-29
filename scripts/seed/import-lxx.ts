import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { refColonToId, idToParts } from './utils';
import { TRANSLATION_OFFSET } from './import-translations';

const LXX_OFFSET = TRANSLATION_OFFSET.LXX;

// LXX Swete 1930 — eliranwong/LXX-Swete-1930
// Estrutura do repo:
//   00-Swete_versification.csv   → "wordIndex\tRef" (ex: "1\tGen.1:1")
//   01-Swete_word_with_punctuations.csv → "wordIndex\tGreekWord" (sequência de palavras)
//
// Sem Strong IDs neste repo — strong_id ficará null para tokens LXX
const DATA_DIR = path.resolve(__dirname, '../data/LXX-Swete-1930');

export async function importLxx(db: Database.Database) {
  if (!fs.existsSync(DATA_DIR)) {
    console.warn('  ! LXX-Swete-1930 não encontrado. Clone:');
    console.warn('    git clone --depth 1 https://github.com/eliranwong/LXX-Swete-1930.git scripts/data/LXX-Swete-1930');
    return;
  }

  const versifPath = path.join(DATA_DIR, '00-Swete_versification.csv');
  const wordsPath = path.join(DATA_DIR, '01-Swete_word_with_punctuations.csv');

  if (!fs.existsSync(versifPath) || !fs.existsSync(wordsPath)) {
    console.warn('  ! Arquivos LXX não encontrados (00-Swete_versification.csv / 01-Swete_word_with_punctuations.csv)');
    return;
  }

  // ─── 1. Ler versificação: wordIndex → verseRef ─────────────────────────────
  // Cada linha: "1\tGen.1:1" — indica que a palavra de índice 1 começa o versículo Gen 1:1
  const versifLines = fs.readFileSync(versifPath, 'utf-8').split('\n').filter(Boolean);

  // Lista ordenada de { startIndex, verseId } para binary search
  const verseBoundaries: { startIdx: number; verseId: number; ref: string }[] = [];

  for (const line of versifLines) {
    const parts = line.split('\t');
    if (parts.length < 2) continue;
    const startIdx = parseInt(parts[0].trim(), 10);
    const ref = parts[1].trim();
    const verseId = refColonToId(ref);
    if (verseId && !isNaN(startIdx)) {
      verseBoundaries.push({ startIdx, verseId, ref });
    }
  }

  if (!verseBoundaries.length) {
    console.warn('  ! Nenhuma fronteira de versículo LXX processada');
    return;
  }

  // Ordenar por índice de palavra
  verseBoundaries.sort((a, b) => a.startIdx - b.startIdx);

  // ─── 2. Ler palavras e agrupar por versículo ──────────────────────────────
  // Cada linha: "1\tΕΝ" — índice global da palavra + palavra grega
  const wordLines = fs.readFileSync(wordsPath, 'utf-8').split('\n').filter(Boolean);

  // Mapa de wordIndex → palavra
  const words = new Map<number, string>();
  for (const line of wordLines) {
    const tab = line.indexOf('\t');
    if (tab === -1) continue;
    const idx = parseInt(line.slice(0, tab).trim(), 10);
    const word = line.slice(tab + 1).trim();
    if (!isNaN(idx) && word) words.set(idx, word);
  }

  // ─── 3. Agrupar palavras por versículo ────────────────────────────────────
  // Para cada palavra, encontrar qual versículo ela pertence usando as boundaries
  const verseWords = new Map<number, string[]>(); // verseId → [words...]

  const findVerseId = (wordIdx: number): number | null => {
    // Binary search: encontrar o maior startIdx ≤ wordIdx
    let lo = 0, hi = verseBoundaries.length - 1, result = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (verseBoundaries[mid].startIdx <= wordIdx) {
        result = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return result >= 0 ? verseBoundaries[result].verseId : null;
  };

  for (const [wordIdx, word] of words) {
    const verseId = findVerseId(wordIdx);
    if (!verseId) continue;
    if (!verseWords.has(verseId)) verseWords.set(verseId, []);
    verseWords.get(verseId)!.push(word);
  }

  // ─── 4. Inserir versículos e tokens ──────────────────────────────────────
  const verseStmt = db.prepare(`
    INSERT OR IGNORE INTO verses (id, book_id, chapter, verse, translation, text)
    VALUES (@id, @book_id, @chapter, @verse, @translation, @text)
  `);
  const tokenStmt = db.prepare(`
    INSERT INTO lxx_tokens (verse_id, position, greek_word, strong_id, morph_code)
    VALUES (@verse_id, @position, @greek_word, @strong_id, @morph_code)
  `);

  let totalVerses = 0;
  let totalTokens = 0;

  // Processar em lotes para não estourar memória
  const BATCH_SIZE = 500;
  const verseIds = Array.from(verseWords.keys()).sort((a, b) => a - b);

  for (let i = 0; i < verseIds.length; i += BATCH_SIZE) {
    const batch = verseIds.slice(i, i + BATCH_SIZE);

    const insertBatch = db.transaction(() => {
      for (const verseId of batch) {
        const wordList = verseWords.get(verseId)!;
        const { bookId, chapter, verse } = idToParts(verseId);
        const text = wordList.join(' ');

        const lxxVerseId = LXX_OFFSET + verseId;
        verseStmt.run({
          id: lxxVerseId,
          book_id: bookId,
          chapter,
          verse,
          translation: 'LXX',
          text,
        });
        totalVerses++;

        for (let pos = 0; pos < wordList.length; pos++) {
          tokenStmt.run({
            verse_id: lxxVerseId,
            position: pos,
            greek_word: wordList[pos],
            strong_id: null,
            morph_code: null,
          });
          totalTokens++;
        }
      }
    });

    insertBatch();
  }

  console.log(`  → ${totalVerses.toLocaleString()} versículos LXX`);
  console.log(`  → ${totalTokens.toLocaleString()} tokens LXX`);
}
