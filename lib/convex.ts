import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { ConvexReactClient } from 'convex/react';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL ?? '';

if (!convexUrl) {
  console.warn('Missing EXPO_PUBLIC_CONVEX_URL. Convex calls will fail.');
}

export const convex = new ConvexReactClient(convexUrl);
