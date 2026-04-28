# λόγος Logós — Guia de Implementação Detalhado

**Passo a passo completo do zero ao MVP**
_Expo SDK 54 · React Native 0.81 · React 19 · TypeScript_

---

## Índice

1. [Estado Atual do Projeto](#1-estado-atual-do-projeto)
2. [Fase 0 — Fundação do Projeto](#2-fase-0--fundação-do-projeto)
3. [Fase 1 — Banco de Dados Local (Drizzle + SQLite)](#3-fase-1--banco-de-dados-local-drizzle--sqlite)
4. [Fase 2 — Aquisição e Seed dos Dados Bíblicos](#4-fase-2--aquisição-e-seed-dos-dados-bíblicos)
5. [Fase 3 — Navegação e Estrutura de Telas](#5-fase-3--navegação-e-estrutura-de-telas)
6. [Fase 4 — Tela de Leitura e Strong](#6-fase-4--tela-de-leitura-e-strong)
7. [Fase 5 — Busca Bíblica (FTS5)](#7-fase-5--busca-bíblica-fts5)
8. [Fase 6 — UI: NativeWind, Temas e Fontes Bíblicas](#8-fase-6--ui-nativewind-temas-e-fontes-bíblicas)
9. [Fase 7 — Auth e Sincronização (Supabase)](#9-fase-7--auth-e-sincronização-supabase)
10. [Fase 8 — CI/CD com EAS e GitHub Actions](#10-fase-8--cicd-com-eas-e-github-actions)
11. [Referências e Licenças dos Dados](#11-referências-e-licenças-dos-dados)

---

## 1. Estado Atual do Projeto

## IMPLEMENTADO

### O que já existe

## IMPLEMENTADO

```
mobile-expo-logos/
├── app/
│   ├── _layout.tsx        ← Layout raiz mínimo (apenas <Stack />)
│   └── index.tsx          ← Placeholder vazio
├── app.json               ← Configurado: projectId EAS, newArchEnabled, typedRoutes
├── package.json           ← Expo SDK 54, React Native 0.81, React 19
└── node_modules/
```

### Dependências já instaladas (relevantes)

## IMPLEMENTADO

| Pacote                         | Versão   | Uso                      |
| ------------------------------ | -------- | ------------------------ |
| `expo`                         | ~54.0.33 | SDK base                 |
| `expo-router`                  | ~6.0.23  | Roteamento file-based    |
| `expo-font`                    | ~14.0    | Fontes hebraico/grego    |
| `react-native-reanimated`      | ~4.1.1   | Animações (Bottom Sheet) |
| `react-native-gesture-handler` | ~2.28.0  | Gestos (Bottom Sheet)    |
| `react-native-screens`         | ~4.16.0  | Performance de navegação |

### Configurações importantes já definidas

- **New Architecture habilitada** (`newArchEnabled: true`) — compatível com libs modernas
- **React Compiler** (`reactCompiler: true`) — otimização automática de renders
- **Typed Routes** habilitado — autocomplete para rotas
- **Scheme** `mobileexpologos` — necessário para deep links

---

## 2. Fase 0 — Fundação do Projeto

### 2.1 Instalar dependências de produção

## IMPLEMENTADO

```bash
# Banco de dados local
pnpm add expo-sqlite drizzle-orm expo-file-system

# State management
pnpm add zustand @tanstack/react-query @tanstack/react-query-devtools

# UI
pnpm add nativewind
pnpm add @gorhom/bottom-sheet

# Supabase (para auth + sync — instalar agora, usar na Fase 7)
pnpm add @supabase/supabase-js @react-native-async-storage/async-storage

# Utilitários
pnpm add date-fns
```

### 2.2 Instalar dependências de desenvolvimento

```bash
pnpm add -D drizzle-kit
pnpm add -D tailwindcss@3     # NativeWind v4 requer Tailwind v3, não v4
pnpm add -D babel-plugin-module-resolver
pnpm add -D @types/better-sqlite3
pnpm add -D better-sqlite3    # Para scripts de seed (Node.js)
pnpm add -D tsx               # Para rodar scripts TypeScript no Node
```

> **Nota:** `babel-plugin-nativewind` não existe no npm. O plugin Babel do NativeWind v4 está embutido no próprio pacote `nativewind` — a linha `'nativewind/babel'` no `babel.config.js` já o usa diretamente.

### 2.3 Estrutura de pastas — criar toda a hierarquia

Execute no terminal (ou crie manualmente):

```bash
# App / Rotas (Expo Router)
mkdir -p app/\(auth\)
mkdir -p app/\(app\)/\(tabs\)
mkdir -p app/\(app\)/reader
mkdir -p app/\(app\)/strong
mkdir -p app/\(app\)/verse
mkdir -p app/\(app\)/settings

# Features (lógica de negócio por domínio)
mkdir -p features/bible/components
mkdir -p features/bible/hooks
mkdir -p features/bible/store
mkdir -p features/strong/components
mkdir -p features/strong/hooks
mkdir -p features/notes/components
mkdir -p features/notes/hooks
mkdir -p features/search/components
mkdir -p features/search/hooks
mkdir -p features/auth/components
mkdir -p features/auth/hooks

# Banco de dados
mkdir -p db/migrations
mkdir -p db/seed

# Scripts (Node.js — fora do app)
mkdir -p scripts/seed
mkdir -p scripts/data   # Dados baixados dos repos

# Lib / Utilitários
mkdir -p lib

# Assets
mkdir -p assets/fonts
mkdir -p assets/db      # Aqui ficará o bible.db compilado
```

### 2.4 Configurar `tsconfig.json` com path aliases

```jsonc
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@features/*": ["./features/*"],
      "@db/*": ["./db/*"],
      "@lib/*": ["./lib/*"],
    },
  },
}
```

### 2.5 Configurar `babel.config.js` para NativeWind e aliases

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      "nativewind/babel",
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": ".",
            "@features": "./features",
            "@db": "./db",
            "@lib": "./lib",
          },
        },
      ],
    ],
  };
};
```

> **Atenção:** `babel-plugin-module-resolver` precisa ser instalado:
>
> ```bash
> pnpm add -D babel-plugin-module-resolver
> ```

### 2.6 Configurar `tailwind.config.js` para NativeWind v4

```js
// tailwind.config.js
const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      borderWidth: {
        hairline: hairlineWidth(),
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-bold": ["Inter_700Bold"],
        hebrew: ["SBLHebrew"],
        greek: ["SBLGreek"],
      },
      colors: {
        // Paleta do Logós
        primary: {
          50: "#f0f4ff",
          100: "#e0eaff",
          500: "#4F6AF5",
          600: "#3A57E8",
          900: "#1a2b6b",
        },
        sepia: {
          50: "#fdf8f0",
          100: "#faf0dc",
          900: "#5c4a1e",
        },
      },
    },
  },
};
```

### 2.7 Criar arquivo `global.css` (raiz do NativeWind)

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.8 Configurar `metro.config.js` para NativeWind

```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### 2.9 Adicionar `.gitignore` para arquivos grandes

```gitignore
# Ao .gitignore existente, adicionar:

# Banco bíblico compilado (>50MB — usar git-lfs ou regenerar)
assets/db/bible.db
assets/db/bible.db-shm
assets/db/bible.db-wal

# Dados brutos baixados para seed
scripts/data/

# EAS
.expo/
```

> **Opcional — Git LFS para o bible.db:**
> Se quiser versionar o banco (recomendado para evitar rodar seed em cada clone):
>
> ```bash
> git lfs install
> git lfs track "assets/db/*.db"
> git add .gitattributes
> ```

---

## 3. Fase 1 — Banco de Dados Local (Drizzle + SQLite)

### 3.1 Schema Drizzle — `db/schema.ts`

```typescript
// db/schema.ts
import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

// ─── CONTEÚDO BÍBLICO ────────────────────────────────────────────────────────

export const books = sqliteTable("books", {
  id: integer("id").primaryKey(), // 1–66
  name_pt: text("name_pt").notNull(), // "Gênesis"
  name_en: text("name_en").notNull(), // "Genesis"
  abbreviation: text("abbreviation").notNull(), // "Gn"
  testament: text("testament").notNull(), // 'OT' | 'NT'
  total_chapters: integer("total_chapters").notNull(),
});

export const verses = sqliteTable(
  "verses",
  {
    id: integer("id").primaryKey(), // 1001001 = Gn 1:1
    book_id: integer("book_id").notNull(),
    chapter: integer("chapter").notNull(),
    verse: integer("verse").notNull(),
    translation: text("translation").notNull(), // 'ARA'|'ACF'|'KJV'|'LXX'
    text: text("text").notNull(),
  },
  (t) => ({
    uniqVerse: uniqueIndex("uniq_verse").on(
      t.book_id,
      t.chapter,
      t.verse,
      t.translation,
    ),
    byBook: index("idx_verses_book").on(t.book_id, t.chapter),
    byTranslation: index("idx_verses_translation").on(t.translation),
  }),
);

// ─── STRONG ──────────────────────────────────────────────────────────────────

export const strongEntries = sqliteTable("strong_entries", {
  id: text("id").primaryKey(), // 'H7225' | 'G3056'
  language: text("language").notNull(), // 'H' | 'G'
  original_word: text("original_word").notNull(),
  transliteration: text("transliteration").notNull(),
  pronunciation: text("pronunciation"),
  definition_pt: text("definition_pt").notNull(),
  definition_en: text("definition_en"),
  kjv_usage: text("kjv_usage"), // Como KJV traduz (JSON array)
  root_words: text("root_words"), // JSON: ['H7223', ...]
  occurrence_count: integer("occurrence_count").default(0),
});

export const verseTokens = sqliteTable(
  "verse_tokens",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    verse_id: integer("verse_id").notNull(),
    position: integer("position").notNull(), // Ordem da palavra no versículo
    word_surface: text("word_surface").notNull(), // Palavra como aparece no texto
    strong_id: text("strong_id"), // FK -> strong_entries.id (nullable)
    morph_code: text("morph_code"), // Ex: 'V-AAI-3S', 'N-NSM'
    original_word: text("original_word"), // Palavra no original (heb/grego)
  },
  (t) => ({
    byVerse: index("idx_tokens_verse").on(t.verse_id),
    byStrong: index("idx_tokens_strong").on(t.strong_id),
  }),
);

// ─── LXX (Septuaginta) ────────────────────────────────────────────────────────
// Tokens do AT em grego (Swete 1930 — domínio público)
// Numeração LXX: prefixo 'L' (L0001...) para capítulos/versículos próprios da LXX
// Strong da LXX: G5625+ para palavras exclusivas não presentes no NT

export const lxxTokens = sqliteTable(
  "lxx_tokens",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    verse_id: integer("verse_id").notNull(), // FK -> verses.id (translation='LXX')
    position: integer("position").notNull(),
    greek_word: text("greek_word").notNull(), // Palavra grega original
    strong_id: text("strong_id"), // 'G3056' ou 'G5625+' para exclusivos LXX
    morph_code: text("morph_code"),
  },
  (t) => ({
    byVerse: index("idx_lxx_verse").on(t.verse_id),
    byStrong: index("idx_lxx_strong").on(t.strong_id),
  }),
);

// ─── USUÁRIO ──────────────────────────────────────────────────────────────────

export const highlights = sqliteTable("highlights", {
  id: text("id").primaryKey(), // UUID v4
  verse_id: integer("verse_id").notNull(),
  color: text("color").notNull(), // 'yellow'|'green'|'blue'|'pink'
  created_at: text("created_at").notNull(),
  synced: integer("synced").default(0), // 0=pendente, 1=sincronizado
});

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  verse_id: integer("verse_id").notNull(),
  content: text("content").notNull(),
  updated_at: text("updated_at").notNull(),
  synced: integer("synced").default(0),
});

export const readingProgress = sqliteTable("reading_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  book_id: integer("book_id").notNull(),
  last_chapter: integer("last_chapter").notNull().default(1),
  last_verse: integer("last_verse").notNull().default(1),
  updated_at: text("updated_at").notNull(),
});

// ─── FTS5 (Full-Text Search) ─────────────────────────────────────────────────
// Criada via raw SQL no seed — Drizzle ainda não gera FTS automaticamente
// CREATE VIRTUAL TABLE verses_fts USING fts5(
//   verse_id UNINDEXED,
//   text,
//   content='verses',
//   content_rowid='id'
// );
```

### 3.2 Configurar Drizzle Kit — `drizzle.config.ts`

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  driver: "expo", // Driver específico para expo-sqlite
} satisfies Config;
```

### 3.3 Cliente do banco — `db/client.ts`

```typescript
// db/client.ts
import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

// O banco principal é read-only (conteúdo bíblico pré-populado)
// O banco de usuário é separado para evitar conflitos em updates
const bibleSQLite = SQLite.openDatabaseSync("bible.db", {
  enableChangeListener: true,
});
const userSQLite = SQLite.openDatabaseSync("user.db", {
  enableChangeListener: true,
});

export const bibleDb = drizzle(bibleSQLite, { schema });
export const userDb = drizzle(userSQLite, { schema });

export type BibleDb = typeof bibleDb;
export type UserDb = typeof userDb;
```

> **Decisão: dois bancos separados**
> `bible.db` — somente leitura, gerado em build-time, nunca modificado pelo usuário.
> `user.db` — anotações, destaques, progresso. Pode ser recriado sem perder dados do usuário.

### 3.4 Provider de banco — `db/provider.tsx`

```tsx
// db/provider.tsx
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { userDb } from "./client";
import migrations from "./migrations/migrations";

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(userDb, migrations);

  if (error) throw error;
  if (!success) return null; // Splash screen cobre isso

  return <>{children}</>;
}
```

### 3.5 Gerar migrações iniciais

```bash
pnpm drizzle-kit generate
```

Isso cria `db/migrations/0000_initial.sql` com o DDL completo.

### 3.6 Scripts no `package.json`

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio",
    "seed": "tsx scripts/seed/index.ts",
    "seed:strongs": "tsx scripts/seed/import-strongs.ts",
    "seed:translations": "tsx scripts/seed/import-translations.ts",
    "seed:tokens": "tsx scripts/seed/import-tokens.ts",
    "seed:lxx": "tsx scripts/seed/import-lxx.ts"
  }
}
```

