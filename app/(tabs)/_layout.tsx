/**
 * Tab Layout
 *
 * Simplified tab navigation for the ShortBreak app.
 * Currently only showing the Home tab since the app's main flow
 * is stack-based (Home → Intervention → Time Selector, etc.)
 *
 * REMINDER: You must configure the iOS Shortcut manually:
 * 1. Open Shortcuts > Automation > App (Instagram) > Is Opened.
 * 2. Logic: If Clipboard == "PASS_OPEN" → Clear Clipboard & Stop. Else → Open [This App].
 */

import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        // Hide the tab bar since we only have one main screen
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      {/* Hide explore tab but keep file for potential future use */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
