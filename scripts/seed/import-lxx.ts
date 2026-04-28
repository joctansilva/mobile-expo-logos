import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { refToId, idToParts, normalizeStrongId } from './utils';

const DATA_DIR = path.resolve(__dirname, '../data/LXX-Swete-1930');

// LXX Swete 1930 — Septuaginta grega do AT (domínio público)
// Repo: https://github.com/eliranwong/LXX-Swete-1930
// Formato TSV esperado: Ref | Greek word | [Lemma] | Strong ID | Morph
export async function importLxx(db: Database.Database) {
  if (!fs.existsSync(DATA_DIR)) {
    console.warn('  ! LXX-Swete-1930 não encontrado. Clone:');
    console.warn('    git clone --depth 1 https://github.com/eliranwong/LXX-Swete-1930.git scripts/data/LXX-Swete-1930');
    return;
  }

  // Encontrar diretório de dados (pode ser data/, tsv/, ou a raiz)
  const dataPath = findDataDir(DATA_DIR);
  if (!dataPath) {
    console.warn('  ! Nenhum arquivo TSV encontrado em LXX-Swete-1930/');
    return;
  }

  const tsvFiles = fs
    .readdirSync(dataPath)
    .filter((f) => f.endsWith('.tsv') || f.endsWith('.txt'))
    .sort();

  if (!tsvFiles.length) {
    console.warn(`  ! Nenhum arquivo TSV em ${dataPath}`);
    return;
  }

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

  for (const file of tsvFiles) {
    const { verses, tokens } = processLxxFile(path.join(dataPath, file));

    const insertFile = db.transaction(() => {
      for (const v of verses) verseStmt.run(v);
      for (const t of tokens) tokenStmt.run(t);
    });

    insertFile();
    totalVerses += verses.length;
    totalTokens += tokens.length;
  }

  console.log(`  → ${totalVerses.toLocaleString()} versículos LXX`);
  console.log(`  → ${totalTokens.toLocaleString()} tokens LXX`);
}

function findDataDir(base: string): string | null {
  for (const subdir of ['data', 'tsv', 'txt', '']) {
    const candidate = subdir ? path.join(base, subdir) : base;
    if (fs.existsSync(candidate)) {
      const files = fs.readdirSync(candidate);
      if (files.some((f) => f.endsWith('.tsv') || f.endsWith('.txt'))) {
        return candidate;
      }
    }
  }
  return null;
}

function processLxxFile(filePath: string): {
  verses: Record<string, unknown>[];
  tokens: Record<string, unknown>[];
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim() && !l.startsWith('#'));

  const versesMap = new Map<number, string>(); // verse_id → accumulated text
  const tokens: Record<string, unknown>[] = [];
  const positionMap = new Map<number, number>(); // verse_id → current position

  for (const line of lines) {
    const cols = line.split('\t');
    if (cols.length < 2) continue;

    const ref = cols[0].trim();
    const greekWord = cols[1].trim();
    if (!ref || !greekWord) continue;

    const verseId = refToId(ref);
    if (!verseId) continue;

    // Acumular texto do versículo
    const existing = versesMap.get(verseId);
    versesMap.set(verseId, existing ? `${existing} ${greekWord}` : greekWord);

    // Extrair Strong (tentar colunas 3 e 4)
    let strongId: string | null = null;
    for (let i = 3; i <= Math.min(4, cols.length - 1); i++) {
      const candidate = normalizeStrongId(cols[i]);
      if (candidate) { strongId = candidate; break; }
    }

    const morph = cols[4]?.trim() || null;
    const position = positionMap.get(verseId) ?? 0;
    positionMap.set(verseId, position + 1);

    tokens.push({
      verse_id: verseId,
      position,
      greek_word: greekWord,
      strong_id: strongId,
      morph_code: morph,
    });
  }

  // Construir lista de versículos
  const verses = Array.from(versesMap.entries()).map(([id, text]) => {
    const { bookId, chapter, verse } = idToParts(id);
    return { id, book_id: bookId, chapter, verse, translation: 'LXX', text };
  });

  return { verses, tokens };
}
