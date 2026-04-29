import * as FileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";

const DB_DIR = FileSystem.documentDirectory + "SQLite/";
const DB_PATH = DB_DIR + "bible.db";

export async function setupBibleDb(): Promise<void> {
  const { exists } = await FileSystem.getInfoAsync(DB_PATH);
  if (exists) return;

  await FileSystem.makeDirectoryAsync(DB_DIR, { intermediates: true });

  const asset = Asset.fromModule(require("../assets/db/bible.db"));
  await asset.downloadAsync();
  await FileSystem.copyAsync({ from: asset.localUri!, to: DB_PATH });
}
