import { View, Text, Pressable, ScrollView, TouchableOpacity } from "react-native";
import type { ChapterVerse, VerseToken } from "@features/bible/hooks/useChapter";

interface Props {
  verse: ChapterVerse;
  tokens: VerseToken[];
  strongMode: boolean;
  selected: boolean;
  onLongPress: () => void;
  onPress: () => void;
  onStrongIdPress?: (strongId: string) => void;
}

export function VerseBlock({
  verse,
  tokens,
  strongMode,
  selected,
  onLongPress,
  onPress,
  onStrongIdPress,
}: Props) {
  const tokensWithStrong = tokens.filter((t) => t.strong_id);

  return (
    <View style={{ marginBottom: 14 }}>
      <Pressable
        onLongPress={onLongPress}
        onPress={onPress}
        style={{
          backgroundColor: selected ? "rgba(237,224,196,0.5)" : "transparent",
          borderRadius: 12,
          padding: selected ? 12 : 0,
          marginHorizontal: selected ? -4 : 0,
          borderWidth: selected ? 1 : 0,
          borderColor: "rgba(212,175,55,0.25)",
        }}
        android_ripple={{ color: "rgba(212,175,55,0.1)", borderless: false }}
      >
        <Text style={{ fontSize: 19, lineHeight: 34, color: "#3F3024" }}>
          <Text
            style={{
              color: "#C9882A",
              fontSize: 11,
              fontWeight: "700",
              lineHeight: 34,
            }}
          >
            {verse.verse}
            {"  "}
          </Text>
          {verse.text}
        </Text>
      </Pressable>

      {/* Tokens do original (modo Strong) */}
      {strongMode && tokensWithStrong.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ flexDirection: "row", gap: 6, paddingHorizontal: 4 }}
        >
          {tokensWithStrong.map((token) => (
            <TouchableOpacity
              key={token.id}
              onPress={() => token.strong_id && onStrongIdPress?.(token.strong_id)}
              activeOpacity={0.7}
              style={{
                backgroundColor: "#EDE0C4",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 6,
                alignItems: "center",
                minWidth: 48,
                borderWidth: 1,
                borderColor: "rgba(212,175,55,0.4)",
              }}
            >
              <Text style={{ fontSize: 13, color: "#3F3024", marginBottom: 2 }}>
                {token.word_surface}
              </Text>
              <Text style={{ fontSize: 10, color: "#D4AF37", fontWeight: "700" }}>
                {token.strong_id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
