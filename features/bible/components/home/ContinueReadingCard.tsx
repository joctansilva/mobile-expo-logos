import { View, Text, TouchableOpacity } from "react-native";
import { BookOpen, ChevronRight } from "lucide-react-native";

interface Props {
  bookName: string;
  chapter: number;
  progress?: number; // 0–1
  onPress: () => void;
}

export function ContinueReadingCard({ bookName, chapter, progress = 0.4, onPress }: Props) {
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
        CONTINUAR LEITURA
      </Text>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          backgroundColor: "#EDE0C4",
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "#3F3024",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BookOpen color="#D4AF37" size={22} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "500", color: "#3F3024", marginBottom: 8 }}>
            {bookName} {chapter}
          </Text>
          <View
            style={{
              width: "100%",
              height: 6,
              borderRadius: 99,
              backgroundColor: "rgba(212,175,55,0.2)",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                borderRadius: 99,
                backgroundColor: "#D4AF37",
                width: `${progress * 100}%`,
              }}
            />
          </View>
        </View>

        <ChevronRight color="#8B7355" size={20} />
      </TouchableOpacity>
    </View>
  );
}
