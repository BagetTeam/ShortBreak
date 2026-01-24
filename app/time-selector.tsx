/**
 * Time Selector Screen
 *
 * Allows the user to select how long they want to scroll on Instagram.
 * After selection, it launches Instagram with the timer set.
 *
 * Options: 5, 10, 15 minutes (or custom)
 *
 * REMINDER: You must configure the iOS Shortcut manually:
 * 1. Open Shortcuts > Automation > App (Instagram) > Is Opened.
 * 2. Logic: If Clipboard == "PASS_OPEN" → Clear Clipboard & Stop. Else → Open [This App].
 */

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { launchFeed } from "@/services/instagram-launcher";

// Preset time options in minutes
const TIME_OPTIONS = [
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
];

export default function TimeSelectorScreen() {
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [customTime, setCustomTime] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeSelect = (minutes: number) => {
    setSelectedTime(minutes);
    setIsCustom(false);
    setCustomTime("");
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
    setSelectedTime(null);
  };

  const handleCustomTimeChange = (text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, "");
    setCustomTime(numericValue);
    if (numericValue) {
      setSelectedTime(parseInt(numericValue, 10));
    } else {
      setSelectedTime(null);
    }
  };

  const handleConfirm = async () => {
    if (!selectedTime) return;

    // Validate time (1-60 minutes)
    if (selectedTime < 1 || selectedTime > 60) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await launchFeed(selectedTime);
      if (success) {
        // Go back to home screen (will be behind Instagram)
        router.replace("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isValidTime = selectedTime && selectedTime >= 1 && selectedTime <= 60;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Set Your Limit</Text>
              <Text style={styles.subtitle}>
                How long do you want to scroll?
              </Text>
            </View>

            {/* Time Options */}
            <View style={styles.optionsContainer}>
              {TIME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    selectedTime === option.value &&
                      !isCustom &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => handleTimeSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedTime === option.value &&
                        !isCustom &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Time Input */}
            <View style={styles.customContainer}>
              <TouchableOpacity
                style={[
                  styles.customToggle,
                  isCustom && styles.customToggleActive,
                ]}
                onPress={handleCustomToggle}
              >
                <Text
                  style={[
                    styles.customToggleText,
                    isCustom && styles.customToggleTextActive,
                  ]}
                >
                  Custom Time
                </Text>
              </TouchableOpacity>

              {isCustom && (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.customInput}
                    value={customTime}
                    onChangeText={handleCustomTimeChange}
                    placeholder="Enter minutes"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    keyboardType="number-pad"
                    maxLength={2}
                    autoFocus
                  />
                  <Text style={styles.customInputLabel}>minutes</Text>
                </View>
              )}
            </View>

            {/* Warning */}
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                You will receive persistent notifications when your time is up.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !isValidTime && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!isValidTime || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#4facfe" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Open Instagram ({selectedTime || "?"} min)
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>
                  Actually, Never Mind
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 32,
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  optionTextSelected: {
    color: "#4facfe",
  },
  customContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  customToggle: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  customToggleActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "#fff",
  },
  customToggleText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "500",
  },
  customToggleTextActive: {
    color: "#fff",
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  customInput: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    width: 100,
    textAlign: "center",
  },
  customInputLabel: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 12,
  },
  warningContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  buttonsContainer: {
    marginTop: "auto",
    gap: 12,
  },
  confirmButton: {
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
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4facfe",
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
