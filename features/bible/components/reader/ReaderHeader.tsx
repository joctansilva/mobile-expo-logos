import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";

interface Props {
  bookName: string;
  chapter: number;
  translation: string;
  onBack: () => void;
}

export function ReaderHeader({ bookName, chapter, translation, onBack }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{ width: 36 }}
      >
        <ArrowLeft color="#E2D4B5" size={22} />
      </TouchableOpacity>

      <Text
        style={{
          color: "#E2D4B5",
          fontSize: 18,
          fontStyle: "italic",
          letterSpacing: 0.5,
          flex: 1,
          textAlign: "center",
        }}
      >
        {bookName} · Capítulo {chapter}
      </Text>

      <View style={{ width: 36, alignItems: "flex-end" }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#D4AF37",
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              color: "#D4AF37",
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.5,
            }}
          >
            {translation}
          </Text>
        </View>
      </View>
    </View>
  );
}
