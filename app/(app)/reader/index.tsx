import { useState, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";

import { useChapter } from "@features/bible/hooks/useChapter";
import { useBibleStore } from "@features/bible/store/bibleStore";
import { getBook } from "@lib/books";

import { ReaderHeader } from "@features/bible/components/reader/ReaderHeader";
import { ChapterNav } from "@features/bible/components/reader/ChapterNav";
import { VerseBlock } from "@features/bible/components/reader/VerseBlock";
import { VerseActionBar } from "@features/bible/components/reader/VerseActionBar";
import { TranslationFAB } from "@features/bible/components/reader/TranslationFAB";

export default function ReaderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { book, chapter: chapterParam } = useLocalSearchParams<{
    book: string;
    chapter: string;
  }>();

  const bookId = parseInt(book ?? "43");
  const bookData = getBook(bookId);

  const [chapter, setChapter] = useState(parseInt(chapterParam ?? "1"));
  const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
  const [strongMode, setStrongMode] = useState(false);

  const activeTranslation = useBibleStore((s) => s.activeTranslation);
  const setLastPosition = useBibleStore((s) => s.setLastPosition);
  const addRecentChapter = useBibleStore((s) => s.addRecentChapter);

  const { verses, tokensByVerse, isLoading } = useChapter(bookId, chapter);

  const scrollRef = useRef<ScrollView>(null);

  const totalChapters = bookData?.total_chapters ?? 1;

  const goToChapter = useCallback(
    (next: number) => {
      setChapter(next);
      setSelectedVerseId(null);
      setStrongMode(false);
      setLastPosition(bookId, next);
      if (bookData) {
        addRecentChapter({
          book_id: bookId,
          chapter: next,
          book_name: bookData.name_pt,
        });
      }
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    },
    [bookId, bookData, setLastPosition, addRecentChapter],
  );

  const selectedVerse = verses.find((v) => v.canonicalId === selectedVerseId);

  const handleVersePress = useCallback(
    (canonicalId: number) => {
      if (strongMode) return;
      setSelectedVerseId((prev) => (prev === canonicalId ? null : canonicalId));
    },
    [strongMode],
  );

  const handleVerseLongPress = useCallback((canonicalId: number) => {
    setSelectedVerseId(canonicalId);
  }, []);

  const handleActivateStrong = useCallback(() => {
    setStrongMode(true);
    setSelectedVerseId(null);
  }, []);

  const handleCloseActionBar = useCallback(() => {
    setSelectedVerseId(null);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#3F3024" }}>
      {/* Status bar safe area */}
      <View style={{ height: insets.top, backgroundColor: "#3F3024" }} />

      <ReaderHeader
        bookName={bookData?.name_pt ?? "..."}
        chapter={chapter}
        translation={activeTranslation}
        onBack={() => router.back()}
      />

      {/* Strong mode banner */}
      {strongMode && (
        <View
          style={{
            backgroundColor: "rgba(212,175,55,0.15)",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(212,175,55,0.3)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              color: "#D4AF37",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Modo Strong · Toque nos números para pesquisar
          </Text>
          <TouchableOpacity
            onPress={() => setStrongMode(false)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X color="#D4AF37" size={14} />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1, backgroundColor: "#F5EDD8" }}>
        {isLoading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator color="#D4AF37" size="large" />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            <ChapterNav
              chapter={chapter}
              canGoPrev={chapter > 1}
              canGoNext={chapter < totalChapters}
              onPrev={() => goToChapter(chapter - 1)}
              onNext={() => goToChapter(chapter + 1)}
            />

            {verses.map((verse) => (
              <VerseBlock
                key={verse.id}
                verse={verse}
                tokens={tokensByVerse[verse.canonicalId] ?? []}
                strongMode={strongMode}
                selected={selectedVerseId === verse.canonicalId}
                onPress={() => handleVersePress(verse.canonicalId)}
                onLongPress={() => handleVerseLongPress(verse.canonicalId)}
                onStrongIdPress={(strongId) => {
                  // para implementar: abrir dicionário Strong
                  console.log("Strong ID:", strongId);
                }}
              />
            ))}

            <ChapterNav
              chapter={chapter}
              canGoPrev={chapter > 1}
              canGoNext={chapter < totalChapters}
              onPrev={() => goToChapter(chapter - 1)}
              onNext={() => goToChapter(chapter + 1)}
            />
          </ScrollView>
        )}
      </View>

      {/* Floating elements */}
      {selectedVerse ? (
        <VerseActionBar
          verseText={selectedVerse.text}
          verseRef={`${bookData?.name_pt ?? ""} ${chapter}:${selectedVerse.verse}`}
          bottomInset={insets.bottom}
          onHighlight={() => {
            // para implementar: salvar destaque
            handleCloseActionBar();
          }}
          onStrong={handleActivateStrong}
          onClose={handleCloseActionBar}
        />
      ) : !strongMode ? (
        <TranslationFAB
          translation={activeTranslation}
          bottomInset={insets.bottom}
          onPress={() => {
            // para implementar: seletor de tradução
          }}
        />
      ) : null}
    </View>
  );
}
