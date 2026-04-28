import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// bible.db — read-only, gerado pelo script de seed e copiado dos assets na Fase 2.
// user.db  — leitura/escrita, criado via migrations do Drizzle, sincronizado com Supabase.
const bibleSQLite = SQLite.openDatabaseSync('bible.db');
const userSQLite = SQLite.openDatabaseSync('user.db', { enableChangeListener: true });

export const bibleDb = drizzle(bibleSQLite, { schema });
export const userDb = drizzle(userSQLite, { schema });

export type BibleDb = typeof bibleDb;
export type UserDb = typeof userDb;
