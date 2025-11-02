/**
 * ELK (Eclipse Layout Kernel) hierarchical graph layout
 * Based on React Flow official example: https://reactflow.dev/examples/layout/elkjs
 * Better suited for directed acyclic graphs (DAG) like prompt derivation trees
 */

import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge, Position } from '@xyflow/react';

export interface ELKLayoutOptions {
  'elk.algorithm'?: 'layered' | 'force' | 'mrtree' | 'radial' | 'stress';
  'elk.direction'?: 'DOWN' | 'UP' | 'RIGHT' | 'LEFT';
  'elk.spacing.nodeNode'?: string;
  'elk.layered.spacing.nodeNodeBetweenLayers'?: string;
}

const elk = new ELK();

const defaultOptions: ELKLayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '100',
  'elk.layered.spacing.nodeNodeBetweenLayers': '150',
};

/**
 * Layout nodes using ELK hierarchical algorithm
 * Much faster and cleaner than force-directed for DAGs
 */
export async function elkLayoutGraph<
  T extends Record<string, unknown> = Record<string, unknown>,
  U extends Record<string, unknown> = Record<string, unknown>
>(
  nodes: Node<T>[],
  edges: Edge<U>[],
  options: ELKLayoutOptions = {}
): Promise<{ nodes: Node<T>[]; edges: Edge<U>[] }> {
  const layoutOptions = { ...defaultOptions, ...options };
  const isHorizontal = layoutOptions['elk.direction'] === 'RIGHT' || layoutOptions['elk.direction'] === 'LEFT';

  // Create ELK graph structure (simplified format based on official example)
  const graph = {
    id: 'root',
    layoutOptions,
    children: nodes.map((node) => ({
      id: node.id,
      width: 60,  // Circular node diameter
      height: 60,
      // Set handle positions based on layout direction
      targetPosition: (isHorizontal ? 'left' : 'top') as Position,
      sourcePosition: (isHorizontal ? 'right' : 'bottom') as Position,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    // Run ELK layout algorithm
    const layoutedGraph = await elk.layout(graph);

    // Convert ELK positions back to React Flow format
    const layoutedNodes = nodes.map((node) => {
      const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);

      if (layoutedNode) {
        return {
          ...node,
          position: {
            x: layoutedNode.x ?? 0,
            y: layoutedNode.y ?? 0,
          },
        };
      }

      return node;
    });

    return {
      nodes: layoutedNodes,
      edges,
    };
  } catch (error) {
    console.error('ELK layout failed:', error);
    // Fallback to original data on error
    return { nodes, edges };
  }
}
