import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useDailyVerse } from "@features/bible/hooks/useDailyVerse";
import { useLastPosition } from "@features/bible/hooks/useLastPosition";

export default function HomeScreen() {
  const router = useRouter();
  const { verse } = useDailyVerse();
  const { lastPosition } = useLastPosition();

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-950"
      contentContainerClassName="px-5 pt-16 pb-10"
    >
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        λόγος
      </Text>

      {verse && (
        <TouchableOpacity
          className="bg-primary-50 dark:bg-primary-900 rounded-2xl p-5 mb-5"
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              `/(app)/reader?book=${verse.book_id}&chapter=${verse.chapter}`,
            )
          }
        >
          <Text className="text-xs text-primary-600 dark:text-primary-300 mb-2 font-semibold tracking-widest">
            VERSÍCULO DO DIA
          </Text>
          <Text className="text-gray-800 dark:text-gray-100 text-base leading-relaxed mb-3">
            {verse.text}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {verse.reference}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-4"
        activeOpacity={0.8}
        onPress={() =>
          router.push(
            `/(app)/reader?book=${lastPosition.book_id}&chapter=${lastPosition.chapter}`,
          )
        }
      >
        <View className="flex-1">
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold tracking-widest">
            CONTINUAR LEITURA
          </Text>
          <Text className="font-semibold text-gray-900 dark:text-white text-base">
            {lastPosition.book_name} {lastPosition.chapter}
          </Text>
        </View>
        <Text className="text-primary-500 text-xl font-light">→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
