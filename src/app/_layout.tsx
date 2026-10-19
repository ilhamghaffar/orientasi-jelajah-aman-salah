// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider, useAppTheme } from "../providers/theme-provider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { colors, theme } = useAppTheme();

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="detail/[kota]"
          options={{ title: "Detail Cuaca" }}
        />

        <Stack.Screen
          name="tambah-favorit"
          options={{
            presentation: "modal",
            title: "Tambah Favorit",
          }}
        />
      </Stack>
    </>
  );
}
