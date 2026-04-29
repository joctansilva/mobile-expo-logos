import { useQuery } from "@tanstack/react-query";
import { eq, and, gte, lte } from "drizzle-orm";
import { getBibleDb } from "@db/client";
import { verses, verseTokens } from "@db/schema";
import { useBibleStore } from "../store/bibleStore";

const TRANSLATION_OFFSET: Record<string, number> = {
  KJV: 0,
  ACF: 1_000_000_000,
  LXX: 2_000_000_000,
};

export type ChapterVerse = {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  translation: string;
  text: string;
  canonicalId: number;
};

export type VerseToken = {
  id: number;
  verse_id: number;
  position: number;
  word_surface: string;
  strong_id: string | null;
  morph_code: string | null;
  original_word: string | null;
};

export function useChapter(bookId: number, chapter: number) {
  const translation = useBibleStore((s) => s.activeTranslation);
  const offset = TRANSLATION_OFFSET[translation] ?? 0;

  const versesQuery = useQuery({
    queryKey: ["chapter", bookId, chapter, translation],
    queryFn: async () => {
      const rows = await getBibleDb()
        .select()
        .from(verses)
        .where(
          and(
            eq(verses.book_id, bookId),
            eq(verses.chapter, chapter),
            eq(verses.translation, translation),
          ),
        )
        .orderBy(verses.verse);

      return rows.map((v) => ({
        ...v,
        canonicalId: v.id - offset,
      })) as ChapterVerse[];
    },
  });

  const canonicalStart = bookId * 1_000_000 + chapter * 1_000 + 1;
  const canonicalEnd = bookId * 1_000_000 + chapter * 1_000 + 999;

  const tokensQuery = useQuery({
    queryKey: ["tokens", bookId, chapter],
    queryFn: async () => {
      const rows = await getBibleDb()
        .select()
        .from(verseTokens)
        .where(
          and(
            gte(verseTokens.verse_id, canonicalStart),
            lte(verseTokens.verse_id, canonicalEnd),
          ),
        )
        .orderBy(verseTokens.verse_id, verseTokens.position);

      return rows.reduce(
        (acc, t) => {
          if (!acc[t.verse_id]) acc[t.verse_id] = [];
          acc[t.verse_id].push(t as VerseToken);
          return acc;
        },
        {} as Record<number, VerseToken[]>,
      );
    },
    enabled: !!versesQuery.data?.length,
  });

  return {
    verses: versesQuery.data ?? [],
    tokensByVerse: tokensQuery.data ?? {},
    isLoading: versesQuery.isLoading,
  };
}
