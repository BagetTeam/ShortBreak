/**
 * Intervention Screen (Second Chance)
 *
 * This screen appears when the user chooses "I Want to Scroll".
 * It provides a moment of friction/reflection before opening Instagram.
 *
 * Options:
 * - "Go on ShortBreak" - Navigate to mindfulness screen (crisis averted)
 * - "Continue to Reels" - Navigate to time selector modal
 *
 * REMINDER: You must configure the iOS Shortcut manually:
 * 1. Open Shortcuts > Automation > App (Instagram) > Is Opened.
 * 2. Logic: If Clipboard == "PASS_OPEN" → Clear Clipboard & Stop. Else → Open [This App].
 */

import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function InterventionScreen() {
  const router = useRouter();

  const handleShortBreak = () => {
    // Navigate to mindfulness screen
    router.push("/shortbreak");
  };

  const handleContinue = () => {
    // Navigate to time selector
    router.push("/time-selector");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#f093fb", "#f5576c"]}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Hold On a Second</Text>
            <Text style={styles.subtitle}>
              Before you scroll, take a moment to reflect.
            </Text>
          </View>

          {/* Reflection Questions */}
          <View style={styles.reflectionContainer}>
            <Text style={styles.reflectionTitle}>Ask yourself:</Text>
            <View style={styles.questionItem}>
              <Text style={styles.questionBullet}>•</Text>
              <Text style={styles.questionText}>
                Is there something better I could be doing right now?
              </Text>
            </View>
            <View style={styles.questionItem}>
              <Text style={styles.questionBullet}>•</Text>
              <Text style={styles.questionText}>
                Will scrolling actually make me feel better?
              </Text>
            </View>
            <View style={styles.questionItem}>
              <Text style={styles.questionBullet}>•</Text>
              <Text style={styles.questionText}>
                What am I avoiding by reaching for Instagram?
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.shortBreakButton]}
              onPress={handleShortBreak}
            >
              <Text style={styles.shortBreakEmoji}>🧘</Text>
              <Text style={styles.shortBreakTitle}>Go on ShortBreak</Text>
              <Text style={styles.shortBreakSubtitle}>
                Choose mindfulness instead
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={handleContinue}
            >
              <Text style={styles.continueEmoji}>⏱️</Text>
              <Text style={styles.continueTitle}>Continue to Reels</Text>
              <Text style={styles.continueSubtitle}>
                Set a time limit first
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  reflectionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  questionItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  questionBullet: {
    color: "#fff",
    fontSize: 16,
    marginRight: 8,
    width: 16,
  },
  questionText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  button: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shortBreakButton: {
    backgroundColor: "#fff",
  },
  shortBreakEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  shortBreakTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5576c",
  },
  shortBreakSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  continueEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  continueTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  continueSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  backButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
