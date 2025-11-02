/**
 * Prompt type definitions
 */

import type { Asset } from './asset';

export interface Prompt {
  id: string;
  type: "image" | "video";
  content: string;
  userFeedback?: string;
  aiComment?: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: {
    id: string;
    content: string;
  };
  assets: Asset[];
}

export interface PromptDetailProps {
  prompt: Prompt | null;
  onGenerateImage: () => void;
  onGenerateVideo: () => void;
  onCreateDerivative: () => void;
}
