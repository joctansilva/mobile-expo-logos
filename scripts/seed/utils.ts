// Utilitários compartilhados entre todos os scripts de seed

// ─── MAPEAMENTO STEPBible → book_id numérico ──────────────────────────────────
export const STEPBIBLE_BOOK_MAP: Record<string, number> = {
  // AT — Old Testament
  Gen: 1,  Exo: 2,  Lev: 3,  Num: 4,  Deu: 5,
  Jos: 6,  Jdg: 7,  Rth: 8,  '1Sa': 9, '2Sa': 10,
  '1Ki': 11, '2Ki': 12, '1Ch': 13, '2Ch': 14, Ezr: 15,
  Neh: 16, Est: 17, Job: 18, Psa: 19, Pro: 20,
  Ecc: 21, Sng: 22, Isa: 23, Jer: 24, Lam: 25,
  Ezk: 26, Dan: 27, Hos: 28, Jol: 29, Amo: 30,
  Oba: 31, Jon: 32, Mic: 33, Nam: 34, Hab: 35,
  Zep: 36, Hag: 37, Zec: 38, Mal: 39,
  // NT — New Testament
  Mat: 40, Mrk: 41, Luk: 42, Jhn: 43, Act: 44,
  Rom: 45, '1Co': 46, '2Co': 47, Gal: 48, Eph: 49,
  Php: 50, Col: 51, '1Th': 52, '2Th': 53, '1Ti': 54,
  '2Ti': 55, Tit: 56, Phm: 57, Heb: 58, Jas: 59,
  '1Pe': 60, '2Pe': 61, '1Jn': 62, '2Jn': 63, '3Jn': 64,
  Jud: 65, Rev: 66,
};

// LXX-Swete-1930 usa abreviações ligeiramente diferentes para alguns livros
export const LXX_BOOK_MAP: Record<string, number> = {
  ...STEPBIBLE_BOOK_MAP,
  // Diferenças da LXX vs STEPBIBLE
  Rut: 8,   // LXX usa "Rut" em vez de "Rth"
  Sol: 22,  // LXX usa "Sol" em vez de "Sng" (Cantares / Song of Solomon)
  Eze: 26,  // LXX usa "Eze" em vez de "Ezk"
  Joe: 29,  // LXX usa "Joe" em vez de "Jol"
};

// Mapeamento de nomes por extenso (inglês) → book_id
// Cobre múltiplos formatos usados pelos CSVs do bible_databases (scrollmapper):
//   - Numeral arábico: "1 Samuel", "2 Kings"
//   - Numeral romano: "I Samuel", "II Kings", "III John"
//   - Variantes de Apocalipse: "Revelation", "Revelation of John"
export const BOOK_NAME_EN_MAP: Record<string, number> = {
  Genesis: 1, Exodus: 2, Leviticus: 3, Numbers: 4, Deuteronomy: 5,
  Joshua: 6, Judges: 7, Ruth: 8,
  '1 Samuel': 9,  'I Samuel': 9,
  '2 Samuel': 10, 'II Samuel': 10,
  '1 Kings': 11,  'I Kings': 11,
  '2 Kings': 12,  'II Kings': 12,
  '1 Chronicles': 13, 'I Chronicles': 13,
  '2 Chronicles': 14, 'II Chronicles': 14,
  Ezra: 15, Nehemiah: 16, Esther: 17, Job: 18, Psalms: 19, Proverbs: 20,
  Ecclesiastes: 21, 'Song of Solomon': 22, Isaiah: 23, Jeremiah: 24,
  Lamentations: 25, Ezekiel: 26, Daniel: 27, Hosea: 28, Joel: 29,
  Amos: 30, Obadiah: 31, Jonah: 32, Micah: 33, Nahum: 34, Habakkuk: 35,
  Zephaniah: 36, Haggai: 37, Zechariah: 38, Malachi: 39,
  Matthew: 40, Mark: 41, Luke: 42, John: 43, Acts: 44,
  Romans: 45,
  '1 Corinthians': 46, 'I Corinthians': 46,
  '2 Corinthians': 47, 'II Corinthians': 47,
  Galatians: 48, Ephesians: 49, Philippians: 50, Colossians: 51,
  '1 Thessalonians': 52, 'I Thessalonians': 52,
  '2 Thessalonians': 53, 'II Thessalonians': 53,
  '1 Timothy': 54, 'I Timothy': 54,
  '2 Timothy': 55, 'II Timothy': 55,
  Titus: 56, Philemon: 57, Hebrews: 58, James: 59,
  '1 Peter': 60, 'I Peter': 60,
  '2 Peter': 61, 'II Peter': 61,
  '1 John': 62, 'I John': 62,
  '2 John': 63, 'II John': 63,
  '3 John': 64, 'III John': 64,
  Jude: 65,
  Revelation: 66, 'Revelation of John': 66,
};

