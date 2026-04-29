import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Translation = "ACF" | "KJV" | "LXX";
type Theme = "light" | "dark" | "sepia";

interface BibleState {
  activeTranslation: Translation;
  theme: Theme;
  fontSize: number;
  showStrong: boolean;
  lastBook: number;
  lastChapter: number;

  setTranslation: (t: Translation) => void;
  setTheme: (t: Theme) => void;
  setFontSize: (size: number) => void;
  setLastPosition: (book: number, chapter: number) => void;
  toggleStrong: () => void;
}

export const useBibleStore = create<BibleState>()(
  persist(
    (set) => ({
      activeTranslation: "ACF",
      theme: "light",
      fontSize: 17,
      showStrong: true,
      lastBook: 43,
      lastChapter: 1,

      setTranslation: (t) => set({ activeTranslation: t }),
      setTheme: (t) => set({ theme: t }),
      setFontSize: (size) => set({ fontSize: size }),
      setLastPosition: (book, chapter) =>
        set({ lastBook: book, lastChapter: chapter }),
      toggleStrong: () => set((s) => ({ showStrong: !s.showStrong })),
    }),
    {
      name: "bible-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
