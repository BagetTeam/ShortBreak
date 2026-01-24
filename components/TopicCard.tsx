import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

type TopicCardProps = {
  title: string;
  icon: string;
  iconColor?: string;
  onPress?: () => void;
  onAddPress?: () => void;
};

export function TopicCard({ title, icon, iconColor = '#111', onPress, onAddPress }: TopicCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.cardContainer}>
      <ThemedView style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon as any} size={48} color={iconColor} />
        </View>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onAddPress?.();
          }}
          style={styles.addButton}>
          <MaterialIcons name="add" size={20} color="#111" />
        </Pressable>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    margin: 8,
  },
  card: {
    backgroundColor: '#F5F5DC', // Cream/beige matching background
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    borderWidth: 3,
    borderColor: '#111',
    borderStyle: 'solid',
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.handwritten,
    color: '#111',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111',
  },
});
