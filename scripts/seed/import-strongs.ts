import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(__dirname, '../data/strongs');

interface StrongsEntry {
  lemma?: string;
  xlit?: string;
  pron?: string;
  derivation?: string;
  strongs_def?: string;
  kjv_def?: string;
}

export async function importStrongs(db: Database.Database) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO strong_entries
      (id, language, original_word, transliteration, pronunciation,
       definition_en, kjv_usage, root_words, occurrence_count)
    VALUES
      (@id, @language, @original_word, @transliteration, @pronunciation,
       @definition_en, @kjv_usage, @root_words, @occurrence_count)
  `);

  const insertBatch = db.transaction((entries: ReturnType<typeof parseEntry>[]) => {
    for (const e of entries) stmt.run(e);
  });

  // ─── Hebraico ───────────────────────────────────────────────────────────────
  const hebrewPath = path.join(DATA_DIR, 'Hebrew/strongs-hebrew-dictionary.js');
  if (!fs.existsSync(hebrewPath)) {
    console.warn(`  ! Hebraico não encontrado: ${hebrewPath}`);
    console.warn('    Clone: git clone --depth 1 https://github.com/openscriptures/strongs.git scripts/data/strongs');
  } else {
    const raw = fs.readFileSync(hebrewPath, 'utf-8');
    const data = parseStrongsJs(raw);
    const entries = Object.entries(data).map(([key, val]) =>
      parseEntry(`H${key}`, 'H', val as StrongsEntry)
    );
    insertBatch(entries);
    console.log(`  → ${entries.length} entradas Strong hebraico (H)`);
  }

  // ─── Grego ──────────────────────────────────────────────────────────────────
  const greekPath = path.join(DATA_DIR, 'Greek/strongs-greek-dictionary.js');
  if (!fs.existsSync(greekPath)) {
    console.warn(`  ! Grego não encontrado: ${greekPath}`);
  } else {
    const raw = fs.readFileSync(greekPath, 'utf-8');
    const data = parseStrongsJs(raw);
    const entries = Object.entries(data).map(([key, val]) =>
      parseEntry(`G${key}`, 'G', val as StrongsEntry)
    );
    insertBatch(entries);
    console.log(`  → ${entries.length} entradas Strong grego (G)`);
  }
}

// Extrai o objeto JSON do arquivo JS (formato: "var name = {...};")
function parseStrongsJs(raw: string): Record<string, unknown> {
  // Remove "var nome_da_variavel = " do início e ";" do fim
  const jsonStr = raw
    .replace(/^\s*var\s+\w+\s*=\s*/, '')
    .replace(/\s*;\s*$/, '')
    .trim();
  return JSON.parse(jsonStr);
}

function parseEntry(id: string, language: 'H' | 'G', val: StrongsEntry) {
  const definition = val.strongs_def || val.derivation || '';
  const kjvUsages = val.kjv_def
    ? JSON.stringify(
        val.kjv_def
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean)
      )
    : null;

  return {
    id,
    language,
    original_word: val.lemma || '',
    transliteration: val.xlit || '',
    pronunciation: val.pron || null,
    definition_en: definition,
    kjv_usage: kjvUsages,
    root_words: null,
    occurrence_count: 0,
  };
}