---

## 4. Fase 2 — Aquisição e Seed dos Dados Bíblicos

Esta fase acontece **fora do app**, em Node.js puro. O resultado é o arquivo `assets/db/bible.db`.

### 4.1 Repositórios de dados — baixar manualmente

```bash
cd scripts/data

# 1. Strong's Dictionary (Public Domain)
git clone --depth 1 https://github.com/openscriptures/strongs.git

# 2. Bible databases com KJV + Strong numbers em SQLite (Public Domain)
git clone --depth 1 https://github.com/scrollmapper/bible_databases.git

# 3. STEPBible — Hebraico (TAHOT) e Grego NT (TAGNT) tageados com Strong (CC BY 4.0)
git clone --depth 1 https://github.com/STEPBible/STEPBible-Data.git

# 4. LXX Swete 1930 — Septuaginta domínio público com Strong
git clone --depth 1 https://github.com/eliranwong/LXX-Swete-1930.git

# 5. Bíblia em português (ACF e ARA)
# Baixar de https://eBible.org — arquivos USFM/CSV
# ACF (Almeida Corrigida Fiel): domínio público
# ARA (Almeida Revista e Atualizada): verificar licença antes do comercial
```

> **Nota sobre ARA:** A ARA (Almeida Revista e Atualizada) da SBB pode ter restrições para uso comercial. Para MVP seguro, usar ACF (Almeida Corrigida Fiel) que é inequivocamente domínio público. Adicionar ARA após confirmar licença.

