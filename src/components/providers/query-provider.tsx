/**
 * React Query Provider Component
 *
 * Wraps the application with QueryClientProvider and optional DevTools.
 */

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from '@/lib/query-client';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provides React Query context to the application.
 *
 * Creates a QueryClient instance per component instance to avoid
 * sharing state between different renders (SSR safety).
 *
 * @example
 * ```typescript
 * // In app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <QueryProvider>{children}</QueryProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient instance per component instance (SSR-safe)
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show DevTools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
