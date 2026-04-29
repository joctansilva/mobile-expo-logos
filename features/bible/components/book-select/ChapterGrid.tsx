import { View, Text, TouchableOpacity } from "react-native";

interface Props {
  totalChapters: number;
  currentChapter?: number;
  onPress: (chapter: number) => void;
}

const COLS = 4;

export function ChapterGrid({ totalChapters, currentChapter, onPress }: Props) {
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  const rows: number[][] = [];
  for (let i = 0; i < chapters.length; i += COLS) {
    rows.push(chapters.slice(i, i + COLS));
  }

  return (
    <View style={{ gap: 10 }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap: 10 }}>
          {row.map((ch) => {
            const active = ch === currentChapter;
            return (
              <TouchableOpacity
                key={ch}
                onPress={() => onPress(ch)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  backgroundColor: active ? "#D4AF37" : "#EDE0C4",
                  borderRadius: 12,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? "#D4AF37" : "#E2D4B5",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: active ? "#D4AF37" : "#000",
                  shadowOffset: { width: 0, height: active ? 3 : 1 },
                  shadowOpacity: active ? 0.35 : 0.08,
                  shadowRadius: active ? 8 : 2,
                  elevation: active ? 5 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: active ? "#fff" : "#3F3024",
                  }}
                >
                  {ch}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* preenche células vazias na última linha */}
          {row.length < COLS &&
            Array.from({ length: COLS - row.length }).map((_, i) => (
              <View key={`pad-${i}`} style={{ flex: 1 }} />
            ))}
        </View>
      ))}
    </View>
  );
}
