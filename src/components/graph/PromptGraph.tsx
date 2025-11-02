/**
 * PromptGraph component
 * Visualizes prompt derivation relationships using React Flow
 */

'use client';

import { useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Prompt } from '@/types/prompt';
import type { PromptNode, PromptEdge } from '@/types/graph';
import { elkLayoutGraph } from './utils/elkLayoutGraph';
import PromptNodeComponent from './PromptNode';
import { PromptEdge as PromptEdgeComponent } from './PromptEdge';
import { NewPromptModal } from '@/components/prompts/NewPromptModal';

export interface PromptGraphProps {
  projectId: string;
  prompts: Prompt[];
  selectedPromptId?: string;
  onPromptSelect?: (promptId: string) => void;
  showMinimap?: boolean;
  showControls?: boolean;
}

const nodeTypes: NodeTypes = {
  promptNode: PromptNodeComponent as any,
};

const edgeTypes: EdgeTypes = {
  promptEdge: PromptEdgeComponent as any,
};

export function PromptGraph({
  projectId,
  prompts,
  selectedPromptId,
  onPromptSelect,
  showMinimap = false,
  showControls = false,
}: PromptGraphProps) {
  const [isClient, setIsClient] = useState(false);
  const [nodes, setNodes] = useState<PromptNode[]>([]);
  const [edges, setEdges] = useState<PromptEdge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Convert prompts to nodes and edges, apply ELK layout
  useEffect(() => {
    if (!isClient) return;

    const layoutNodes = async () => {
      // Create a set of existing prompt IDs for validation
      const existingIds = new Set(prompts.map((p) => p.id));

      // Create nodes from prompts
      const promptNodes: PromptNode[] = prompts.map((prompt) => ({
        id: prompt.id,
        type: 'promptNode',
        data: {
          prompt,
          onSelect: onPromptSelect,
        },
        position: { x: 0, y: 0 }, // Will be set by layout algorithm
        selected: prompt.id === selectedPromptId,
      }));

      // Create edges from parent relationships (directed with arrows)
      const promptEdges: PromptEdge[] = prompts
        .filter((prompt) => prompt.parent && existingIds.has(prompt.parent.id))
        .map((prompt) => ({
          id: `${prompt.parent!.id}-${prompt.id}`,
          source: prompt.parent!.id,
          target: prompt.id,
          type: 'promptEdge',
          markerEnd: {
            type: 'arrowclosed' as const,
            width: 20,
            height: 20,
          },
        }));

      // Apply ELK hierarchical layout - much better for DAGs
      // Fast, clean, and no overlaps guaranteed
      const { nodes: layoutedNodes, edges: layoutedEdges } = await elkLayoutGraph(
        promptNodes,
        promptEdges,
        {
          'elk.algorithm': 'layered',
          'elk.direction': 'DOWN',
          'elk.spacing.nodeNode': '100',
          'elk.layered.spacing.nodeNodeBetweenLayers': '150',
        }
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    };

    layoutNodes();
  }, [isClient, prompts, selectedPromptId, onPromptSelect]);

  // Show placeholder during SSR
  if (!isClient) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading graph...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* New Prompt Button - Absolute positioned in top-right */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => setIsModalOpen(true)}
          size="default"
          variant="default"
          aria-label="New Prompt"
        >
          <Plus />
          New Prompt
        </Button>
      </div>

      {/* ReactFlow Graph */}
      <ReactFlow
        nodes={nodes as any}
        edges={edges as any}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.1,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'promptEdge',
          markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
          },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        {showControls && <Controls />}
        {showMinimap && (
          <MiniMap
            nodeColor={(node) => {
              if (node.selected) {
                return '#ffd700'; // Gold for selected
              }
              // Color based on prompt type
              const promptType = (node.data as any)?.prompt?.type;
              return promptType === 'image' ? '#3b82f6' : '#a855f7'; // Blue for image, purple for video
            }}
            maskColor="rgba(0, 0, 0, 0.6)"
            nodeStrokeWidth={3}
            pannable
            zoomable
          />
        )}
      </ReactFlow>

      {/* New Prompt Modal */}
      <NewPromptModal
        projectId={projectId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          // Optionally show a success notification
          console.log('New prompt created successfully!');
        }}
      />
    </div>
  );
}
