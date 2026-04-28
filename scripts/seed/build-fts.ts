import type Database from 'better-sqlite3';

export function buildFts(db: Database.Database) {
  db.exec(`
    CREATE VIRTUAL TABLE verses_fts USING fts5(
      text,
      content='verses',
      content_rowid='id',
      tokenize='unicode61 remove_diacritics 1'
    );

    INSERT INTO verses_fts(rowid, text)
    SELECT id, text FROM verses;
  `);

  const count = (db.prepare('SELECT count(*) as n FROM verses_fts').get() as any).n;
  console.log(`  → FTS5: ${count.toLocaleString()} entradas indexadas`);
}
