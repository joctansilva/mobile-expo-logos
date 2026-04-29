import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";

export function HomeHeader() {
  const router = useRouter();

  return (
    <View
      style={{
        backgroundColor: "#3F3024",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 16,
      }}
    >
      <Text
        style={{
          color: "#E2D4B5",
          fontSize: 24,
          fontStyle: "italic",
          letterSpacing: 1,
        }}
      >
        Logós
      </Text>
      <TouchableOpacity
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onPress={() => router.push("/(app)/settings" as any)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Settings color="#E2D4B5" size={22} />
      </TouchableOpacity>
    </View>
  );
}
