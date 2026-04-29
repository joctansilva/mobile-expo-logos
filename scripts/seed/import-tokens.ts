import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { refToId, parseStepbibleStrong, parseStepbibleMorph } from './utils';

// STEPBible Translators Amalgamated OT+NT (versão atual — em "Translators Amalgamated OT+NT/")
// Os arquivos Older Formats (TOTHT) são o formato legado — usar TAHOT/TAGNT
const AMALG_DIR = path.resolve(__dirname, '../data/STEPBible-Data/Translators Amalgamated OT+NT');

// ─── TAHOT ────────────────────────────────────────────────────────────────────
// Colunas (tab-separated):
//   0: "Gen.1.1#01=L"  → ref antes de "#"
//   1: "בְּ/רֵאשִׁ֖ית"  → palavra hebraica original
//   2: "be./re.Shit"   → transliteração
//   3: "in/ beginning" → tradução literal
//   4: "H9003/{H7225G}" → Strong (campo complexo)
//   5: "HR/Ncfsa"      → morfologia

// ─── TAGNT ────────────────────────────────────────────────────────────────────
// Colunas (tab-separated):
//   0: "Mat.1.1#01=NKO"    → ref antes de "#"
//   1: "Βίβλος (Biblos)"   → palavra grega (forma seguida de transliteração)
//   2: "[The] book"         → tradução literal
//   3: "G0976=N-NSF"       → Strong=Morph
//   4: "βίβλος=book"       → forma lexical
//   ...

export async function importTokens(db: Database.Database) {
  const stmt = db.prepare(`
    INSERT INTO verse_tokens
      (verse_id, position, word_surface, strong_id, morph_code, original_word)
    VALUES
      (@verse_id, @position, @word_surface, @strong_id, @morph_code, @original_word)
  `);

  const tahotFiles = findFiles(AMALG_DIR, 'TAHOT');
  if (tahotFiles.length) {
    let total = 0;
    for (const f of tahotFiles) total += parseTahot(db, stmt, f);
    console.log(`  → ${total.toLocaleString()} tokens AT/hebraico (TAHOT)`);
  } else {
    console.warn('  ! TAHOT não encontrado em Translators Amalgamated OT+NT/');
  }

  const tagntFiles = findFiles(AMALG_DIR, 'TAGNT');
  if (tagntFiles.length) {
    let total = 0;
    for (const f of tagntFiles) total += parseTagnt(db, stmt, f);
    console.log(`  → ${total.toLocaleString()} tokens NT/grego (TAGNT)`);
  } else {
    console.warn('  ! TAGNT não encontrado em Translators Amalgamated OT+NT/');
  }
}

function findFiles(dir: string, prefix: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && (f.endsWith('.txt') || f.endsWith('.tsv')))
    .sort()
    .map((f) => path.join(dir, f));
}

// Extrai a ref de campos como "Gen.1.1#01=L" → "Gen.1.1"
function extractRef(col0: string): string {
  return col0.split('#')[0].trim();
}

function parseTahot(db: Database.Database, stmt: Database.Statement, filePath: string): number {
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
    if (!line || line.startsWith('#') || line.startsWith('=') || line.startsWith('\t')) continue;

    const cols = line.split('\t');
    if (cols.length < 2) continue;

    const ref = extractRef(cols[0]);
    if (!ref || !ref.includes('.')) continue;

    const word = cols[1]?.trim();
    if (!word) continue;

    if (ref !== currentRef) {
      currentRef = ref;
      position = 0;
    }

    const verseId = refToId(ref);
    if (!verseId) continue;

    // Strong no campo 4 (formato complexo: "H9003/{H7225G}", "{H1254A}", etc.)
    const strongId = parseStepbibleStrong(cols[4]);
    // Morfologia no campo 5
    const morph = cols[5]?.trim() || null;

    batch.push({
      verse_id: verseId,
      position: position++,
      word_surface: word,
      strong_id: strongId,
      morph_code: morph || null,
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

function parseTagnt(db: Database.Database, stmt: Database.Statement, filePath: string): number {
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
    if (!line || line.startsWith('#') || line.startsWith('=') || line.startsWith('\t')) continue;

    const cols = line.split('\t');
    if (cols.length < 2) continue;

    const ref = extractRef(cols[0]);
    if (!ref || !ref.includes('.')) continue;

    // Palavra grega: "Βίβλος (Biblos)" → extrair só a palavra (antes do espaço+parêntese)
    const wordRaw = cols[1]?.trim();
    if (!wordRaw) continue;
    const word = wordRaw.split(' ')[0];

    if (ref !== currentRef) {
      currentRef = ref;
      position = 0;
    }

    const verseId = refToId(ref);
    if (!verseId) continue;

    // Campo 3: "G0976=N-NSF" → strong=G0976, morph=N-NSF
    const strongField = cols[3]?.trim();
    const strongId = parseStepbibleStrong(strongField);
    const morph = parseStepbibleMorph(strongField);

    batch.push({
      verse_id: verseId,
      position: position++,
      word_surface: word,
      strong_id: strongId,
      morph_code: morph,
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
