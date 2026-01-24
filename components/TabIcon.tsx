import React from 'react';
import { Platform, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { HouseIcon } from '@/components/HouseIcon';
import { CameraIcon } from '@/components/CameraIcon';

type TabIconProps = {
  name: 'home' | 'feed' | 'explore';
  color: string;
  size?: number;
};

export function TabIcon({ name, color, size = 28 }: TabIconProps) {
  // Use custom house SVG icon for home
  if (name === 'home') {
    return <HouseIcon size={size} color={color} />;
  }

  // Use custom camera SVG icon for feed
  if (name === 'feed') {
    return <CameraIcon size={size} color={color} />;
  }

  // Try to use react-icons if available (for web)
  if (Platform.OS === 'web') {
    try {
      // Dynamic imports for react-icons
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
    explore: 'send' as const,
  };

  return <MaterialIcons name={iconMap[name]} size={size} color={color} />;
}
