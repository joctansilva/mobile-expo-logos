import { useQuery } from "@tanstack/react-query";
import { eq, and } from "drizzle-orm";
import { getBibleDb } from "@db/client";
import { verses, books } from "@db/schema";
import { useBibleStore } from "../store/bibleStore";

// Fixed pool of well-known verses for daily rotation
const DAILY_VERSE_POOL = [
  { book_id: 43, chapter: 3, verse: 16 },   // João 3:16
  { book_id: 19, chapter: 23, verse: 1 },   // Salmos 23:1
  { book_id: 23, chapter: 40, verse: 31 },  // Isaías 40:31
  { book_id: 50, chapter: 4, verse: 13 },   // Filipenses 4:13
  { book_id: 45, chapter: 8, verse: 28 },   // Romanos 8:28
  { book_id: 49, chapter: 2, verse: 8 },    // Efésios 2:8
  { book_id: 20, chapter: 3, verse: 5 },    // Provérbios 3:5
  { book_id: 43, chapter: 14, verse: 6 },   // João 14:6
  { book_id: 19, chapter: 46, verse: 1 },   // Salmos 46:1
  { book_id: 24, chapter: 29, verse: 11 },  // Jeremias 29:11
  { book_id: 45, chapter: 12, verse: 2 },   // Romanos 12:2
  { book_id: 19, chapter: 119, verse: 105 },// Salmos 119:105
  { book_id: 49, chapter: 6, verse: 10 },   // Efésios 6:10
  { book_id: 43, chapter: 16, verse: 33 },  // João 16:33
];

function getDailyIndex(): number {
  const start = new Date("2026-01-01").getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.floor((today.getTime() - start) / 86400000);
  return Math.abs(days) % DAILY_VERSE_POOL.length;
}

export function useDailyVerse() {
  const translation = useBibleStore((s) => s.activeTranslation);
  const ref = DAILY_VERSE_POOL[getDailyIndex()];

  // verse id formula: no offset for ACF/KJV canonical ids
  // ACF uses 1_000_000_000 offset in bible.db
  const canonicalId = ref.book_id * 1_000_000 + ref.chapter * 1_000 + ref.verse;
  const translationOffset = translation === "LXX" ? 2_000_000_000
    : translation === "ACF" ? 1_000_000_000
    : 0;
  const verseId = translationOffset + canonicalId;

  const query = useQuery({
    queryKey: ["daily-verse", verseId, translation],
    queryFn: async () => {
      const rows = await getBibleDb()
        .select({
          id: verses.id,
          book_id: verses.book_id,
          chapter: verses.chapter,
          verse: verses.verse,
          text: verses.text,
          book_name: books.name_pt,
          abbreviation: books.abbreviation,
        })
        .from(verses)
        .innerJoin(books, eq(verses.book_id, books.id))
        .where(eq(verses.id, verseId))
        .limit(1);

      const row = rows[0];
      if (!row) return null;

      return {
        ...row,
        reference: `${row.book_name} ${row.chapter}:${row.verse}`,
      };
    },
  });

  return { verse: query.data ?? null, isLoading: query.isLoading };
}
