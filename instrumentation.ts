/**
 * Next.js Instrumentation File
 *
 * This file is automatically executed when the Next.js server starts.
 * It's used for server-side initialization tasks.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on the server (not in edge runtime or client)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import to avoid loading server-side code on client
    const { resumePendingTasks } = await import(
      '@/lib/generation/resume-polling'
    );

    // Resume polling for any pending generation tasks
    // This ensures tasks are not left incomplete after server restarts
    console.log('[Instrumentation] Server started, resuming pending tasks...');
    await resumePendingTasks();
    console.log('[Instrumentation] Initialization complete');
  }
}
