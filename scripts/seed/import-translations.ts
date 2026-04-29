import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { BOOK_NAME_EN_MAP } from './utils';

const CSV_DIR = path.resolve(__dirname, '../data/bible_databases/formats/csv');

// Prefixos de ID por tradução (evita colisão de chave primária entre traduções)
// verse.id = TRANSLATION_OFFSET + book_id * 1_000_000 + chapter * 1_000 + verse
// KJV: offset 0           (1001001 … 66150176)
// ACF: offset 1_000_000_000  (1001001001 … 1066150176)
// LXX: offset 2_000_000_000  (2001001001 … 2066150176)
export const TRANSLATION_OFFSET: Record<string, number> = {
  KJV: 0,
  ACF: 1_000_000_000,
  LXX: 2_000_000_000,
};

export function importTranslations(db: Database.Database) {
  importFromCsv(db, 'KJV.csv', 'KJV');
  importFromCsv(db, 'PorBLivre.csv', 'ACF');
}

// Parseia CSV com header "Book,Chapter,Verse,Text"
// Livros usam nomes ingleses por extenso (ex: "Genesis", "1 Kings")
function importFromCsv(db: Database.Database, filename: string, translation: string) {
  const csvPath = path.join(CSV_DIR, filename);

  if (!fs.existsSync(csvPath)) {
    console.warn(`  ! ${filename} não encontrado em ${CSV_DIR}`);
    return;
  }

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO verses (id, book_id, chapter, verse, translation, text)
    VALUES (@id, @book_id, @chapter, @verse, @translation, @text)
  `);

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');

  let count = 0;
  let skipped = 0;

  const insertAll = db.transaction(() => {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parsed = parseCsvLine(line);
      if (!parsed) continue;

      const { book, chapter, verse, text } = parsed;
      const bookId = BOOK_NAME_EN_MAP[book];

      if (!bookId) {
        skipped++;
        continue;
      }

      const offset = TRANSLATION_OFFSET[translation] ?? 0;
      stmt.run({
        id: offset + bookId * 1_000_000 + chapter * 1_000 + verse,
        book_id: bookId,
        chapter,
        verse,
        translation,
        text: text.trim(),
      });
      count++;
    }
  });

  insertAll();
  if (skipped > 0) console.warn(`  ! ${skipped} linhas ignoradas (livros não mapeados)`);
  console.log(`  → ${count.toLocaleString()} versículos ${translation} (fonte: ${filename})`);
}

// Parseia uma linha CSV com possíveis aspas e vírgulas no texto
function parseCsvLine(line: string): { book: string; chapter: number; verse: number; text: string } | null {
  // Formato: Book,Chapter,Verse,Text
  // "Book" pode conter espaços mas não vírgulas
  // "Text" pode conter vírgulas — é tudo após o 3º campo

  // Encontrar as 3 primeiras vírgulas fora de aspas
  const fields: string[] = [];
  let inQuote = false;
  let field = '';
  let fieldCount = 0;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ',' && !inQuote && fieldCount < 3) {
      fields.push(field);
      field = '';
      fieldCount++;
    } else {
      field += ch;
    }
  }
  fields.push(field); // último campo (text)

  if (fields.length < 4) return null;

  const book = fields[0].trim();
  const chapter = parseInt(fields[1].trim(), 10);
  const verse = parseInt(fields[2].trim(), 10);
  const text = fields[3].replace(/^"|"$/g, '').trim();

  if (!book || isNaN(chapter) || isNaN(verse) || !text) return null;

  return { book, chapter, verse, text };
}