// Converte "Gen.1.1" → 1001001  |  "Rev.22.21" → 66022021
export function refToId(ref: string): number | null {
  // Limpar sufixos de variante: "Gen.1.1!a" → "Gen.1.1"
  const clean = ref.split('!')[0].trim();
  const parts = clean.split('.');
  if (parts.length < 3) return null;

  const bookId = STEPBIBLE_BOOK_MAP[parts[0]];
  if (!bookId) return null;

  const chapter = parseInt(parts[1], 10);
  const verse = parseInt(parts[2], 10);
  if (isNaN(chapter) || isNaN(verse)) return null;

  return bookId * 1_000_000 + chapter * 1_000 + verse;
}

// Converte "Gen.1:1" (formato LXX) → 1001001
// Suporta tanto "Gen.1:1" quanto "Gen.1.1"
export function refColonToId(ref: string, bookMap = LXX_BOOK_MAP): number | null {
  const clean = ref.split('!')[0].trim().replace(':', '.');
  const parts = clean.split('.');
  if (parts.length < 3) return null;

  const bookId = bookMap[parts[0]];
  if (!bookId) return null;

  const chapter = parseInt(parts[1], 10);
  const verse = parseInt(parts[2], 10);
  if (isNaN(chapter) || isNaN(verse)) return null;

  return bookId * 1_000_000 + chapter * 1_000 + verse;
}

// Converte 43003016 → { bookId: 43, chapter: 3, verse: 16 }
export function idToParts(id: number): { bookId: number; chapter: number; verse: number } {
  const verse = id % 1_000;
  const chapter = Math.floor((id % 1_000_000) / 1_000);
  const bookId = Math.floor(id / 1_000_000);
  return { bookId, chapter, verse };
}

// Normaliza IDs Strong: "H7225a" → "H7225"  |  "G2424G" → "G2424"  |  "---" → null
// Suporta sufixos maiúsculos e minúsculos do STEPBible (ex: "H7225G", "G2424G")
export function normalizeStrongId(raw: string | undefined): string | null {
  if (!raw || raw === '---' || raw === '' || raw === 'N/A') return null;
  // Remove curly braces (STEPBible notation: "{H7225G}" → "H7225G")
  const stripped = raw.trim().replace(/[{}]/g, '');
  // Remove trailing letters (uppercase ou lowercase): "H7225G" → "H7225", "H1254A" → "H1254"
  const normalized = stripped.replace(/([HG]\d+)[A-Za-z]+$/, '$1');
  return normalized.match(/^[HG]\d+$/) ? normalized : null;
}

// Extrai o Strong ID principal de campos complexos do STEPBible Amalgamated
// Exemplos: "H9003/{H7225G}" → "H7225"  |  "{H1254A}" → "H1254"  |  "G0976=N-NSF" → "G0976"
export function parseStepbibleStrong(field: string | undefined): string | null {
  if (!field || field === '---' || field.trim() === '') return null;

  // Formato TAGNT: "G0976=N-NSF" — strong antes do "="
  if (field.includes('=') && !field.includes('{')) {
    return normalizeStrongId(field.split('=')[0]);
  }

  // Formato TAHOT: "H9003/{H7225G}" ou "{H1254A}" ou "H9003/H7225"
  // Preferir IDs dentro de {} (lexical entry principal), senão pegar o primeiro
  const braceMatch = field.match(/\{([HG][^}]+)\}/);
  if (braceMatch) {
    return normalizeStrongId(braceMatch[1]);
  }

  // Sem chaves: pegar a primeira parte (antes de / se houver)
  const first = field.split('/')[0].trim();
  return normalizeStrongId(first);
}

// Extrai morfologia de campo TAGNT: "G0976=N-NSF" → "N-NSF"
export function parseStepbibleMorph(field: string | undefined): string | null {
  if (!field) return null;
  const parts = field.split('=');
  return parts.length >= 2 ? parts[1].trim() || null : null;
}
