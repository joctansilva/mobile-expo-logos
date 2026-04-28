// Utilitários compartilhados entre todos os scripts de seed

// ─── MAPEAMENTO STEPBible → book_id numérico ──────────────────────────────────
// STEPBible usa abreviações de 3 letras no formato "Gen.1.1", "Jhn.3.16", etc.
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

// Converte 43003016 → { bookId: 43, chapter: 3, verse: 16 }
export function idToParts(id: number): { bookId: number; chapter: number; verse: number } {
  const verse = id % 1_000;
  const chapter = Math.floor((id % 1_000_000) / 1_000);
  const bookId = Math.floor(id / 1_000_000);
  return { bookId, chapter, verse };
}

// Normaliza IDs Strong: "H7225a" → "H7225"  |  "G3056" → "G3056"  |  "---" → null
export function normalizeStrongId(raw: string | undefined): string | null {
  if (!raw || raw === '---' || raw === '' || raw === 'N/A') return null;
  const trimmed = raw.trim().replace(/[a-z]+$/, '');
  return trimmed.match(/^[HG]\d+$/) ? trimmed : null;
}
