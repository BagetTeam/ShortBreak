/**
 * ShortBreak Screen (Mindfulness)
 *
 * A calming screen shown when the user chooses mindfulness over scrolling.
 * Celebrates their decision and offers simple mindfulness prompts.
 *
 * REMINDER: You must configure the iOS Shortcut manually:
 * 1. Open Shortcuts > Automation > App (Instagram) > Is Opened.
 * 2. Logic: If Clipboard == "PASS_OPEN" → Clear Clipboard & Stop. Else → Open [This App].
 */

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Mindfulness prompts to rotate through
const MINDFULNESS_PROMPTS = [
  {
    title: "Breathe",
    description: "Take 3 deep breaths. Inhale for 4 seconds, hold for 4, exhale for 4.",
  },
  {
    title: "Notice",
    description: "Look around you. Name 5 things you can see, 4 you can touch, 3 you can hear.",
  },
  {
    title: "Gratitude",
    description: "Think of 3 things you're grateful for right now, big or small.",
  },
  {
    title: "Body Scan",
    description: "Starting from your toes, slowly notice how each part of your body feels.",
  },
  {
    title: "Present Moment",
    description: "What's one thing you can do right now that would make you feel accomplished?",
  },
];

// Encouraging messages
const ENCOURAGEMENT = [
  "You made a great choice.",
  "Your future self thanks you.",
  "This is what self-care looks like.",
  "You're stronger than the algorithm.",
  "Small wins lead to big changes.",
];

export default function ShortBreakScreen() {
  const router = useRouter();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  // Get random encouragement
  const encouragement = ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];
  const currentPrompt = MINDFULNESS_PROMPTS[currentPromptIndex];

  useEffect(() => {
    // Auto-rotate prompts every 30 seconds
    const interval = setInterval(() => {
      handleNextPrompt();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPromptIndex]);

  const handleNextPrompt = () => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Change prompt
      setCurrentPromptIndex((prev) => (prev + 1) % MINDFULNESS_PROMPTS.length);
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleGoHome = () => {
    router.replace("/");
  };

  const handleLearn = () => {
    router.push("/course-create");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#11998e", "#38ef7d"]}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.celebrationEmoji}>🌟</Text>
            <Text style={styles.title}>Great Choice!</Text>
            <Text style={styles.subtitle}>{encouragement}</Text>
          </View>

          {/* Mindfulness Card */}
          <Animated.View style={[styles.mindfulnessCard, { opacity: fadeAnim }]}>
            <Text style={styles.promptTitle}>{currentPrompt.title}</Text>
            <Text style={styles.promptDescription}>
              {currentPrompt.description}
            </Text>
            <TouchableOpacity
              style={styles.nextPromptButton}
              onPress={handleNextPrompt}
            >
              <Text style={styles.nextPromptText}>Try Another →</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats/Progress Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🛡️</Text>
              <Text style={styles.statLabel}>Dopamine hit avoided</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>⏰</Text>
              <Text style={styles.statLabel}>~15 min saved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🧠</Text>
              <Text style={styles.statLabel}>Mental clarity +1</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.learnButton}
              onPress={handleLearn}
            >
              <Text style={styles.learnButtonText}>
                📚 Learn Something Instead
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleGoHome}
            >
              <Text style={styles.homeButtonText}>Back to Home</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  mindfulnessCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#11998e",
    marginBottom: 12,
    textAlign: "center",
  },
  promptDescription: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  nextPromptButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  nextPromptText: {
    color: "#11998e",
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    maxWidth: 80,
  },
  buttonsContainer: {
    marginTop: "auto",
    gap: 12,
  },
  learnButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  learnButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#11998e",
  },
  homeButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
