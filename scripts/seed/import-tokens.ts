import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { refToId, normalizeStrongId } from './utils';

const DATA_DIR = path.resolve(__dirname, '../data/STEPBible-Data');

// STEPBible TAHOT/TAGNT — formato TSV:
// Colunas (podem variar ligeiramente entre versões):
//   0: Ref (ex: "Gen.1.1")
//   1: Palavra no original (hebraico/grego)
//   2: Lemma
//   3: Strong ID (ex: "H7225" ou "G3056")
//   4: Código morfológico

export async function importTokens(db: Database.Database) {
  const stmt = db.prepare(`
    INSERT INTO verse_tokens
      (verse_id, position, word_surface, strong_id, morph_code, original_word)
    VALUES
      (@verse_id, @position, @word_surface, @strong_id, @morph_code, @original_word)
  `);

  // AT — hebraico
  const tahotPath = findFile(DATA_DIR, 'TAHOT');
  if (tahotPath) {
    const count = parseTsvAndInsert(db, stmt, tahotPath);
    console.log(`  → ${count.toLocaleString()} tokens AT/hebraico (TAHOT)`);
  } else {
    console.warn('  ! TAHOT não encontrado em scripts/data/STEPBible-Data/');
    console.warn('    Clone: git clone --depth 1 https://github.com/STEPBible/STEPBible-Data.git scripts/data/STEPBible-Data');
  }

  // NT — grego
  const tagntPath = findFile(DATA_DIR, 'TAGNT');
  if (tagntPath) {
    const count = parseTsvAndInsert(db, stmt, tagntPath);
    console.log(`  → ${count.toLocaleString()} tokens NT/grego (TAGNT)`);
  } else {
    console.warn('  ! TAGNT não encontrado em scripts/data/STEPBible-Data/');
  }
}

function findFile(baseDir: string, prefix: string): string | null {
  if (!fs.existsSync(baseDir)) return null;

  // Procurar recursivamente por arquivo cujo nome começa com o prefixo
  const dirs = ['', 'Tagged-Bibles', 'Translators-Amalgamated-Bibles'];
  for (const dir of dirs) {
    const searchPath = path.join(baseDir, dir);
    if (!fs.existsSync(searchPath)) continue;

    const files = fs.readdirSync(searchPath);
    const match = files.find((f) => f.startsWith(prefix) && (f.endsWith('.txt') || f.endsWith('.tsv')));
    if (match) return path.join(searchPath, match);
  }
  return null;
}

function parseTsvAndInsert(
  db: Database.Database,
  stmt: Database.Statement,
  filePath: string,
): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let currentRef = '';
  let position = 0;
  let totalInserted = 0;
  const batch: Record<string, unknown>[] = [];

  const flush = db.transaction((rows: typeof batch) => {
    for (const row of rows) stmt.run(row);
  });

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Pular comentários e linhas de cabeçalho
    if (!line || line.startsWith('#') || line.startsWith('Ref\t')) continue;

    const cols = line.split('\t');
    if (cols.length < 2) continue;

    const ref = cols[0].trim();
    const word = cols[1].trim();
    if (!ref || !word) continue;

    // Resetar posição quando muda o versículo
    if (ref !== currentRef) {
      currentRef = ref;
      position = 0;
    }

    const verseId = refToId(ref);
    if (!verseId) continue;

    // Tentar extrair Strong de múltiplas posições (o STEPBible varia entre versões)
    // Testar colunas 3, 4 e 5 para encontrar o padrão H/G + dígitos
    let strongId: string | null = null;
    for (let i = 3; i <= Math.min(5, cols.length - 1); i++) {
      const candidate = normalizeStrongId(cols[i]);
      if (candidate) { strongId = candidate; break; }
    }

    const morph = cols[4]?.trim() || null;

    batch.push({
      verse_id: verseId,
      position: position++,
      word_surface: word,
      strong_id: strongId,
      morph_code: morph !== strongId ? morph : null,
      original_word: word,
    });

    if (batch.length >= 2000) {
      flush(batch);
      totalInserted += batch.length;
      batch.length = 0;
    }
  }

  if (batch.length) {
    flush(batch);
    totalInserted += batch.length;
  }

  return totalInserted;
}