### 4.2 Estrutura dos dados por repositório

#### `scrollmapper/bible_databases`

```
bible_databases/
├── sqlite/
│   └── t_kjv.db          ← SQLite com KJV + Strong numbers por versículo
├── json/
│   └── t_kjv.json
└── csv/
    └── t_kjv.csv
```

Schema do `t_kjv.db`:

```sql
-- Tabela: t_kjv
b  -- book number (1-66)
c  -- chapter
v  -- verse
t  -- text (com números Strong inline, ex: "In H7225 the beginning...")
```

#### `openscriptures/strongs`

```
strongs/
├── Hebrew/
│   ├── StrongsHebrewDictionary.xml
│   └── strongs-hebrew-dictionary.js  ← mais fácil de parsear
└── Greek/
    ├── StrongsGreekDictionary.xml
    └── strongs-greek-dictionary.js
```

#### `STEPBible/STEPBible-Data`

```
STEPBible-Data/
├── Tagged-Bibles/
│   ├── TAHOT - TanakhAndHebrew.txt    ← AT hebraico com Strong
│   └── TAGNT - GreekNT.txt           ← NT grego com Strong
```

Formato TSV — cada linha é uma palavra com campos:

```
Ref    OT-Text  Lemma  StrongNum  MorphCode  ...
Gen.1.1  בְּרֵאשִׁ֖ית  רֵאשִׁית  H7225  HNcfsa  ...
```

#### `eliranwong/LXX-Swete-1930`

```
LXX-Swete-1930/
└── data/
    └── *.tsv    ← texto grego com Strong por versículo
```

### 4.3 Script principal de seed — `scripts/seed/index.ts`

```typescript
// scripts/seed/index.ts
import Database from "better-sqlite3";
import path from "path";
import { importBooks } from "./import-books";
import { importStrongs } from "./import-strongs";
import { importTranslations } from "./import-translations";
import { importTokens } from "./import-tokens";
import { importLxx } from "./import-lxx";
import { buildFts } from "./build-fts";

const OUTPUT_PATH = path.resolve(__dirname, "../../assets/db/bible.db");

async function main() {
  console.log("🔨 Iniciando build do bible.db...");

  // Remove banco anterior
  const fs = await import("fs");
  if (fs.existsSync(OUTPUT_PATH)) fs.unlinkSync(OUTPUT_PATH);

  const db = new Database(OUTPUT_PATH);

  // Performance: desabilitar sync durante import
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = OFF");
  db.pragma("cache_size = -64000"); // 64MB cache

  console.log("📚 Criando schema...");
  createSchema(db);

  console.log("📖 Importando livros...");
  importBooks(db);

  console.log("💪 Importando Strong's...");
  await importStrongs(db);

  console.log("🇧🇷 Importando traduções (ACF, KJV)...");
  await importTranslations(db);

  console.log("🔗 Importando tokens Strong (TAHOT + TAGNT)...");
  await importTokens(db);

  console.log("📜 Importando LXX Swete...");
  await importLxx(db);

  console.log("🔍 Construindo índice FTS5...");
  buildFts(db);

  // Re-habilitar sync
  db.pragma("synchronous = NORMAL");
  db.pragma("optimize");

  const stats = fs.statSync(OUTPUT_PATH);
  console.log(`✅ bible.db criado: ${(stats.size / 1024 / 1024).toFixed(1)}MB`);
  db.close();
}

function createSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE books (
      id INTEGER PRIMARY KEY,
      name_pt TEXT NOT NULL,
      name_en TEXT NOT NULL,
      abbreviation TEXT NOT NULL,
      testament TEXT NOT NULL,
      total_chapters INTEGER NOT NULL
    );

    CREATE TABLE verses (
      id INTEGER PRIMARY KEY,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      translation TEXT NOT NULL,
      text TEXT NOT NULL,
      UNIQUE(book_id, chapter, verse, translation)
    );

    CREATE INDEX idx_verses_book ON verses(book_id, chapter);
    CREATE INDEX idx_verses_translation ON verses(translation);

    CREATE TABLE strong_entries (
      id TEXT PRIMARY KEY,
      language TEXT NOT NULL,
      original_word TEXT NOT NULL,
      transliteration TEXT NOT NULL,
      pronunciation TEXT,
      definition_pt TEXT NOT NULL,
      definition_en TEXT,
      kjv_usage TEXT,
      root_words TEXT,
      occurrence_count INTEGER DEFAULT 0
    );

    CREATE TABLE verse_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      word_surface TEXT NOT NULL,
      strong_id TEXT,
      morph_code TEXT,
      original_word TEXT,
      FOREIGN KEY(verse_id) REFERENCES verses(id)
    );

    CREATE INDEX idx_tokens_verse ON verse_tokens(verse_id);
    CREATE INDEX idx_tokens_strong ON verse_tokens(strong_id);

    CREATE TABLE lxx_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      greek_word TEXT NOT NULL,
      strong_id TEXT,
      morph_code TEXT,
      FOREIGN KEY(verse_id) REFERENCES verses(id)
    );

    CREATE INDEX idx_lxx_verse ON lxx_tokens(verse_id);
    CREATE INDEX idx_lxx_strong ON lxx_tokens(strong_id);
  `);
}

main().catch(console.error);
```

### 4.4 Importar livros — `scripts/seed/import-books.ts`

```typescript
// scripts/seed/import-books.ts
import Database from "better-sqlite3";

const BOOKS = [
  // AT — Old Testament (1-39)
  {
    id: 1,
    name_pt: "Gênesis",
    name_en: "Genesis",
    abbr: "Gn",
    testament: "OT",
    chapters: 50,
  },
  {
    id: 2,
    name_pt: "Êxodo",
    name_en: "Exodus",
    abbr: "Êx",
    testament: "OT",
    chapters: 40,
  },
  // ... todos os 66 livros
  // NT — New Testament (40-66, mapeando para 40-66)
  {
    id: 40,
    name_pt: "Mateus",
    name_en: "Matthew",
    abbr: "Mt",
    testament: "NT",
    chapters: 28,
  },
  {
    id: 66,
    name_pt: "Apocalipse",
    name_en: "Revelation",
    abbr: "Ap",
    testament: "NT",
    chapters: 22,
  },
];

export function importBooks(db: Database.Database) {
  const stmt = db.prepare(
    `INSERT INTO books VALUES (@id, @name_pt, @name_en, @abbreviation, @testament, @total_chapters)`,
  );
  const insertMany = db.transaction((books: typeof BOOKS) => {
    for (const book of books) {
      stmt.run({
        id: book.id,
        name_pt: book.name_pt,
        name_en: book.name_en,
        abbreviation: book.abbr,
        testament: book.testament,
        total_chapters: book.chapters,
      });
    }
  });
  insertMany(BOOKS);
}
```

> **Atenção:** Criar a lista completa dos 66 livros. Ver referência completa em `lib/constants/books.ts`.

### 4.5 Importar Strong's — `scripts/seed/import-strongs.ts`

```typescript
// scripts/seed/import-strongs.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const STRONGS_DATA = path.resolve(__dirname, "../data/strongs");

