import { View, Text, TouchableOpacity, Share } from "react-native";
import { Share2 } from "lucide-react-native";

interface Props {
  text: string;
  reference: string;
}

export function DailyVerseCard({ text, reference }: Props) {
  const handleShare = () => {
    Share.share({ message: `"${text}" — ${reference}` });
  };

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
        VERSÍCULO DO DIA
      </Text>

      <View
        style={{
          backgroundColor: "#EDE0C4",
          borderRadius: 12,
          padding: 24,
          borderLeftWidth: 6,
          borderLeftColor: "#D4AF37",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontSize: 19,
            lineHeight: 32,
            fontStyle: "italic",
            color: "#3F3024",
            marginBottom: 16,
          }}
        >
          "{text}"
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#8B7355" }}>
            {reference}
          </Text>
          <TouchableOpacity onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Share2 color="#D4AF37" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
