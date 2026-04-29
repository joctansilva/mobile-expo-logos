import { create } from "zustand";

type Translation = "ACF" | "KJV" | "LXX";
type Theme = "light" | "dark" | "sepia";

export interface RecentChapter {
  book_id: number;
  chapter: number;
  book_name: string;
}

interface BibleState {
  activeTranslation: Translation;
  theme: Theme;
  fontSize: number;
  showStrong: boolean;
  lastBook: number;
  lastChapter: number;
  recentChapters: RecentChapter[];

  setTranslation: (t: Translation) => void;
  setTheme: (t: Theme) => void;
  setFontSize: (size: number) => void;
  setLastPosition: (book: number, chapter: number) => void;
  toggleStrong: () => void;
  addRecentChapter: (item: RecentChapter) => void;
}

export const useBibleStore = create<BibleState>()((set) => ({
  activeTranslation: "ACF",
  theme: "light",
  fontSize: 17,
  showStrong: true,
  lastBook: 43,
  lastChapter: 1,
  recentChapters: [
    { book_id: 1, chapter: 1, book_name: "Gênesis" },
    { book_id: 45, chapter: 8, book_name: "Romanos" },
    { book_id: 19, chapter: 23, book_name: "Salmos" },
  ],

  setTranslation: (t) => set({ activeTranslation: t }),
  setTheme: (t) => set({ theme: t }),
  setFontSize: (size) => set({ fontSize: size }),
  setLastPosition: (book, chapter) => set({ lastBook: book, lastChapter: chapter }),
  toggleStrong: () => set((s) => ({ showStrong: !s.showStrong })),
  addRecentChapter: (item) =>
    set((s) => ({
      recentChapters: [
        item,
        ...s.recentChapters.filter(
          (r) => !(r.book_id === item.book_id && r.chapter === item.chapter),
        ),
      ].slice(0, 10),
    })),
}));