export async function importStrongs(db: Database.Database) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO strong_entries
    (id, language, original_word, transliteration, pronunciation,
     definition_pt, definition_en, kjv_usage, root_words, occurrence_count)
    VALUES (@id, @language, @original_word, @transliteration, @pronunciation,
            @definition_pt, @definition_en, @kjv_usage, @root_words, @occurrence_count)
  `);

  const insertMany = db.transaction((entries: any[]) => {
    for (const entry of entries) stmt.run(entry);
  });

  // Hebraico
  const hebrewPath = path.join(
    STRONGS_DATA,
    "Hebrew/strongs-hebrew-dictionary.js",
  );
  const hebrewRaw = fs.readFileSync(hebrewPath, "utf-8");
  // O arquivo exporta um objeto — parsear removendo o prefixo de módulo
  const hebrewData = JSON.parse(
    hebrewRaw.replace(/^.*?=\s*/, "").replace(/;\s*$/, ""),
  );

  const hebrewEntries = Object.entries(hebrewData).map(
    ([key, val]: [string, any]) => ({
      id: `H${key}`,
      language: "H",
      original_word: val.lemma || "",
      transliteration: val.xlit || "",
      pronunciation: val.pron || null,
      definition_pt: translateDefinition(
        val.derivation || val.strongs_def || "",
      ),
      definition_en: val.strongs_def || val.derivation || "",
      kjv_usage: val.kjv_def
        ? JSON.stringify(val.kjv_def.split(",").map((s: string) => s.trim()))
        : null,
      root_words: null,
      occurrence_count: 0,
    }),
  );

  insertMany(hebrewEntries);
  console.log(`  → ${hebrewEntries.length} entradas hebraicas`);

  // Grego (mesma lógica)
  const greekPath = path.join(
    STRONGS_DATA,
    "Greek/strongs-greek-dictionary.js",
  );
  // ... mesma lógica para grego com prefix 'G'
}

function translateDefinition(en: string): string {
  // Para MVP: usar definição em inglês com nota
  // Fase 2: traduzir via API ou usar glossário pré-traduzido
  return en;
}
```

> **Nota:** Para o MVP, as definições Strong ficam em inglês. A tradução completa para português é um trabalho de fase posterior — pode ser feita via batch na API da Anthropic (claude-haiku-4-5 para custo baixo) e cacheada no banco.

### 4.6 Importar traduções — `scripts/seed/import-translations.ts`

```typescript
// scripts/seed/import-translations.ts
import Database from "better-sqlite3";
import path from "path";
import SourceDb from "better-sqlite3";

export async function importTranslations(db: Database.Database) {
  // KJV via scrollmapper
  importKjv(db);
  // ACF via eBible (converter de USFM para SQL previamente)
  importAcf(db);
}

function importKjv(db: Database.Database) {
  const src = new SourceDb(
    path.resolve(__dirname, "../data/bible_databases/sqlite/t_kjv.db"),
    { readonly: true },
  );

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO verses (id, book_id, chapter, verse, translation, text)
    VALUES (@id, @book_id, @chapter, @verse, @translation, @text)
  `);

  const rows = src.prepare("SELECT b, c, v, t FROM t_kjv").all() as any[];

  const insertMany = db.transaction((rows: any[]) => {
    for (const row of rows) {
      stmt.run({
        id: row.b * 1000000 + row.c * 1000 + row.v,
        book_id: row.b,
        chapter: row.c,
        verse: row.v,
        translation: "KJV",
        // Remover tags Strong inline do texto (ex: "In H7225 the..." → "In the...")
        text: row.t
          .replace(/[HG]\d+/g, "")
          .replace(/\s+/g, " ")
          .trim(),
      });
    }
  });

  insertMany(rows);
  console.log(`  → ${rows.length} versículos KJV`);
  src.close();
}
```

### 4.7 Importar tokens TAHOT/TAGNT — `scripts/seed/import-tokens.ts`

Este é o step mais crítico: mapeia cada palavra das traduções para o Strong.

```typescript
// scripts/seed/import-tokens.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// O STEPBible usa formato TSV com colunas delimitadas por tab
// Ref  OT-Text  Lemma  StrongNum  MorphCode  ...
// Gen.1.1  בְּרֵאשִׁ֖ית  רֵאשִׁית  H7225  HNcfsa

export async function importTokens(db: Database.Database) {
  const stmt = db.prepare(`
    INSERT INTO verse_tokens
    (verse_id, position, word_surface, strong_id, morph_code, original_word)
    VALUES (@verse_id, @position, @word_surface, @strong_id, @morph_code, @original_word)
  `);

  // AT — Hebraico
  const tahotPath = path.resolve(
    __dirname,
    "../data/STEPBible-Data/Tagged-Bibles/TAHOT - TanakhAndHebrew.txt",
  );
  parseTsvAndInsert(db, stmt, tahotPath, "OT");

  // NT — Grego
  const tagntPath = path.resolve(
    __dirname,
    "../data/STEPBible-Data/Tagged-Bibles/TAGNT - GreekNT.txt",
  );
  parseTsvAndInsert(db, stmt, tagntPath, "NT");
}

function parseTsvAndInsert(
  db: Database.Database,
  stmt: Database.Statement,
  filePath: string,
  testament: "OT" | "NT",
) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content
    .split("\n")
    .filter((l) => !l.startsWith("#") && l.trim());

  let currentRef = "";
  let position = 0;
  const batch: any[] = [];

  for (const line of lines) {
    const cols = line.split("\t");
    // Formato: Ref | Word | Lemma | StrongNum | Morph | ...
    const [ref, word, , strongRaw, morph] = cols;

    if (!ref || !word) continue;

    if (ref !== currentRef) {
      currentRef = ref;
      position = 0;
    }

    // Converter ref "Gen.1.1" → verse_id 1001001
    const verseId = refToId(ref);
    if (!verseId) continue;

    const strongId = normalizeStrongId(strongRaw);

    batch.push({
      verse_id: verseId,
      position: position++,
      word_surface: word,
      strong_id: strongId,
      morph_code: morph || null,
      original_word: word,
    });

    if (batch.length >= 1000) {
      const insert = db.transaction((b: any[]) =>
        b.forEach((r) => stmt.run(r)),
      );
      insert(batch);
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    const insert = db.transaction((b: any[]) => b.forEach((r) => stmt.run(r)));
    insert(batch);
  }
}

function refToId(ref: string): number | null {
  // "Gen.1.1" → 1001001, "Rev.22.21" → 66022021
  const BOOK_MAP: Record<string, number> = {
    Gen: 1,
    Exo: 2,
    Lev: 3,
    Num: 4,
    Deu: 5,
    // ... todos os livros
    Mat: 40,
    Mar: 41,
    Luk: 42,
    Joh: 43,
    Rev: 66,
  };

  const parts = ref.split(".");
  if (parts.length < 3) return null;

  const bookId = BOOK_MAP[parts[0]];
  if (!bookId) return null;

  const chapter = parseInt(parts[1]);
  const verse = parseInt(parts[2]);

  return bookId * 1000000 + chapter * 1000 + verse;
}

function normalizeStrongId(raw: string): string | null {
  if (!raw || raw === "---") return null;
  // Normalizar: "H7225a" → "H7225", "G3056" → "G3056"
  return raw.replace(/[a-z]$/, "").trim() || null;
}
```

### 4.8 Importar LXX — `scripts/seed/import-lxx.ts`

```typescript
// scripts/seed/import-lxx.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import glob from "glob";

