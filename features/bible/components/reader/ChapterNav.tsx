import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

interface Props {
  chapter: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function ChapterNav({ chapter, canGoPrev, canGoNext, onPrev, onNext }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
        paddingVertical: 16,
        marginBottom: 8,
      }}
    >
      <TouchableOpacity
        onPress={onPrev}
        disabled={!canGoPrev}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <ChevronLeft
          color={canGoPrev ? "#8B7355" : "rgba(139,115,85,0.3)"}
          size={22}
        />
      </TouchableOpacity>

      <Text
        style={{
          color: "#8B7355",
          fontSize: 13,
          fontStyle: "italic",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        Capítulo {chapter}
      </Text>

      <TouchableOpacity
        onPress={onNext}
        disabled={!canGoNext}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <ChevronRight
          color={canGoNext ? "#8B7355" : "rgba(139,115,85,0.3)"}
          size={22}
        />
      </TouchableOpacity>
    </View>
  );
}
