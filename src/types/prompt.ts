/**
 * Prompt type definitions
 */

import type { Asset } from './asset';

export interface Prompt {
  id: string;
  projectId: string;
  type: "image" | "video";
  content: string;
  userFeedback?: string;
  aiComment?: string;
  parentId?: string;
  parent?: {
    id: string;
    content: string;
  };
  createdAt: Date;
  updatedAt: Date;
  assets: Asset[];
}

export interface PromptDetailProps {
  prompt: Prompt | null;
  onGenerateImage: () => void;
  onGenerateVideo: () => void;
  onCreateDerivative: () => void;
}
