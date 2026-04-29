import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { importBooks } from './import-books';
import { importStrongs } from './import-strongs';
import { importTranslations } from './import-translations';
import { importTokens } from './import-tokens';
import { importLxx } from './import-lxx';
import { buildFts } from './build-fts';

const OUTPUT_PATH = path.resolve(__dirname, '../../assets/db/bible.db');

async function main() {
  const start = Date.now();
  console.log('\n📖 Logós — Build do bible.db');
  console.log('─'.repeat(50));

  // Garantir que o diretório de saída existe
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  // Remover banco anterior
  if (fs.existsSync(OUTPUT_PATH)) {
    fs.unlinkSync(OUTPUT_PATH);
    console.log('  → Banco anterior removido');
  }

  const db = new Database(OUTPUT_PATH);

  // Otimizações de performance para import em batch
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = OFF');
  db.pragma('cache_size = -65536'); // 64MB
  db.pragma('temp_store = MEMORY');
  db.pragma('mmap_size = 268435456'); // 256MB
  // Desabilitar FK checks durante o seed: tokens podem referenciar versículos
  // de variantes textuais não presentes nas traduções importadas
  db.pragma('foreign_keys = OFF');

  console.log('\n1/7 Criando schema...');
  createSchema(db);

  console.log('2/7 Importando livros (66)...');
  importBooks(db);

  console.log("3/7 Importando Strong's (hebraico + grego)...");
  await importStrongs(db);

  console.log('4/7 Importando traduções (KJV + ACF)...');
  importTranslations(db);

  console.log('5/7 Importando tokens TAHOT + TAGNT...');
  await importTokens(db);

  console.log('6/7 Importando LXX Swete 1930...');
  await importLxx(db);

  console.log('7/7 Construindo índice FTS5...');
  buildFts(db);

  // Restaurar sync e otimizar
  db.pragma('synchronous = NORMAL');
  db.pragma('optimize');
  db.exec('VACUUM');

  db.close();

  const stats = fs.statSync(OUTPUT_PATH);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('\n' + '─'.repeat(50));
  console.log(`✅ bible.db criado com sucesso!`);
  console.log(`   Tamanho: ${sizeMB} MB`);
  console.log(`   Tempo:   ${elapsed}s`);
  console.log(`   Local:   ${OUTPUT_PATH}`);
  console.log('─'.repeat(50) + '\n');
}

function createSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE books (
      id              INTEGER PRIMARY KEY,
      name_pt         TEXT NOT NULL,
      name_en         TEXT NOT NULL,
      abbreviation    TEXT NOT NULL,
      testament       TEXT NOT NULL,
      total_chapters  INTEGER NOT NULL
    );

    CREATE TABLE verses (
      id          INTEGER PRIMARY KEY,
      book_id     INTEGER NOT NULL,
      chapter     INTEGER NOT NULL,
      verse       INTEGER NOT NULL,
      translation TEXT NOT NULL,
      text        TEXT NOT NULL,
      UNIQUE(book_id, chapter, verse, translation)
    );
    CREATE INDEX idx_verses_book        ON verses(book_id, chapter);
    CREATE INDEX idx_verses_translation ON verses(translation);

    CREATE TABLE strong_entries (
      id              TEXT PRIMARY KEY,
      language        TEXT NOT NULL,
      original_word   TEXT NOT NULL,
      transliteration TEXT NOT NULL,
      pronunciation   TEXT,
      definition_en   TEXT NOT NULL,
      kjv_usage       TEXT,
      root_words      TEXT,
      occurrence_count INTEGER DEFAULT 0
    );

    CREATE TABLE verse_tokens (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_id      INTEGER NOT NULL,
      position      INTEGER NOT NULL,
      word_surface  TEXT NOT NULL,
      strong_id     TEXT,
      morph_code    TEXT,
      original_word TEXT,
      FOREIGN KEY(verse_id) REFERENCES verses(id)
    );
    CREATE INDEX idx_tokens_verse  ON verse_tokens(verse_id);
    CREATE INDEX idx_tokens_strong ON verse_tokens(strong_id);

    CREATE TABLE lxx_tokens (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_id    INTEGER NOT NULL,
      position    INTEGER NOT NULL,
      greek_word  TEXT NOT NULL,
      strong_id   TEXT,
      morph_code  TEXT,
      FOREIGN KEY(verse_id) REFERENCES verses(id)
    );
    CREATE INDEX idx_lxx_verse  ON lxx_tokens(verse_id);
    CREATE INDEX idx_lxx_strong ON lxx_tokens(strong_id);
  `);
}

main().catch((err) => {
  console.error('\n❌ Erro no seed:', err);
  process.exit(1);
});
