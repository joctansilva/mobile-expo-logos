import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(__dirname, '../data');

export function importTranslations(db: Database.Database) {
  importKjv(db);
  importAcf(db);
}

// ─── KJV — scrollmapper/bible_databases/sqlite/t_kjv.db ──────────────────────
function importKjv(db: Database.Database) {
  const kjvPath = path.join(DATA_DIR, 'bible_databases/sqlite/t_kjv.db');

  if (!fs.existsSync(kjvPath)) {
    console.warn('  ! KJV não encontrado. Clone:');
    console.warn('    git clone --depth 1 https://github.com/scrollmapper/bible_databases.git scripts/data/bible_databases');
    return;
  }

  const src = new Database(kjvPath, { readonly: true });

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO verses (id, book_id, chapter, verse, translation, text)
    VALUES (@id, @book_id, @chapter, @verse, @translation, @text)
  `);

  const rows = src.prepare('SELECT b, c, v, t FROM t_kjv ORDER BY b, c, v').all() as {
    b: number; c: number; v: number; t: string;
  }[];

  const insertAll = db.transaction(() => {
    for (const row of rows) {
      stmt.run({
        id: row.b * 1_000_000 + row.c * 1_000 + row.v,
        book_id: row.b,
        chapter: row.c,
        verse: row.v,
        translation: 'KJV',
        // Texto KJV no scrollmapper tem números Strong inline: "In H7225 the beginning..."
        // Remover: H/G seguido de dígitos
        text: row.t.replace(/\b[HG]\d+\b/g, '').replace(/\s{2,}/g, ' ').trim(),
      });
    }
  });

  insertAll();
  src.close();
  console.log(`  → ${rows.length} versículos KJV`);
}

// ─── ACF — Almeida Corrigida Fiel (domínio público) ──────────────────────────
// Suporta dois formatos:
//   1. SQLite scrollmapper (t_acf.db ou t_bra.db) — preferido
//   2. CSV com colunas: book_id,chapter,verse,text
function importAcf(db: Database.Database) {
  // Tentar SQLite scrollmapper primeiro
  for (const filename of ['t_acf.db', 't_bra.db', 't_almeida.db']) {
    const dbPath = path.join(DATA_DIR, 'bible_databases/sqlite', filename);
    if (fs.existsSync(dbPath)) {
      importAcfFromSqlite(db, dbPath);
      return;
    }
  }

  // Tentar CSV (eBible.org ou outro)
  const csvPath = path.join(DATA_DIR, 'acf.csv');
  if (fs.existsSync(csvPath)) {
    importAcfFromCsv(db, csvPath);
    return;
  }

  console.warn('  ! ACF não encontrado. Opções:');
  console.warn('    1. Verificar se bible_databases tem t_acf.db ou t_bra.db');
  console.warn('    2. Baixar CSV de https://ebible.org e salvar em scripts/data/acf.csv');
  console.warn('       Formato esperado: book_id,chapter,verse,text (sem cabeçalho)');
}

function importAcfFromSqlite(db: Database.Database, srcPath: string) {
  const src = new Database(srcPath, { readonly: true });

  // Detectar nome da tabela (scrollmapper usa t_[abbrev])
  const tables = src
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't_%'`)
    .all() as { name: string }[];

  if (!tables.length) {
    console.warn(`  ! Nenhuma tabela t_* encontrada em ${path.basename(srcPath)}`);
    src.close();
    return;
  }

  const tableName = tables[0].name;
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO verses (id, book_id, chapter, verse, translation, text)
    VALUES (@id, @book_id, @chapter, @verse, @translation, @text)
  `);

  const rows = src.prepare(`SELECT b, c, v, t FROM ${tableName} ORDER BY b, c, v`).all() as {
    b: number; c: number; v: number; t: string;
  }[];

  const insertAll = db.transaction(() => {
    for (const row of rows) {
      stmt.run({
        id: row.b * 1_000_000 + row.c * 1_000 + row.v,
        book_id: row.b,
        chapter: row.c,
        verse: row.v,
        translation: 'ACF',
        text: row.t.trim(),
      });
    }
  });

  insertAll();
  src.close();
  console.log(`  → ${rows.length} versículos ACF (fonte: ${path.basename(srcPath)})`);
}

function importAcfFromCsv(db: Database.Database, csvPath: string) {
  const lines = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(Boolean);

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO verses (id, book_id, chapter, verse, translation, text)
    VALUES (@id, @book_id, @chapter, @verse, @translation, @text)
  `);

  let count = 0;
  const insertAll = db.transaction(() => {
    for (const line of lines) {
      // Formato: book_id,chapter,verse,text
      // Texto pode conter vírgulas — split no máximo 3 campos
      const commaIdx = [
        line.indexOf(','),
        line.indexOf(',', line.indexOf(',') + 1),
        line.indexOf(',', line.indexOf(',', line.indexOf(',') + 1) + 1),
      ];
      if (commaIdx[2] === -1) continue;

      const bookId = parseInt(line.slice(0, commaIdx[0]), 10);
      const chapter = parseInt(line.slice(commaIdx[0] + 1, commaIdx[1]), 10);
      const verse = parseInt(line.slice(commaIdx[1] + 1, commaIdx[2]), 10);
      const text = line.slice(commaIdx[2] + 1).trim().replace(/^"|"$/g, '');

      if (isNaN(bookId) || isNaN(chapter) || isNaN(verse) || !text) continue;

      stmt.run({
        id: bookId * 1_000_000 + chapter * 1_000 + verse,
        book_id: bookId,
        chapter,
        verse,
        translation: 'ACF',
        text,
      });
      count++;
    }
  });

  insertAll();
  console.log(`  → ${count} versículos ACF (fonte: CSV)`);
}
