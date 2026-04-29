import { View, Text, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AT_BOOKS, NT_BOOKS, type Book } from "@lib/books";
import { BookItem } from "@features/bible/components/book-select/BookItem";

const SECTIONS = [
  { title: "Antigo Testamento", data: AT_BOOKS },
  { title: "Novo Testamento",   data: NT_BOOKS },
];

export default function BookSelectScreen() {
  const router = useRouter();

  const handleBook = (book: Book) => {
    router.push(`/(app)/chapter-select?bookId=${book.id}` as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5EDD8" }}>
      <View style={{ backgroundColor: "#3F3024" }}>
        <SafeAreaView edges={["top"]}>
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: "#D4AF37",
                fontSize: 22,
                fontStyle: "italic",
                letterSpacing: 1,
              }}
            >
              Bíblia
            </Text>
            <Text style={{ color: "#8B7355", fontSize: 12, letterSpacing: 1 }}>
              66 livros
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <SectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BookItem book={item} onPress={handleBook} />
        )}
        renderSectionHeader={({ section }) => (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: "#EDE0C4",
              borderBottomWidth: 1,
              borderBottomColor: "#E2D4B5",
              borderTopWidth: 1,
              borderTopColor: "#E2D4B5",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#8B7355",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {section.title}
            </Text>
          </View>
        )}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}
