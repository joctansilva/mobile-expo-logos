import { useBibleStore } from "../store/bibleStore";
import { getBook } from "@lib/books";

export function useLastPosition() {
  const lastBook = useBibleStore((s) => s.lastBook);
  const lastChapter = useBibleStore((s) => s.lastChapter);
  const book = getBook(lastBook);

  return {
    lastPosition: {
      book_id: lastBook,
      chapter: lastChapter,
      book_name: book?.name_pt ?? "João",
    },
  };
}
