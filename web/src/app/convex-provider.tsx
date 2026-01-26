"use client";

import type React from "react";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
const client = convexUrl ? new ConvexReactClient(convexUrl) : null;

type ConvexProviderProps = {
  children: React.ReactNode;
};

export function ConvexClientProvider({ children }: ConvexProviderProps) {
  if (!client) {
    return children;
  }

  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={client} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
