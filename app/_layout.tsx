/**
 * Root Layout
 *
 * The main layout component that wraps the entire app.
 * Handles:
 * - Theme provider (dark/light mode)
 * - Convex provider (backend connection)
 * - Navigation stack
 * - App initialization
 *
 * REMINDER: You must configure the iOS Shortcut manually:
 * 1. Open Shortcuts > Automation > App (Instagram) > Is Opened.
 * 2. Logic: If Clipboard == "PASS_OPEN" → Clear Clipboard & Stop. Else → Open [This App].
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { ConvexProvider } from "@/convex/ConvexProvider";
import { initBackgroundTimer, setExpireCallback, isTimerActive } from "@/services/background-timer";
import { startStorm, resumeStormIfActive, configureNotifications } from "@/services/notification-storm";
import { clearPassOpen } from "@/services/clipboard-handshake";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize app services on mount
  useEffect(() => {
    async function initialize() {
      // Configure notifications handler
      configureNotifications();

      // Initialize background timer service
      await initBackgroundTimer();

      // Set up timer expiration callback
      setExpireCallback(() => {
        console.log("[RootLayout] Timer expired, starting notification storm");
        startStorm();
      });

      // Resume any active notification storm
      await resumeStormIfActive();

      // Check if there's an active timer (user returned from Instagram)
      const hasActiveTimer = await isTimerActive();
      if (!hasActiveTimer) {
        // Clear any stale clipboard tokens
        await clearPassOpen();
      }
    }

    initialize();
  }, []);

  return (
    <ConvexProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Main tabs screen */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Interceptor flow screens */}
          <Stack.Screen
            name="intervention"
            options={{
              headerShown: false,
              presentation: "card",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="time-selector"
            options={{
              headerShown: false,
              presentation: "modal",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="shortbreak"
            options={{
              headerShown: false,
              presentation: "card",
              gestureEnabled: true,
            }}
          />

          {/* Learning Feed screens */}
          <Stack.Screen
            name="course-create"
            options={{
              headerShown: false,
              presentation: "modal",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="learning-feed"
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
              gestureEnabled: false,
            }}
          />

          {/* Legacy modal */}
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ConvexProvider>
  );
}
