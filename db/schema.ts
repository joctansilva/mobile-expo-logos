import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';

// ─── CONTEÚDO BÍBLICO ────────────────────────────────────────────────────────

export const books = sqliteTable('books', {
  id: integer('id').primaryKey(),           // 1–66
  name_pt: text('name_pt').notNull(),       // "Gênesis"
  name_en: text('name_en').notNull(),       // "Genesis"
  abbreviation: text('abbreviation').notNull(), // "Gn"
  testament: text('testament').notNull(),   // 'OT' | 'NT'
  total_chapters: integer('total_chapters').notNull(),
});

export const verses = sqliteTable(
  'verses',
  {
    id: integer('id').primaryKey(),         // ex: 1001001 = Gn 1:1
    book_id: integer('book_id').notNull(),
    chapter: integer('chapter').notNull(),
    verse: integer('verse').notNull(),
    translation: text('translation').notNull(), // 'ARA'|'ACF'|'KJV'|'LXX'
    text: text('text').notNull(),
  },
  (t) => [
    uniqueIndex('uniq_verse').on(t.book_id, t.chapter, t.verse, t.translation),
    index('idx_verses_book').on(t.book_id, t.chapter),
    index('idx_verses_translation').on(t.translation),
  ],
);

// ─── STRONG ──────────────────────────────────────────────────────────────────

export const strongEntries = sqliteTable('strong_entries', {
  id: text('id').primaryKey(),              // 'H7225' | 'G3056'
  language: text('language').notNull(),     // 'H' | 'G'
  original_word: text('original_word').notNull(),
  transliteration: text('transliteration').notNull(),
  pronunciation: text('pronunciation'),
  definition_pt: text('definition_pt'),     // Fase 2: traduzir via API
  definition_en: text('definition_en').notNull(),
  kjv_usage: text('kjv_usage'),             // JSON array: ["word","saying",...]
  root_words: text('root_words'),           // JSON array: ["H7223",...]
  occurrence_count: integer('occurrence_count').default(0),
});

export const verseTokens = sqliteTable(
  'verse_tokens',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    verse_id: integer('verse_id').notNull(),
    position: integer('position').notNull(),
    word_surface: text('word_surface').notNull(), // Palavra como aparece no texto PT
    strong_id: text('strong_id'),                 // FK -> strong_entries.id (nullable)
    morph_code: text('morph_code'),               // ex: 'V-AAI-3S', 'N-NSM'
    original_word: text('original_word'),         // Palavra no hebraico/grego
  },
  (t) => [
    index('idx_tokens_verse').on(t.verse_id),
    index('idx_tokens_strong').on(t.strong_id),
  ],
);

// ─── LXX (Septuaginta) ───────────────────────────────────────────────────────
// Tokens do AT em grego (Swete 1930 — domínio público)
// Strong G5625+ para palavras exclusivas da LXX não presentes no NT

export const lxxTokens = sqliteTable(
  'lxx_tokens',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    verse_id: integer('verse_id').notNull(), // FK -> verses.id (translation='LXX')
    position: integer('position').notNull(),
    greek_word: text('greek_word').notNull(),
    strong_id: text('strong_id'),
    morph_code: text('morph_code'),
  },
  (t) => [
    index('idx_lxx_verse').on(t.verse_id),
    index('idx_lxx_strong').on(t.strong_id),
  ],
);

// ─── USUÁRIO (user.db — sincronizado com Supabase) ───────────────────────────

export const highlights = sqliteTable('highlights', {
  id: text('id').primaryKey(),              // UUID v4
  verse_id: integer('verse_id').notNull(),
  color: text('color').notNull(),           // 'yellow'|'green'|'blue'|'pink'
  created_at: text('created_at').notNull(),
  synced: integer('synced').default(0),     // 0=pendente, 1=sincronizado
});

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  verse_id: integer('verse_id').notNull(),
  content: text('content').notNull(),
  updated_at: text('updated_at').notNull(),
  synced: integer('synced').default(0),
});

export const readingProgress = sqliteTable('reading_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  book_id: integer('book_id').notNull(),
  last_chapter: integer('last_chapter').notNull().default(1),
  last_verse: integer('last_verse').notNull().default(1),
  updated_at: text('updated_at').notNull(),
});

// ─── FTS5 ────────────────────────────────────────────────────────────────────
// Criada via raw SQL no script de seed — Drizzle não gera virtual tables.
//
// CREATE VIRTUAL TABLE verses_fts USING fts5(
//   text,
//   content='verses',
//   content_rowid='id',
//   tokenize='unicode61'
// );
