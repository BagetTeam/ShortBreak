import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '@/convex/_generated/api';
import { FeedVideoCard, type FeedVideoItem } from '@/components/learning-feed/FeedVideoCard';
import { PromptComposer } from '@/components/learning-feed/PromptComposer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { convex } from '@/lib/convex';

type Course = {
  _id: string;
  title: string;
  lastPosition?: number;
  originalPrompt?: string;
};

type FeedItemWithOrder = FeedVideoItem & { order: number };

const storageKeyForCourse = (courseId: string) => `course:${courseId}:lastPosition`;

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result?.toString() ?? '';
      const base64 = dataUrl.split(',')[1] ?? '';
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(blob);
  });

export default function FeedScreen() {
  const { height } = useWindowDimensions();
  const listRef = useRef<FlatList<FeedItemWithOrder> | null>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItemWithOrder[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listHeight, setListHeight] = useState(height);

  const isConvexConfigured = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);

  const loadLatestCourse = useCallback(async () => {
    if (!isConvexConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const latest = (await convex.query(api.actions.getLatestCourse, {
        userName: 'local',
      })) as Course | null;
      setCourse(latest);

      if (latest?._id) {
        const items = (await convex.query(api.actions.getFeedItems, {
          courseId: latest._id,
        })) as Array<FeedItemWithOrder>;
        const sorted = [...items].sort((a, b) => a.order - b.order);
        setFeedItems(sorted);
      } else {
        setFeedItems([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course.');
    } finally {
      setIsLoading(false);
    }
  }, [isConvexConfigured]);

  useEffect(() => {
    loadLatestCourse();
  }, [loadLatestCourse]);

  useEffect(() => {
    if (!course?._id || feedItems.length === 0) {
      setInitialIndex(0);
      return;
    }

    const hydrate = async () => {
      const stored = await AsyncStorage.getItem(storageKeyForCourse(course._id));
      const storedIndex = stored ? Number.parseInt(stored, 10) : 0;
      const serverIndex = course.lastPosition ?? 0;
      const preferredIndex = Number.isFinite(storedIndex)
        ? Math.max(storedIndex, serverIndex)
        : serverIndex;
      const maxIndex = Math.max(feedItems.length - 1, 0);
      const startIndex = Math.min(preferredIndex, maxIndex);

      setInitialIndex(startIndex);
      setActiveIndex(startIndex);
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: startIndex, animated: false });
      }, 200);
    };

    hydrate();
  }, [course?._id, course?.lastPosition, feedItems.length]);

  const pickPdf = useCallback(async () => {
    setError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.length) {
        return;
      }
      setSelectedPdf(result.assets[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick PDF.');
    }
  }, []);

  const uploadPdf = useCallback(
    async (file: DocumentPicker.DocumentPickerAsset) => {
      const uploadUrl = (await convex.mutation(api.actions.generateUploadUrl, {})) as string;
      const fileUri = file.uri;
      const fileResponse = await fetch(fileUri);
      const blob = await fileResponse.blob();

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.mimeType ?? 'application/pdf' },
        body: blob,
      });

      if (!uploadResponse.ok) {
        const errorBody = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} ${errorBody}`);
      }

      const { storageId } = (await uploadResponse.json()) as { storageId: string };
      const pdfBase64 = await blobToBase64(blob);
      return { storageId, pdfBase64 };
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!isConvexConfigured) {
      setError('Set EXPO_PUBLIC_CONVEX_URL to use the learning feed.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt && !selectedPdf) {
        throw new Error('Add a prompt or select a PDF to continue.');
      }

      let pdfStorageId: string | undefined;
      let pdfBase64: string | undefined;

      if (selectedPdf) {
        const uploadResult = await uploadPdf(selectedPdf);
        pdfStorageId = uploadResult.storageId;
        pdfBase64 = uploadResult.pdfBase64;
      }

      const outline = (await convex.action(api.actions.generateCourseOutline, {
        prompt: trimmedPrompt || undefined,
        pdfBase64,
        courseHint: trimmedPrompt || selectedPdf?.name,
      })) as {
        courseTitle: string;
        feedItems: FeedVideoItem[];
      };

      const orderedFeedItems = outline.feedItems.map((item, index) => ({
        ...item,
        order: index,
        metaData: item.metaData ?? {},
      }));

      const originalPrompt =
        trimmedPrompt || (selectedPdf?.name ? `PDF: ${selectedPdf.name}` : 'PDF upload');

      await convex.mutation(api.actions.createCourseWithFeed, {
        title: outline.courseTitle,
        originalPrompt,
        pdfStorageId,
        feedItems: orderedFeedItems,
        userName: 'local',
      });

      setPrompt('');
      setSelectedPdf(null);
      setShowComposer(false);
      await loadLatestCourse();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate feed.');
    } finally {
      setIsGenerating(false);
    }
  }, [isConvexConfigured, loadLatestCourse, prompt, selectedPdf, uploadPdf]);

  const handleAppendNextModule = useCallback(async () => {
    if (!course || isAppending) {
      return;
    }
    setIsAppending(true);
    try {
      const result = (await convex.action(api.actions.appendNextModule, {
        courseTitle: course.title,
        coveredTopics: feedItems.map((item) => item.topicTitle),
      })) as { feedItems: FeedVideoItem[] };

      const newItems = result.feedItems.map((item, index) => ({
        ...item,
        order: feedItems.length + index,
        metaData: item.metaData ?? {},
      }));

      if (!newItems.length) {
        return;
      }

      await convex.mutation(api.actions.appendFeedItems, {
        courseId: course._id,
        feedItems: newItems,
      });

      setFeedItems((prev) => [...prev, ...newItems]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more videos.');
    } finally {
      setIsAppending(false);
    }
  }, [course, feedItems, isAppending]);

  useEffect(() => {
    if (!course?._id || !isConvexConfigured) {
      return;
    }

    const savePosition = async () => {
      await AsyncStorage.setItem(storageKeyForCourse(course._id), String(activeIndex));
      await convex.mutation(api.actions.updateCoursePosition, {
        courseId: course._id,
        lastPosition: activeIndex,
      });
    };

    const timeout = setTimeout(() => {
      void savePosition();
    }, 400);

    return () => clearTimeout(timeout);
  }, [activeIndex, course?._id, isConvexConfigured]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const firstVisible = viewableItems.find((item) => item.index != null);
      if (firstVisible?.index == null) {
        return;
      }
      const index = firstVisible.index;
      setActiveIndex(index);

      if (feedItems.length - index <= 3) {
        void handleAppendNextModule();
      }
    },
    [feedItems.length, handleAppendNextModule]
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 80,
    }),
    []
  );

  const handleListLayout = useCallback(
    ({ nativeEvent }: { nativeEvent: { layout: { height: number } } }) => {
      if (nativeEvent.layout.height && nativeEvent.layout.height !== listHeight) {
        setListHeight(nativeEvent.layout.height);
      }
    },
    [listHeight]
  );

  if (!isConvexConfigured) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">Convex is not configured.</ThemedText>
        <ThemedText>Set EXPO_PUBLIC_CONVEX_URL to enable the learning feed.</ThemedText>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        ref={listRef}
        data={feedItems}
        keyExtractor={(item) => `${item.videoId}-${item.order}`}
        onLayout={handleListLayout}
        renderItem={({ item, index }) => (
          <FeedVideoCard
            item={item}
            index={index}
            total={feedItems.length}
            isActive={index === activeIndex}
            height={listHeight}
          />
        )}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: listHeight,
          offset: listHeight * index,
          index,
        })}
        initialScrollIndex={initialIndex}
        onScrollToIndexFailed={({ index }) => {
          listRef.current?.scrollToOffset({ offset: index * listHeight, animated: false });
        }}
        ListEmptyComponent={
          <ThemedView style={styles.centered}>
            <ThemedText type="subtitle">No learning feed yet.</ThemedText>
            <ThemedText>Add a prompt or PDF to get started.</ThemedText>
          </ThemedView>
        }
      />

      <Pressable
        onPress={() => setShowComposer(true)}
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
        accessibilityLabel="Create new learning feed">
        <ThemedText type="defaultSemiBold" style={styles.fabText}>
          New Course
        </ThemedText>
      </Pressable>

      <Modal visible={showComposer || feedItems.length === 0} animationType="slide">
        <ThemedView style={styles.modal}>
          <PromptComposer
            prompt={prompt}
            onPromptChange={setPrompt}
            pdfName={selectedPdf?.name}
            onPickPdf={pickPdf}
            onClearPdf={() => setSelectedPdf(null)}
            onGenerate={handleGenerate}
            isBusy={isGenerating}
          />
          {error ? (
            <ThemedText type="default" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}
          <View style={styles.modalActions}>
            <Pressable
              onPress={() => setShowComposer(false)}
              disabled={isGenerating || feedItems.length === 0}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <ThemedText type="defaultSemiBold">Close</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 36,
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  fabText: {
    color: '#fff',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalActions: {
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#EFEFEF',
  },
  pressed: {
    opacity: 0.7,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginTop: 12,
  },
});
