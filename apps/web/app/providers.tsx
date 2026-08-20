"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@workspace/ui/components/sonner";

import { ApiError } from "@/lib/api/client";
import { SessionProvider } from "@/lib/auth/session-provider";
import type { User } from "@/lib/api/types";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Never retry a permission or validation failure — it will not
          // succeed on the second attempt and it hides the real message.
          if (error instanceof ApiError) {
            if (error.status === 401 || error.status === 403) return false;
            if (error.status >= 400 && error.status < 500) return false;
          }
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider initialUser={initialUser}>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </SessionProvider>
    </QueryClientProvider>
  );
}
