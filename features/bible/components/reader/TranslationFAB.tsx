import { View, Text, TouchableOpacity } from "react-native";
import { BookOpen } from "lucide-react-native";

interface Props {
  translation: string;
  bottomInset: number;
  onPress?: () => void;
}

export function TranslationFAB({ translation, bottomInset, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        position: "absolute",
        bottom: bottomInset + 24,
        right: 20,
        backgroundColor: "#3F3024",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: "rgba(212,175,55,0.2)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      <BookOpen color="#D4AF37" size={18} />
      <Text
        style={{
          color: "#D4AF37",
          fontSize: 13,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
          fontStyle: "italic",
        }}
      >
        {translation}
      </Text>
    </TouchableOpacity>
  );
}
