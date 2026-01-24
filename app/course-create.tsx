/**
 * Course Creation Screen
 *
 * Allows users to create a new learning course by:
 * - Entering a text prompt (e.g., "History of Rome")
 * - OR uploading a PDF (syllabus/outline)
 *
 * The AI (Gemini) then generates a structured learning path.
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
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Sample prompts for inspiration
const SAMPLE_PROMPTS = [
  "Introduction to Quantum Physics",
  "History of Ancient Rome",
  "JavaScript for Beginners",
  "Understanding Climate Change",
  "Basics of Personal Finance",
];

export default function CourseCreateScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Convex hooks
  const getOrCreateUser = useMutation(api.mutations.getOrCreateUser);
  const createCourse = useMutation(api.mutations.createCourse);
  const addFeedItems = useMutation(api.mutations.addFeedItems);
  const generateUploadUrl = useMutation(api.mutations.generateUploadUrl);
  const generateCourseOutline = useAction(api.actions.gemini.generateCourseOutline);
  const generateOutlineFromPDF = useAction(api.actions.gemini.generateOutlineFromPDF);
  const fetchVideosForTopics = useAction(api.actions.youtube.fetchVideosForTopics);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setPrompt(""); // Clear text prompt when PDF is selected
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const handleSelectSample = (sample: string) => {
    setPrompt(sample);
    setSelectedFile(null);
  };

  const handleCreateCourse = async () => {
    if (!prompt.trim() && !selectedFile) {
      Alert.alert("Input Required", "Please enter a topic or upload a PDF.");
      return;
    }

    setIsLoading(true);

    try {
      // Get or create user
      setLoadingMessage("Setting up...");
      let userId = await AsyncStorage.getItem("@ShortBreak:userId");

      if (!userId) {
        const newUserId = await getOrCreateUser({ name: "User" });
        userId = newUserId;
        await AsyncStorage.setItem("@ShortBreak:userId", newUserId);
      }

      let courseOutline;
      let pdfStorageId;

      if (selectedFile) {
        // Upload PDF and generate outline from it
        setLoadingMessage("Uploading document...");

        // Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload the file
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": selectedFile.mimeType || "application/pdf",
          },
          body: blob,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload PDF");
        }

        const { storageId } = await uploadResponse.json();
        pdfStorageId = storageId;

        setLoadingMessage("Analyzing document with AI...");
        courseOutline = await generateOutlineFromPDF({ pdfStorageId: storageId });
      } else {
        // Generate outline from text prompt
        setLoadingMessage("Generating course outline with AI...");
        courseOutline = await generateCourseOutline({ prompt: prompt.trim() });
      }

      // Create course in database
      setLoadingMessage("Creating course...");
      const courseId = await createCourse({
        userId: userId as any,
        title: courseOutline.courseTitle,
        originalPrompt: prompt.trim() || `PDF: ${selectedFile?.name}`,
        pdfStorageId,
      });

      // Fetch videos for each topic
      setLoadingMessage("Finding educational videos...");
      const topicsWithVideos = await fetchVideosForTopics({
        topics: courseOutline.topics.map((t: any) => ({
          title: t.title,
          searchQuery: t.searchQuery,
        })),
      });

      // Add feed items to the course
      setLoadingMessage("Building your feed...");
      const feedItems = topicsWithVideos
        .filter((t: any) => t.video !== null)
        .map((t: any, index: number) => ({
          videoId: t.video.videoId,
          topicTitle: t.topicTitle,
          order: index,
          metaData: {
            channelName: t.video.channelName,
            duration: t.video.duration,
            thumbnailUrl: t.video.thumbnailUrl,
            title: t.video.title,
          },
        }));

      if (feedItems.length === 0) {
        throw new Error("No videos found for this topic. Try a different prompt.");
      }

      await addFeedItems({ courseId, items: feedItems });

      // Navigate to the learning feed
      router.push({
        pathname: "/learning-feed",
        params: { courseId },
      });
    } catch (error) {
      console.error("Error creating course:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create course. Please try again."
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#6a11cb", "#2575fc"]}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Learn Something</Text>
              <Text style={styles.subtitle}>
                What do you want to learn about?
              </Text>
            </View>

            {/* Loading State */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>{loadingMessage}</Text>
                <Text style={styles.loadingSubtext}>
                  This may take a moment...
                </Text>
              </View>
            ) : (
              <>
                {/* Text Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={prompt}
                    onChangeText={(text) => {
                      setPrompt(text);
                      if (text) setSelectedFile(null);
                    }}
                    placeholder="Enter a topic (e.g., 'History of Rome')"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    multiline
                    maxLength={200}
                    editable={!selectedFile}
                  />
                  <Text style={styles.charCount}>{prompt.length}/200</Text>
                </View>

                {/* OR Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* PDF Upload */}
                <View style={styles.uploadContainer}>
                  {selectedFile ? (
                    <View style={styles.selectedFileContainer}>
                      <Text style={styles.selectedFileName} numberOfLines={1}>
                        📄 {selectedFile.name}
                      </Text>
                      <TouchableOpacity onPress={handleClearFile}>
                        <Text style={styles.clearButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={handlePickDocument}
                    >
                      <Text style={styles.uploadButtonText}>
                        📁 Upload a Syllabus (PDF)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Sample Prompts */}
                <View style={styles.samplesContainer}>
                  <Text style={styles.samplesTitle}>Need inspiration?</Text>
                  <View style={styles.samplesList}>
                    {SAMPLE_PROMPTS.map((sample, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.sampleChip}
                        onPress={() => handleSelectSample(sample)}
                      >
                        <Text style={styles.sampleChipText}>{sample}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Create Button */}
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    (!prompt.trim() && !selectedFile) && styles.createButtonDisabled,
                  ]}
                  onPress={handleCreateCourse}
                  disabled={!prompt.trim() && !selectedFile}
                >
                  <Text style={styles.createButtonText}>
                    Create Learning Feed
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>← Go Back</Text>
            </TouchableOpacity>
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  loadingSubtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  uploadContainer: {
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  selectedFileContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedFileName: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  clearButton: {
    color: "#fff",
    fontSize: 20,
    padding: 4,
  },
  samplesContainer: {
    marginBottom: 24,
  },
  samplesTitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 12,
  },
  samplesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sampleChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  sampleChipText: {
    color: "#fff",
    fontSize: 13,
  },
  createButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6a11cb",
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
