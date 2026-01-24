import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

type ProgressCardProps = {
  title: string;
  progress: number; // 0-100
  icon?: string;
  onAddPress?: () => void;
};

export function ProgressCard({ title, progress, icon = 'science', onAddPress }: ProgressCardProps) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon as any} size={40} color="#8B4513" />
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <ThemedText style={styles.progressText}>{progress}% Complete</ThemedText>
          </View>
        </View>
      </View>
      <Pressable onPress={onAddPress} style={styles.addButton}>
        <MaterialIcons name="add" size={24} color="#111" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#DAA520', // Goldenrod/yellow
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#111',
    borderStyle: 'solid',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.handwritten,
    marginBottom: 8,
    color: '#111',
  },
  progressContainer: {
    gap: 6,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#111',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#111',
    fontFamily: Fonts.sans,
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111',
  },
});
