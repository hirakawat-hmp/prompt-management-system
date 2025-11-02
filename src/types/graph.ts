/**
 * Graph type definitions for prompt visualization
 */

import type { Node, Edge } from '@xyflow/react';
import type { Prompt } from './prompt';

export interface PromptNodeData extends Record<string, unknown> {
  prompt: Prompt;
  onSelect?: (promptId: string) => void;
}

export type PromptNode = Node<PromptNodeData>;

export interface PromptEdgeData extends Record<string, unknown> {
  animated?: boolean;
}

export type PromptEdge = Edge<PromptEdgeData>;
