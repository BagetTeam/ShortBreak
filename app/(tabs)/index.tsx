/**
 * Home Screen (Gateway)
 *
 * The main entry point of the app. Users land here when they try to open
 * Instagram and are redirected by the iOS Shortcut.
 *
 * Presents two options:
 * - "Go to Messages" - Opens Instagram DMs with 2-minute timer
 * - "I Want to Scroll" - Navigates to intervention screen
 *
 * REMINDER: You must configure the iOS Shortcut manually:
 * 1. Open Shortcuts > Automation > App (Instagram) > Is Opened.
 * 2. Logic: If Clipboard == "PASS_OPEN" → Clear Clipboard & Stop. Else → Open [This App].
 */

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { launchMessages, stopSession, isNudgeActive } from "@/services/instagram-launcher";
import {
  requestPermissions,
  configureNotifications,
} from "@/services/notification-storm";
import { initBackgroundTimer } from "@/services/background-timer";

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasStormActive, setHasStormActive] = useState(false);

  // Initialize services and request permissions on mount
  useEffect(() => {
    async function initialize() {
      // Configure notifications
      configureNotifications();

      // Request notification permissions
      await requestPermissions();

      // Initialize background timer service
      await initBackgroundTimer();

      // Check if there's an active notification storm
      const stormActive = await isNudgeActive();
      setHasStormActive(stormActive);

      setIsInitialized(true);
    }

    initialize();
  }, []);

  // Check for active storm when screen comes into focus
  useEffect(() => {
    const checkStorm = async () => {
      const stormActive = await isNudgeActive();
      setHasStormActive(stormActive);
    };

    // Check periodically
    const interval = setInterval(checkStorm, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMessagesPress = async () => {
    setIsLoading(true);
    try {
      await launchMessages();
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrollPress = () => {
    // Navigate to intervention screen (second chance)
    router.push("/intervention");
  };

  const handleStopStorm = async () => {
    setIsLoading(true);
    try {
      await stopSession();
      setHasStormActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show storm active UI if there's an active notification storm
  if (hasStormActive) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={["#FF6B6B", "#FF8E53"]}
          style={styles.gradientBackground}
        >
          <View style={styles.content}>
            <Text style={styles.stormTitle}>Welcome Back!</Text>
            <Text style={styles.stormSubtitle}>
              Your scroll time is up. Great job coming back!
            </Text>

            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopStorm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FF6B6B" />
              ) : (
                <Text style={styles.stopButtonText}>Stop Notifications</Text>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.appName}>ShortBreak</Text>
            <Text style={styles.tagline}>Mindful Social Media</Text>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>What brings you to Instagram?</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.messagesButton]}
              onPress={handleMessagesPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#667eea" />
              ) : (
                <>
                  <Text style={styles.buttonEmoji}>💬</Text>
                  <Text style={styles.buttonTitle}>Go to Messages</Text>
                  <Text style={styles.buttonSubtitle}>2 minute session</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.scrollButton]}
              onPress={handleScrollPress}
              disabled={isLoading}
            >
              <Text style={styles.buttonEmoji}>📱</Text>
              <Text style={styles.buttonTitle}>I Want to Scroll</Text>
              <Text style={styles.buttonSubtitle}>Are you sure?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.learnButton}
              onPress={() => router.push("/course-create")}
            >
              <Text style={styles.learnButtonText}>
                📚 Learn Something Instead
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#667eea",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  questionContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  question: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  messagesButton: {
    backgroundColor: "#fff",
  },
  scrollButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  buttonEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  buttonSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  footer: {
    paddingTop: 20,
    alignItems: "center",
  },
  learnButton: {
    padding: 16,
  },
  learnButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  // Storm active styles
  stormTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  stormSubtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 40,
  },
  stopButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
});
