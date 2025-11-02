/**
 * Custom edge component for React Flow
 * Optimized for readability with straight lines
 */

import { memo } from 'react';
import {
  BaseEdge,
  getStraightPath,
} from '@xyflow/react';

export const PromptEdge = memo(function PromptEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: any) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        strokeWidth: 2,
        stroke: '#6366f1',
        opacity: 0.8,
      }}
      className="transition-all hover:opacity-100"
    />
  );
});
