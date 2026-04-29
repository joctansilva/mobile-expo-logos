import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DatabaseProvider } from "@db/provider";
import { setupBibleDb } from "@db/setup";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
});

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  const [fontsLoaded] = useFonts({
    // Fontes bíblicas — adicionar arquivos em assets/fonts/ para ativar
    // SBLHebrew: require("../assets/fonts/SBLHebrew.ttf"),
    // SBLGreek: require("../assets/fonts/SBLGreek.ttf"),
    // Inter_400Regular: require("../assets/fonts/Inter-Regular.ttf"),
    // Inter_700Bold: require("../assets/fonts/Inter-Bold.ttf"),
  });

  useEffect(() => {
    setupBibleDb()
      .then(() => setDbReady(true))
      .catch((e) => {
        console.error("setupBibleDb failed:", e);
        setDbReady(true); // não bloquear o app em caso de erro
      });
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady) SplashScreen.hideAsync();
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <DatabaseProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(app)" />
            <Stack.Screen name="index" />
          </Stack>
        </DatabaseProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
