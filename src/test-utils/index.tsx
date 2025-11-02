/**
 * Test Utilities
 *
 * Provides custom render function and utilities for testing React Query hooks.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

/**
 * Creates a new QueryClient for testing with no retries and no cache.
 *
 * @returns Fresh QueryClient instance for tests
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

/**
 * Wrapper component that provides QueryClient context for tests.
 */
interface QueryWrapperProps {
  children: ReactNode;
  client?: QueryClient;
}

export function createQueryWrapper(client?: QueryClient) {
  const queryClient = client ?? createTestQueryClient();

  return function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

/**
 * Custom render function that wraps components with QueryClientProvider.
 *
 * @param ui - React component to render
 * @param options - Render options including custom QueryClient
 * @returns Render result with query utilities
 *
 * @example
 * ```typescript
 * const { getByText } = renderWithQuery(<MyComponent />);
 * ```
 */
export function renderWithQuery(
  ui: ReactNode,
  options?: {
    client?: QueryClient;
  }
) {
  const queryClient = options?.client ?? createTestQueryClient();

  return {
    ...render(ui, {
      wrapper: createQueryWrapper(queryClient),
    }),
    queryClient,
  };
}

/**
 * Custom renderHook function that wraps hooks with QueryClientProvider.
 *
 * @param hook - Hook function to test
 * @param options - Render options including custom QueryClient
 * @returns Hook result with query utilities
 *
 * @example
 * ```typescript
 * const { result } = renderHookWithQuery(() => useProjects());
 * ```
 */
export function renderHookWithQuery<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: {
    client?: QueryClient;
    initialProps?: TProps;
  }
) {
  const queryClient = options?.client ?? createTestQueryClient();

  return {
    ...renderHook(hook, {
      wrapper: createQueryWrapper(queryClient),
      initialProps: options?.initialProps,
    }),
    queryClient,
  };
}
