
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { join } from 'path';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { imagePromptAgent } from './agents/image-prompt-agent';
import { videoPromptAgent } from './agents/video-prompt-agent';

// Resolve absolute path to database file
// In Next.js, process.cwd() returns the project root directory
const DB_PATH = join(process.cwd(), 'prisma', 'mastra.db');

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, imagePromptAgent, videoPromptAgent },
  storage: new LibSQLStore({
    // Persistent storage for observability, scores, messages, and threads
    // Shared with Prisma for application data (Project, Prompt, Asset)
    // Using absolute path to avoid relative path resolution issues
    url: `file:${DB_PATH}`,
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false, 
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true }, 
  },
});
