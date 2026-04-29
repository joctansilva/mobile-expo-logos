import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useDailyVerse } from "@features/bible/hooks/useDailyVerse";
import { useLastPosition } from "@features/bible/hooks/useLastPosition";
import { useBibleStore } from "@features/bible/store/bibleStore";
import { HomeHeader } from "@features/bible/components/home/HomeHeader";
import { HeroImage } from "@features/bible/components/home/HeroImage";
import { DailyVerseCard } from "@features/bible/components/home/DailyVerseCard";
import { ContinueReadingCard } from "@features/bible/components/home/ContinueReadingCard";
import { RecentChips } from "@features/bible/components/home/RecentChips";
import { StudyToolsGrid } from "@features/bible/components/home/StudyToolsGrid";

export default function HomeScreen() {
  const router = useRouter();
  const { verse } = useDailyVerse();
  const { lastPosition } = useLastPosition();
  const recentChapters = useBibleStore((s) => s.recentChapters);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5EDD8" }}>
      {/* Status bar area takes the brown color */}
      <View style={{ backgroundColor: "#3F3024" }}>
        <SafeAreaView edges={["top"]}>
          <HomeHeader />
        </SafeAreaView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroImage />

        {verse && <DailyVerseCard text={verse.text} reference={verse.reference} />}

        <ContinueReadingCard
          bookName={lastPosition.book_name}
          chapter={lastPosition.chapter}
          onPress={() =>
            router.push(
              `/(app)/reader?book=${lastPosition.book_id}&chapter=${lastPosition.chapter}`,
            )
          }
        />

        <RecentChips
          items={recentChapters}
          onPress={(item) =>
            router.push(
              `/(app)/reader?book=${item.book_id}&chapter=${item.chapter}`,
            )
          }
        />

        <StudyToolsGrid />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#3F3024",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(212,175,55,0.4)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus color="#D4AF37" size={24} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