export async function importLxx(db: Database.Database) {
  const dataPath = path.resolve(__dirname, "../data/LXX-Swete-1930/data");
  const files = glob.sync("*.tsv", { cwd: dataPath });

  const verseStmt = db.prepare(`
    INSERT OR IGNORE INTO verses (id, book_id, chapter, verse, translation, text)
    VALUES (@id, @book_id, @chapter, @verse, @translation, @text)
  `);

  const tokenStmt = db.prepare(`
    INSERT INTO lxx_tokens (verse_id, position, greek_word, strong_id, morph_code)
    VALUES (@verse_id, @position, @greek_word, @strong_id, @morph_code)
  `);

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataPath, file), "utf-8");
    const lines = content
      .split("\n")
      .filter((l) => l.trim() && !l.startsWith("#"));

    const insertBatch = db.transaction(() => {
      let currentVerseId = 0;
      let verseText = "";
      let position = 0;

      for (const line of lines) {
        const [ref, greekWord, , strongId, morph] = line.split("\t");
        const verseId = refToId(ref);
        if (!verseId) continue;

        if (verseId !== currentVerseId) {
          // Salvar versículo anterior
          if (currentVerseId && verseText) {
            const { bookId, chapter, verse } = idToParts(currentVerseId);
            verseStmt.run({
              id: currentVerseId,
              book_id: bookId,
              chapter,
              verse,
              translation: "LXX",
              text: verseText.trim(),
            });
          }
          currentVerseId = verseId;
          verseText = "";
          position = 0;
        }

        verseText += (verseText ? " " : "") + greekWord;

        tokenStmt.run({
          verse_id: verseId,
          position: position++,
          greek_word: greekWord,
          strong_id: strongId !== "---" ? strongId : null,
          morph_code: morph || null,
        });
      }
    });

    insertBatch();
    console.log(`  → LXX: ${file}`);
  }
}
```

### 4.9 Construir índice FTS5 — `scripts/seed/build-fts.ts`

```typescript
// scripts/seed/build-fts.ts
import Database from "better-sqlite3";

export function buildFts(db: Database.Database) {
  db.exec(`
    -- FTS5 para busca no texto bíblico
    CREATE VIRTUAL TABLE verses_fts USING fts5(
      text,
      content='verses',
      content_rowid='id',
      tokenize='unicode61'
    );

    -- Popular o índice
    INSERT INTO verses_fts(rowid, text)
    SELECT id, text FROM verses;

    -- Triggers para manter FTS atualizado (não necessário para bible.db read-only)
    -- mas útil documentar
  `);

  console.log("  → Índice FTS5 criado");
}
```

### 4.10 Executar o seed

```bash
# Pré-requisito: ter clonado os repos em scripts/data/
pnpm seed

# Verificar o banco gerado
npx drizzle-kit studio --config drizzle.config.ts
# Ou abrir com DB Browser for SQLite (app gratuito)
```

---

## 5. Fase 3 — Navegação e Estrutura de Telas

### 5.1 Root Layout — `app/_layout.tsx`

```tsx
// app/_layout.tsx
import "../global.css";
import { Stack } from "expo-router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DatabaseProvider } from "@db/provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 }, // 5min
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <DatabaseProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </DatabaseProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

### 5.2 App Layout (pós-login) — `app/(app)/_layout.tsx`

```tsx
// app/(app)/_layout.tsx
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="strong/[id]"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen name="verse/[id]/note" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
```

### 5.3 Tabs — `app/(app)/(tabs)/_layout.tsx`

```tsx
// app/(app)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { BookOpen, Search, Library, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4F6AF5",
        tabBarStyle: { borderTopWidth: 0.5 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reader"
        options={{
          title: "Leitura",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Busca",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Biblioteca",
          tabBarIcon: ({ color, size }) => (
            <Library color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

> **Instalar lucide-react-native:**
>
> ```bash
> pnpm add lucide-react-native react-native-svg
> ```

### 5.4 Index (Home) — `app/(app)/(tabs)/index.tsx`

```tsx
// app/(app)/(tabs)/index.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useDailyVerse } from "@features/bible/hooks/useDailyVerse";
import { useLastPosition } from "@features/bible/hooks/useLastPosition";

