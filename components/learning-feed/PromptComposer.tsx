import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type PromptComposerProps = {
  prompt: string;
  onPromptChange: (value: string) => void;
  pdfName?: string | null;
  onPickPdf: () => void;
  onClearPdf: () => void;
  onGenerate: () => void;
  isBusy?: boolean;
};

export function PromptComposer({
  prompt,
  onPromptChange,
  pdfName,
  onPickPdf,
  onClearPdf,
  onGenerate,
  isBusy,
}: PromptComposerProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.heading}>
        Build a Learning Feed
      </ThemedText>
      <ThemedText type="default" style={styles.subtitle}>
        Add a prompt or upload a PDF outline. We will turn it into short, focused lessons.
      </ThemedText>

      <TextInput
        value={prompt}
        onChangeText={onPromptChange}
        placeholder="Ex: History of Rome, Intro to Physics, Creative Writing..."
        placeholderTextColor="#8A8A8A"
        style={styles.input}
        multiline
      />

      <View style={styles.row}>
        <Pressable
          onPress={onPickPdf}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          disabled={isBusy}>
          <ThemedText type="defaultSemiBold">Upload PDF</ThemedText>
        </Pressable>
        {pdfName ? (
          <Pressable
            onPress={onClearPdf}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            disabled={isBusy}>
            <ThemedText type="defaultSemiBold">Remove PDF</ThemedText>
          </Pressable>
        ) : null}
      </View>

      {pdfName ? (
        <ThemedText type="default" style={styles.pdfLabel}>
          Selected: {pdfName}
        </ThemedText>
      ) : null}

      <Pressable
        onPress={onGenerate}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        disabled={isBusy}>
        <ThemedText type="defaultSemiBold" style={styles.primaryText}>
          {isBusy ? 'Generating…' : 'Generate Feed'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  heading: {
    fontSize: 28,
  },
  subtitle: {
    color: '#6E6E6E',
  },
  input: {
    minHeight: 120,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: '#fff',
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#111',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#EFEFEF',
  },
  pressed: {
    opacity: 0.7,
  },
  pdfLabel: {
    color: '#444',
  },
});
