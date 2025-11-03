/**
 * Complete database cleanup script
 *
 * This script removes ALL data from the database:
 * - Assets
 * - GenerationTasks
 * - Prompts
 * - Projects
 *
 * Useful for resetting the database during development.
 */

import { prisma } from '@/lib/prisma';

async function cleanup() {
  console.log('[Cleanup] Starting complete database cleanup...');

  try {
    // Step 1: Delete all assets (most child records)
    const deletedAssets = await prisma.asset.deleteMany({});
    console.log(`[Cleanup] Deleted ${deletedAssets.count} assets`);

    // Step 2: Delete all generation tasks
    const deletedTasks = await prisma.generationTask.deleteMany({});
    console.log(`[Cleanup] Deleted ${deletedTasks.count} generation tasks`);

    // Step 3: Delete all prompts
    const deletedPrompts = await prisma.prompt.deleteMany({});
    console.log(`[Cleanup] Deleted ${deletedPrompts.count} prompts`);

    // Step 4: Delete all projects (parent records)
    const deletedProjects = await prisma.project.deleteMany({});
    console.log(`[Cleanup] Deleted ${deletedProjects.count} projects`);

    console.log('[Cleanup] ✅ Complete database cleanup finished successfully');
  } catch (error) {
    console.error('[Cleanup] ❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
