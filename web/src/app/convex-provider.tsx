"use client";

import type React from "react";

import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
const client = convexUrl ? new ConvexReactClient(convexUrl) : null;

type ConvexProviderProps = {
  children: React.ReactNode;
};

export function ConvexClientProvider({ children }: ConvexProviderProps) {
  if (!client) {
    return children;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
