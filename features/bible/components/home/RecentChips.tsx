import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Clock } from "lucide-react-native";
import type { RecentChapter } from "@features/bible/store/bibleStore";

interface Props {
  items: RecentChapter[];
  onPress: (item: RecentChapter) => void;
}

export function RecentChips({ items, onPress }: Props) {
  if (!items.length) return null;

  return (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: "#8B7355",
          letterSpacing: 2,
          marginBottom: 12,
        }}
      >
        RECENTES
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {items.map((item) => (
            <TouchableOpacity
              key={`${item.book_id}-${item.chapter}`}
              onPress={() => onPress(item)}
              activeOpacity={0.7}
              style={{
                backgroundColor: "#EDE0C4",
                borderWidth: 1,
                borderColor: "rgba(212,175,55,0.3)",
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 99,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Clock color="#8B7355" size={16} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#3F3024" }}>
                {item.book_name} {item.chapter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
