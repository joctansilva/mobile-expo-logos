import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import type { Book } from "@lib/books";

interface Props {
  book: Book;
  onPress: (book: Book) => void;
}

export function BookItem({ book, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onPress(book)}
      activeOpacity={0.65}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#E2D4B5",
        backgroundColor: "#F5EDD8",
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: "#EDE0C4",
          borderWidth: 1,
          borderColor: "#E2D4B5",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#8B7355" }}>
          {book.abbreviation}
        </Text>
      </View>

      <Text style={{ flex: 1, fontSize: 16, color: "#3F3024", fontWeight: "500" }}>
        {book.name_pt}
      </Text>

      <Text style={{ fontSize: 12, color: "#8B7355", marginRight: 6 }}>
        {book.total_chapters} cap.
      </Text>
      <ChevronRight color="#C4A882" size={16} />
    </TouchableOpacity>
  );
}
