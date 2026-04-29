import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MoreVertical } from "lucide-react-native";
import { getBook } from "@lib/books";
import { useBibleStore } from "@features/bible/store/bibleStore";
import { ChapterGrid } from "@features/bible/components/book-select/ChapterGrid";

export default function ChapterSelectScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const lastBook = useBibleStore((s) => s.lastBook);
  const lastChapter = useBibleStore((s) => s.lastChapter);

  const book = getBook(parseInt(bookId ?? "43"));
  if (!book) return null;

  const currentChapter = lastBook === book.id ? lastChapter : undefined;

  const handleChapter = (chapter: number) => {
    router.push(`/(app)/reader?book=${book.id}&chapter=${chapter}` as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5EDD8" }}>
      {/* Header */}
      <View style={{ backgroundColor: "#3F3024" }}>
        <SafeAreaView edges={["top"]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 8,
              paddingVertical: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ padding: 8, borderRadius: 99 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ArrowLeft color="#D4AF37" size={22} />
              </TouchableOpacity>
              <Text
                style={{
                  color: "#D4AF37",
                  fontSize: 22,
                  fontWeight: "700",
                  fontStyle: "italic",
                  letterSpacing: 0.5,
                }}
              >
                {book.name_pt}
              </Text>
            </View>

            <TouchableOpacity
              style={{ padding: 8 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MoreVertical color="#D4AF37" size={20} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho do livro */}
        <View style={{ alignItems: "center", marginBottom: 32, marginTop: 8 }}>
          <View
            style={{
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: "#D4AF37",
              paddingHorizontal: 16,
              paddingVertical: 4,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#8B7355",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {book.testament === "AT" ? "Antigo Testamento" : "Novo Testamento"}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 26,
              fontWeight: "500",
              color: "#3F3024",
              fontStyle: "italic",
              marginBottom: 12,
            }}
          >
            {book.name_pt}
          </Text>

          <View
            style={{
              width: 80,
              height: 1,
              backgroundColor: "#D4AF37",
              opacity: 0.5,
            }}
          />
        </View>

        {/* Seção de capítulos */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: "#8B7355",
            letterSpacing: 2,
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Selecione o Capítulo
        </Text>

        <ChapterGrid
          totalChapters={book.total_chapters}
          currentChapter={currentChapter}
          onPress={handleChapter}
        />
      </ScrollView>
    </View>
  );
}
