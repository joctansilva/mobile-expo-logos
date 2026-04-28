import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { userDb } from './client';
// Este arquivo é gerado por `pnpm db:generate` — rodar antes de iniciar o app.
import migrations from './migrations/migrations';

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(userDb, migrations);

  if (error) throw error;
  if (!success) return null;

  return <>{children}</>;
}
