import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ReaderScreen() {
  const { book, chapter } = useLocalSearchParams<{
    book: string;
    chapter: string;
  }>();

  const bookId = parseInt(book ?? "43");
  const chapterNum = parseInt(chapter ?? "1");

  return (
    <View className="flex-1 bg-white dark:bg-gray-950 items-center justify-center px-5">
      <Text className="text-gray-400 text-base">
        Livro {bookId} · Capítulo {chapterNum} — em breve
      </Text>
    </View>
  );
}
