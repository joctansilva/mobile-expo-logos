import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5EDD8" }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#8B7355", fontSize: 16 }}>
          Configurações — em breve
        </Text>
      </View>
    </SafeAreaView>
  );
}