export default function HomeScreen() {
  const router = useRouter();
  const { verse } = useDailyVerse();
  const { lastPosition } = useLastPosition();

  return (
    <View className="flex-1 bg-white dark:bg-gray-950 px-5 pt-16">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        λόγος
      </Text>

      {/* Versículo do dia */}
      {verse && (
        <TouchableOpacity
          className="bg-primary-50 dark:bg-primary-900 rounded-2xl p-5 mb-6"
          onPress={() =>
            router.push(
              `/(app)/reader?book=${verse.book_id}&chapter=${verse.chapter}`,
            )
          }
        >
          <Text className="text-xs text-primary-600 dark:text-primary-300 mb-2 font-semibold">
            VERSÍCULO DO DIA
          </Text>
          <Text className="text-gray-800 dark:text-gray-100 text-base leading-relaxed">
            {verse.text}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            {verse.reference}
          </Text>
        </TouchableOpacity>
      )}

      {/* Continuar leitura */}
      {lastPosition && (
        <TouchableOpacity
          className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-4"
          onPress={() =>
            router.push(
              `/(app)/reader?book=${lastPosition.book_id}&chapter=${lastPosition.chapter}`,
            )
          }
        >
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              CONTINUAR
            </Text>
            <Text className="font-semibold text-gray-900 dark:text-white">
              {lastPosition.book_name} {lastPosition.chapter}
            </Text>
          </View>
          <Text className="text-primary-500 text-lg">→</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### 5.5 Rota dinâmica de leitura — `app/(app)/(tabs)/reader.tsx`

```tsx
// app/(app)/(tabs)/reader.tsx
// Redireciona para o reader com parâmetros de posição
import { Redirect } from "expo-router";
import { useLastPosition } from "@features/bible/hooks/useLastPosition";

export default function ReaderTab() {
  const { lastPosition } = useLastPosition();

  if (lastPosition) {
    return (
      <Redirect
        href={`/(app)/reader?book=${lastPosition.book_id}&chapter=${lastPosition.chapter}`}
      />
    );
  }

  return <Redirect href="/(app)/reader?book=43&chapter=1" />; // João 1 como default
}
```

---

## 6. Fase 4 — Tela de Leitura e Strong

### 6.1 Tela do Reader — `app/(app)/reader.tsx`

```tsx
// app/(app)/reader.tsx
import { useLocalSearchParams } from "expo-router";
import { ChapterReader } from "@features/bible/components/ChapterReader";

export default function ReaderScreen() {
  const { book, chapter } = useLocalSearchParams<{
    book: string;
    chapter: string;
  }>();

  return (
    <ChapterReader
      bookId={parseInt(book ?? "43")}
      chapter={parseInt(chapter ?? "1")}
    />
  );
}
```

### 6.2 Componente principal de leitura — `features/bible/components/ChapterReader.tsx`

```tsx
// features/bible/components/ChapterReader.tsx
import { useRef, useCallback, useState } from "react";
import { FlatList, View, Text, SafeAreaView } from "react-native";
import { useChapter } from "../hooks/useChapter";
import { VerseRow } from "./VerseRow";
import { ChapterHeader } from "./ChapterHeader";
import { StrongBottomSheet } from "@features/strong/components/StrongBottomSheet";
import type BottomSheet from "@gorhom/bottom-sheet";

interface Props {
  bookId: number;
  chapter: number;
}

export function ChapterReader({ bookId, chapter }: Props) {
  const { verses, tokens, isLoading } = useChapter(bookId, chapter);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedStrongId, setSelectedStrongId] = useState<string | null>(null);

  const handleStrongPress = useCallback((strongId: string) => {
    setSelectedStrongId(strongId);
    bottomSheetRef.current?.expand();
  }, []);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <ChapterHeader bookId={bookId} chapter={chapter} />

      <FlatList
        data={verses}
        keyExtractor={(v) => v.id.toString()}
        contentContainerClassName="px-5 pb-24"
        renderItem={({ item: verse }) => (
          <VerseRow
            verse={verse}
            tokens={tokens[verse.id] ?? []}
            onStrongPress={handleStrongPress}
          />
        )}
      />

      <StrongBottomSheet ref={bottomSheetRef} strongId={selectedStrongId} />
    </SafeAreaView>
  );
}
```

### 6.3 Hook de capítulo — `features/bible/hooks/useChapter.ts`

```typescript
// features/bible/hooks/useChapter.ts
import { useQuery } from "@tanstack/react-query";
import { eq, and } from "drizzle-orm";
import { bibleDb } from "@db/client";
import { verses, verseTokens } from "@db/schema";
import { useBibleStore } from "../store/bibleStore";

export function useChapter(bookId: number, chapter: number) {
  const translation = useBibleStore((s) => s.activeTranslation);

  const versesQuery = useQuery({
    queryKey: ["chapter", bookId, chapter, translation],
    queryFn: () =>
      bibleDb
        .select()
        .from(verses)
        .where(
          and(
            eq(verses.book_id, bookId),
            eq(verses.chapter, chapter),
            eq(verses.translation, translation),
          ),
        ),
  });

  const tokensQuery = useQuery({
    queryKey: ["tokens", bookId, chapter, translation],
    queryFn: async () => {
      const chapterVerses = versesQuery.data ?? [];
      if (!chapterVerses.length) return {};

      const verseIds = chapterVerses.map((v) => v.id);
      const allTokens = await bibleDb
        .select()
        .from(verseTokens)
        .where(
          // Usar SQL IN — Drizzle: inArray
          // import { inArray } from 'drizzle-orm'
          inArray(verseTokens.verse_id, verseIds),
        )
        .orderBy(verseTokens.verse_id, verseTokens.position);

      // Agrupar por verse_id para acesso O(1)
      return allTokens.reduce(
        (acc, token) => {
          if (!acc[token.verse_id]) acc[token.verse_id] = [];
          acc[token.verse_id].push(token);
          return acc;
        },
        {} as Record<number, typeof allTokens>,
      );
    },
    enabled: !!versesQuery.data?.length,
  });

  return {
    verses: versesQuery.data ?? [],
    tokens: tokensQuery.data ?? {},
    isLoading: versesQuery.isLoading,
  };
}
```

### 6.4 Componente de versículo — `features/bible/components/VerseRow.tsx`

```tsx
// features/bible/components/VerseRow.tsx
import { View, Text } from "react-native";
import { StrongWord } from "./StrongWord";
import type { Verse, VerseToken } from "@db/schema";

interface Props {
  verse: typeof Verse.$inferSelect;
  tokens: (typeof VerseToken.$inferSelect)[];
  onStrongPress: (strongId: string) => void;
}

export function VerseRow({ verse, tokens, onStrongPress }: Props) {
  const hasTokens = tokens.length > 0;

  return (
    <View className="flex-row flex-wrap mb-4">
      {/* Número do versículo */}
      <Text className="text-primary-500 text-xs font-bold mr-1 mt-0.5 leading-6">
        {verse.verse}
      </Text>

      {hasTokens ? (
        // Modo tokenizado: cada palavra é tappable se tiver Strong
        tokens.map((token) => (
          <StrongWord key={token.id} token={token} onPress={onStrongPress} />
        ))
      ) : (
        // Fallback: texto simples (sem tokens ainda)
        <Text className="text-gray-900 dark:text-gray-100 text-base leading-7 flex-1">
          {verse.text}
        </Text>
      )}
    </View>
  );
}
```

### 6.5 Palavra com Strong — `features/bible/components/StrongWord.tsx`

```tsx
// features/bible/components/StrongWord.tsx
import { Text, TouchableOpacity } from "react-native";

interface Props {
  token: {
    word_surface: string;
    strong_id: string | null;
  };
  onPress: (strongId: string) => void;
}

export function StrongWord({ token, onPress }: Props) {
  const hasStrong = !!token.strong_id;

  if (!hasStrong) {
    return (
      <Text className="text-gray-900 dark:text-gray-100 text-base leading-7 mr-1">
        {token.word_surface}
      </Text>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(token.strong_id!)}
      activeOpacity={0.7}
      className="mr-1"
    >
      <Text className="text-gray-900 dark:text-gray-100 text-base leading-7 border-b border-primary-300 dark:border-primary-600">
        {token.word_surface}
      </Text>
    </TouchableOpacity>
  );
}
```

### 6.6 Bottom Sheet do Strong — `features/strong/components/StrongBottomSheet.tsx`

```tsx
// features/strong/components/StrongBottomSheet.tsx
import { forwardRef } from "react";
import { View, Text, ScrollView } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useStrongEntry } from "../hooks/useStrongEntry";

interface Props {
  strongId: string | null;
}

export const StrongBottomSheet = forwardRef<BottomSheet, Props>(
  ({ strongId }, ref) => {
    const { entry, isLoading } = useStrongEntry(strongId);
    const snapPoints = ["40%", "85%"];

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 24 }}
      >
        <BottomSheetScrollView contentContainerClassName="px-6 pb-10">
          {isLoading || !entry ? (
            <Text className="text-gray-400 text-center mt-8">
              Carregando...
            </Text>
          ) : (
            <>
              {/* Header: ID + badge de idioma */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View
                    className={`px-2 py-1 rounded ${entry.language === "H" ? "bg-amber-100" : "bg-blue-100"}`}
                  >
                    <Text
                      className={`font-bold text-xs ${entry.language === "H" ? "text-amber-700" : "text-blue-700"}`}
                    >
                      {entry.language === "H" ? "HEBRAICO" : "GREGO"}
                    </Text>
                  </View>
                  <Text className="text-gray-500 font-mono">{entry.id}</Text>
                </View>
              </View>

              {/* Palavra original */}
              <Text
                className={`text-4xl mb-2 ${entry.language === "H" ? "font-hebrew text-right" : "font-greek"}`}
                style={{
                  writingDirection: entry.language === "H" ? "rtl" : "ltr",
                }}
              >
                {entry.original_word}
              </Text>

              {/* Transliteração */}
              <Text className="text-lg text-gray-600 dark:text-gray-300 italic mb-1">
                {entry.transliteration}
              </Text>
              {entry.pronunciation && (
                <Text className="text-sm text-gray-500 mb-4">
                  [{entry.pronunciation}]
                </Text>
              )}

              {/* Definição */}
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                <Text className="text-xs text-gray-500 mb-1 font-semibold">
                  DEFINIÇÃO
                </Text>
                <Text className="text-gray-800 dark:text-gray-100 leading-relaxed">
                  {entry.definition_pt || entry.definition_en}
                </Text>
              </View>

              {/* Como KJV traduz */}
              {entry.kjv_usage && (
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-2 font-semibold">
                    KJV USA COMO
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {JSON.parse(entry.kjv_usage).map((usage: string) => (
                      <View
                        key={usage}
                        className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                      >
                        <Text className="text-sm text-gray-700 dark:text-gray-300">
                          {usage}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Ocorrências */}
              <Text className="text-xs text-gray-400 text-center">
                {entry.occurrence_count} ocorrências nas Escrituras
              </Text>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);
```

### 6.7 Hook do Strong — `features/strong/hooks/useStrongEntry.ts`

```typescript
// features/strong/hooks/useStrongEntry.ts
import { useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { bibleDb } from "@db/client";
import { strongEntries } from "@db/schema";

export function useStrongEntry(strongId: string | null) {
  const query = useQuery({
    queryKey: ["strong", strongId],
    queryFn: () =>
      bibleDb
        .select()
        .from(strongEntries)
        .where(eq(strongEntries.id, strongId!))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    enabled: !!strongId,
  });

  return { entry: query.data, isLoading: query.isLoading };
}
```

### 6.8 Store Zustand — `features/bible/store/bibleStore.ts`

```typescript
// features/bible/store/bibleStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Translation = "ARA" | "ACF" | "KJV" | "LXX";
type Theme = "light" | "dark" | "sepia";

interface BibleState {
  activeTranslation: Translation;
  theme: Theme;
  fontSize: number;
  showStrong: boolean;
  lastBook: number;
  lastChapter: number;

  setTranslation: (t: Translation) => void;
  setTheme: (t: Theme) => void;
  setFontSize: (size: number) => void;
  setLastPosition: (book: number, chapter: number) => void;
  toggleStrong: () => void;
}

export const useBibleStore = create<BibleState>()(
  persist(
    (set) => ({
      activeTranslation: "ARA",
      theme: "light",
      fontSize: 17,
      showStrong: true,
      lastBook: 43, // João
      lastChapter: 1,

      setTranslation: (t) => set({ activeTranslation: t }),
      setTheme: (t) => set({ theme: t }),
      setFontSize: (size) => set({ fontSize: size }),
      setLastPosition: (book, chapter) =>
        set({ lastBook: book, lastChapter: chapter }),
      toggleStrong: () => set((s) => ({ showStrong: !s.showStrong })),
    }),
    {
      name: "bible-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

---

## 7. Fase 5 — Busca Bíblica (FTS5)

### 7.1 Tela de busca — `app/(app)/(tabs)/search.tsx`

```tsx
// app/(app)/(tabs)/search.tsx
import { useState, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSearch } from "@features/search/hooks/useSearch";
import { SearchResult } from "@features/search/components/SearchResult";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { results, isLoading } = useSearch(query);

  return (
    <View className="flex-1 bg-white dark:bg-gray-950 pt-16">
      <View className="px-5 mb-4">
        <TextInput
          className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 text-base text-gray-900 dark:text-white"
          placeholder="Buscar versículo, palavra ou Strong (G3056)..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(r) => `${r.verse_id}`}
        contentContainerClassName="px-5"
        renderItem={({ item }) => (
          <SearchResult
            result={item}
            query={query}
            onPress={() =>
              router.push(
                `/(app)/reader?book=${item.book_id}&chapter=${item.chapter}&verse=${item.verse}`,
              )
            }
          />
        )}
        ListEmptyComponent={
          query.length > 2 && !isLoading ? (
            <Text className="text-center text-gray-400 mt-8">
              Nenhum resultado
            </Text>
          ) : null
        }
      />
    </View>
  );
}
```

### 7.2 Hook de busca — `features/search/hooks/useSearch.ts`

```typescript
// features/search/hooks/useSearch.ts
import { useQuery } from "@tanstack/react-query";
import { sql } from "drizzle-orm";
import { bibleDb } from "@db/client";
import { useBibleStore } from "@features/bible/store/bibleStore";

interface SearchResult {
  verse_id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
  rank: number;
}

export function useSearch(query: string) {
  const translation = useBibleStore((s) => s.activeTranslation);

  const searchQuery = useQuery({
    queryKey: ["search", query, translation],
    queryFn: async () => {
      if (query.length < 3) return [];

      // Detectar busca por Strong (ex: "G3056" ou "H7225")
      const strongMatch = query.match(/^([HG])(\d+)$/i);
      if (strongMatch) {
        return searchByStrong(query.toUpperCase(), translation);
      }

      // Busca full-text
      return searchFullText(query, translation);
    },
    enabled: query.length >= 3,
  });

  return { results: searchQuery.data ?? [], isLoading: searchQuery.isLoading };
}

async function searchFullText(query: string, translation: string) {
  // FTS5 com HIGHLIGHT para mostrar o termo encontrado
  const results = await bibleDb.run(sql`
    SELECT
      v.id as verse_id,
      v.book_id,
      v.chapter,
      v.verse,
      highlight(verses_fts, 0, '<mark>', '</mark>') as text,
      rank
    FROM verses_fts
    JOIN verses v ON v.id = verses_fts.rowid
    WHERE verses_fts MATCH ${query}
      AND v.translation = ${translation}
    ORDER BY rank
    LIMIT 50
  `);

  return results.rows as SearchResult[];
}

async function searchByStrong(strongId: string, translation: string) {
  const results = await bibleDb.run(sql`
    SELECT DISTINCT
      v.id as verse_id,
      v.book_id,
      v.chapter,
      v.verse,
      v.text,
      0 as rank
    FROM verse_tokens t
    JOIN verses v ON v.id = t.verse_id
    WHERE t.strong_id = ${strongId}
      AND v.translation = ${translation}
    LIMIT 100
  `);

  return results.rows as SearchResult[];
}
```

---

## 8. Fase 6 — UI: NativeWind, Temas e Fontes Bíblicas

### 8.1 Carregar fontes bíblicas — `app/_layout.tsx` (adicionar ao root)

```tsx
// Adicionar ao root _layout.tsx
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

// Fontes a baixar e colocar em assets/fonts/:
// SBLHebrew.ttf — https://www.sbl-site.org/educational/BiblicalFonts_SBLHebrew.aspx
// SBLGreek.ttf  — https://www.sbl-site.org/educational/BiblicalFonts_SBLGreek.aspx
// Inter-Regular.ttf e Inter-Bold.ttf — https://fonts.google.com/specimen/Inter

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SBLHebrew: require("../assets/fonts/SBLHebrew.ttf"),
    SBLGreek: require("../assets/fonts/SBLGreek.ttf"),
    Inter_400Regular: require("../assets/fonts/Inter-Regular.ttf"),
    Inter_700Bold: require("../assets/fonts/Inter-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // ... resto do layout
}
```

### 8.2 Provider de tema — `lib/theme.tsx`

```tsx
// lib/theme.tsx
import { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import { useBibleStore } from "@features/bible/store/bibleStore";

type Theme = "light" | "dark" | "sepia";

interface ThemeColors {
  background: string;
  text: string;
  textMuted: string;
  surface: string;
  border: string;
  primary: string;
}

const THEMES: Record<Theme, ThemeColors> = {
  light: {
    background: "#FFFFFF",
    text: "#111827",
    textMuted: "#6B7280",
    surface: "#F3F4F6",
    border: "#E5E7EB",
    primary: "#4F6AF5",
  },
  dark: {
    background: "#030712",
    text: "#F9FAFB",
    textMuted: "#9CA3AF",
    surface: "#111827",
    border: "#1F2937",
    primary: "#818CF8",
  },
  sepia: {
    background: "#FDF8F0",
    text: "#44331A",
    textMuted: "#8B7355",
    surface: "#FAF0DC",
    border: "#E8D5B7",
    primary: "#8B5E3C",
  },
};

const ThemeContext = createContext<ThemeColors>(THEMES.light);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useBibleStore((s) => s.theme);
  return (
    <ThemeContext.Provider value={THEMES[theme]}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 8.3 Tela de configurações — `app/(app)/settings.tsx`

```tsx
// app/(app)/settings.tsx
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Slider from "@react-native-community/slider";
import { useBibleStore } from "@features/bible/store/bibleStore";

export default function SettingsScreen() {
  const {
    theme,
    fontSize,
    activeTranslation,
    setTheme,
    setFontSize,
    setTranslation,
  } = useBibleStore();

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-950 px-5 pt-16">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Configurações
      </Text>

      {/* Tema */}
      <Section title="APARÊNCIA">
        <View className="flex-row gap-3">
          {(["light", "dark", "sepia"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTheme(t)}
              className={`flex-1 py-3 rounded-xl border ${
                theme === t
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200"
              }`}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  theme === t ? "text-primary-600" : "text-gray-600"
                }`}
              >
                {t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sépia"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      {/* Tamanho da fonte */}
      <Section title="TAMANHO DA FONTE">
        <View className="flex-row items-center gap-4">
          <Text className="text-sm text-gray-500">A</Text>
          <Slider
            style={{ flex: 1 }}
            minimumValue={13}
            maximumValue={24}
            step={1}
            value={fontSize}
            onValueChange={setFontSize}
            minimumTrackTintColor="#4F6AF5"
          />
          <Text className="text-xl font-bold text-gray-700">A</Text>
        </View>
        <Text className="text-center text-gray-500 text-sm mt-2">
          Tamanho: {fontSize}pt
        </Text>
      </Section>

      {/* Tradução padrão */}
      <Section title="TRADUÇÃO PADRÃO">
        {(["ARA", "ACF", "KJV", "LXX"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTranslation(t)}
            className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
              activeTranslation === t ? "opacity-100" : "opacity-70"
            }`}
          >
            <Text className="text-gray-900 dark:text-white">{t}</Text>
            {activeTranslation === t && (
              <Text className="text-primary-500 font-bold">✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-8">
      <Text className="text-xs font-bold text-gray-400 mb-3">{title}</Text>
      {children}
    </View>
  );
}
```

---

## 9. Fase 7 — Auth e Sincronização (Supabase)

### 9.1 Configurar Supabase — `lib/supabase.ts`

```typescript
// lib/supabase.ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

> **Variáveis de ambiente:** Criar `.env.local`:
>
> ```env
> EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
> EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
> ```
>
> Prefixo `EXPO_PUBLIC_` expõe para o cliente (não usar para secrets).

### 9.2 Schema PostgreSQL no Supabase

Rodar no SQL Editor do Supabase Dashboard:

```sql
-- profiles (estende auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notas sincronizadas
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  verse_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

-- destaques sincronizados
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  verse_id INTEGER NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

-- Row Level Security: cada usuário vê apenas seus dados
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notes" ON notes
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_highlights" ON highlights
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profile" ON profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### 9.3 Estratégia de sync — `features/notes/hooks/useSync.ts`

```typescript
// Estratégia: Local-first com sync eventual
// 1. Escrita sempre vai para SQLite local primeiro (campo synced=0)
// 2. Ao conectar à internet, flush pendentes para Supabase
// 3. Ao abrir o app, pull do Supabase (merge por updated_at)

import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "@lib/supabase";
import { userDb } from "@db/client";
import { notes, highlights } from "@db/schema";
import { eq } from "drizzle-orm";

export function useSyncOnReconnect() {
  useEffect(() => {
    const unsub = NetInfo.addEventListener(async (state) => {
      if (state.isConnected) {
        await syncPending();
      }
    });
    return unsub;
  }, []);
}

async function syncPending() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Upload notas pendentes
  const pendingNotes = await userDb
    .select()
    .from(notes)
    .where(eq(notes.synced, 0));

  if (pendingNotes.length > 0) {
    await supabase
      .from("notes")
      .upsert(pendingNotes.map((n) => ({ ...n, user_id: user.id })));

    await userDb.update(notes).set({ synced: 1 }).where(eq(notes.synced, 0));
  }

  // Mesma lógica para highlights...
}
```

---

## 10. Fase 8 — CI/CD com EAS e GitHub Actions

### 10.1 Configurar EAS

```bash
# Login no EAS (necessário uma vez)
eas login

# Configurar o projeto (cria eas.json)
eas build:configure
```

### 10.2 `eas.json`

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "distribution": "internal",
      "android": { "gradleCommand": ":app:assembleDebug" },
      "ios": { "buildConfiguration": "Debug" }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "ios": { "resourceClass": "m-medium" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "nsjoctan@gmail.com",
        "ascAppId": "XXXXXXXXXX",
        "appleTeamId": "XXXXXXXXXX"
      }
    }
  }
}
```

### 10.3 GitHub Actions — `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  build-preview:
    needs: lint-and-typecheck
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: eas build --platform all --profile preview --non-interactive

  deploy-ota:
    needs: lint-and-typecheck
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: eas update --auto --channel production
```

### 10.4 Secrets necessários no GitHub

| Secret                          | Onde obter                                  |
| ------------------------------- | ------------------------------------------- |
| `EXPO_TOKEN`                    | expo.dev → Account Settings → Access Tokens |
| `EXPO_PUBLIC_SUPABASE_URL`      | Supabase Dashboard → Project Settings → API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |

### 10.5 Primeiro build iOS (TestFlight)

```bash
# Gerar certificados automáticos (EAS gerencia)
eas credentials

# Build production iOS
eas build --platform ios --profile production

# Após build concluir, submeter para TestFlight
eas submit --platform ios --latest
```

---

## 11. Referências e Licenças dos Dados

| Dado                                   | Repositório                                                                     | Licença          | Uso Comercial        |
| -------------------------------------- | ------------------------------------------------------------------------------- | ---------------- | -------------------- |
| Strong's Hebraico + Grego (dicionário) | [openscriptures/strongs](https://github.com/openscriptures/strongs)             | Public Domain    | ✅ Livre             |
| KJV + Strong numbers em SQLite         | [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases) | Public Domain    | ✅ Livre             |
| AT Hebraico tagueado (TAHOT)           | [STEPBible/STEPBible-Data](https://github.com/STEPBible/STEPBible-Data)         | CC BY 4.0        | ✅ Crédito requerido |
| NT Grego tagueado (TAGNT)              | [STEPBible/STEPBible-Data](https://github.com/STEPBible/STEPBible-Data)         | CC BY 4.0        | ✅ Crédito requerido |
| LXX Septuaginta (Swete 1930)           | [eliranwong/LXX-Swete-1930](https://github.com/eliranwong/LXX-Swete-1930)       | Public Domain    | ✅ Livre             |
| ACF (Almeida Corrigida Fiel)           | [eBible.org](https://ebible.org)                                                | Public Domain    | ✅ Livre             |
| ARA (Almeida Revista e Atualizada)     | [SBB](https://www.sbb.org.br)                                                   | Copyright SBB    | ⚠️ Verificar         |
| KJV (fora do Reino Unido)              | Various                                                                         | Public Domain    | ✅ Livre             |
| Fonte SBL Hebrew                       | [SBL](https://www.sbl-site.org/educational/BiblicalFonts_SBLHebrew.aspx)        | SBL Font License | ✅ Apps OK           |
| Fonte SBL Greek                        | [SBL](https://www.sbl-site.org/educational/BiblicalFonts_SBLGreek.aspx)         | SBL Font License | ✅ Apps OK           |

### Crédito obrigatório (CC BY 4.0 — STEPBible)

Incluir na tela "Sobre" do app:

> Dados hebraicos e gregos: STEPBible.org, licença Creative Commons CC BY 4.0.
> Texto original: TAHOT (AT hebraico com Strong) e TAGNT (NT grego com Strong).

---

## Checklist de MVP

- [ ] Fase 0: Projeto configurado (NativeWind, aliases, fontes)
- [ ] Fase 1: Schema Drizzle criado e migrações geradas
- [ ] Fase 2: bible.db gerado com ACF + KJV + Strong's + LXX
- [ ] Fase 3: Navegação tabs funcionando
- [ ] Fase 4: Leitura de capítulo com palavras tappable
- [ ] Fase 4: Bottom Sheet do Strong abrindo ao tocar palavra
- [ ] Fase 5: Busca full-text e busca por Strong ID
- [ ] Fase 6: Temas claro/escuro/sépia + tamanho de fonte
- [ ] Fase 6: Fontes SBL Hebrew e SBL Greek carregando
- [ ] Fase 7: Auth Supabase (email)
- [ ] Fase 7: Sync de anotações e destaques
- [ ] Fase 8: EAS configurado, primeiro build no TestFlight

---

_Logós App — Guia vivo. Atualizar conforme implementação avança._
