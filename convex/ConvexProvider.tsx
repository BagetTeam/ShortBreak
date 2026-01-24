import { ConvexProvider as ConvexProviderBase, ConvexReactClient } from "convex/react";
import React from "react";

// Initialize the Convex client
// Replace with your actual Convex deployment URL
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || "https://your-deployment.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

interface Props {
  children: React.ReactNode;
}

export function ConvexProvider({ children }: Props) {
  return <ConvexProviderBase client={convex}>{children}</ConvexProviderBase>;
}
