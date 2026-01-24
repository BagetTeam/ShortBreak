import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

import { ThemedText } from '@/components/themed-text';

export type FeedVideoItem = {
  videoId: string;
  topicTitle: string;
  metaData?: {
    title?: string;
    channelTitle?: string;
    thumbnailUrl?: string;
    publishedAt?: string;
  };
};

type FeedVideoCardProps = {
  item: FeedVideoItem;
  index: number;
  total: number;
  isActive: boolean;
  height?: number;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function FeedVideoCard({ item, index, total, isActive, height }: FeedVideoCardProps) {
  return (
    <View style={[styles.container, { height: height ?? screenHeight }]}>
      <YoutubePlayer
        height={height ?? screenHeight}
        width={screenWidth}
        play={isActive}
        videoId={item.videoId}
        webViewProps={{ allowsFullscreenVideo: true }}
        initialPlayerParams={{ controls: false, modestbranding: true }}
      />
      <View style={styles.overlay}>
        <ThemedText type="subtitle" style={styles.title}>
          {item.topicTitle}
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.progress}>
          {index + 1} / {total}
        </ThemedText>
        {item.metaData?.channelTitle ? (
          <ThemedText type="default" style={styles.channel}>
            {item.metaData.channelTitle}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 36,
    gap: 6,
  },
  title: {
    color: '#fff',
  },
  progress: {
    color: '#fff',
  },
  channel: {
    color: '#E2E2E2',
  },
});
