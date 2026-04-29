import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// user.db — criado do zero via migrations, seguro abrir no módulo
const userSQLite = SQLite.openDatabaseSync('user.db', { enableChangeListener: true });
export const userDb = drizzle(userSQLite, { schema });

// bible.db — NÃO abre aqui. setupBibleDb() copia o arquivo primeiro,
// depois chama initBibleDb() para abrir a conexão já com o arquivo real.
type BibleDrizzle = ReturnType<typeof drizzle<typeof schema>>;
let _bibleDb: BibleDrizzle | null = null;

export function getBibleDb(): BibleDrizzle {
  if (!_bibleDb) throw new Error("bible.db ainda não foi inicializado — chame setupBibleDb() primeiro");
  return _bibleDb;
}

export function initBibleDb(): void {
  const sqlite = SQLite.openDatabaseSync('bible.db');
  _bibleDb = drizzle(sqlite, { schema });
}
