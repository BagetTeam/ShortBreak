import React from 'react';
import { Platform, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TabIconProps = {
  name: 'home' | 'feed' | 'explore';
  color: string;
  size?: number;
};

export function TabIcon({ name, color, size = 28 }: TabIconProps) {
  // Try to use react-icons if available (for web)
  if (Platform.OS === 'web') {
    try {
      // Dynamic imports for react-icons
      if (name === 'home') {
        const { PiHouseLine } = require('react-icons/pi');
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <PiHouseLine size={size} color={color} />
          </View>
        );
      }
      if (name === 'feed') {
        const { AiOutlineVideoCamera } = require('react-icons/ai');
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <AiOutlineVideoCamera size={size} color={color} />
          </View>
        );
      }
      if (name === 'explore') {
        const { TbSend } = require('react-icons/tb');
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <TbSend size={size} color={color} />
          </View>
        );
      }
    } catch (e) {
      // Fallback to MaterialIcons if react-icons not available
    }
  }

  // Use MaterialIcons for native or as fallback
  const iconMap = {
    home: 'home' as const,
    feed: 'videocam' as const,
    explore: 'send' as const,
  };

  return <MaterialIcons name={iconMap[name]} size={size} color={color} />;
}
