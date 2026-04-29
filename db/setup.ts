import * as FileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";
import { initBibleDb } from "./client";

const DB_DIR = FileSystem.documentDirectory + "SQLite/";
const DB_PATH = DB_DIR + "bible.db";

// Se o arquivo existir mas for menor que 500KB, consideramos corrompido/vazio e sobrescrevemos.
// O bible.db real tem vários MB.
const MIN_VALID_SIZE = 500_000;

export async function setupBibleDb(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DB_PATH, { size: true });
  const fileSize = (info as any).size ?? 0;

  if (!info.exists || fileSize < MIN_VALID_SIZE) {
    await FileSystem.makeDirectoryAsync(DB_DIR, { intermediates: true });
    const asset = Asset.fromModule(require("../assets/db/bible.db"));
    await asset.downloadAsync();
    await FileSystem.copyAsync({ from: asset.localUri!, to: DB_PATH });
  }

  // Abre a conexão depois que o arquivo real está garantido no lugar
  initBibleDb();
}
