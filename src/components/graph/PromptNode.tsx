/**
 * Custom node component for React Flow
 * Compact circular node with icon only
 */

import { memo, useState } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Image, Video, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGenerationTasks } from '@/hooks/use-generation-tasks';

const PromptNode = memo(function PromptNode({
  data,
  selected,
}: any) {
  const { prompt, onSelect } = data;
  const [isHovered, setIsHovered] = useState(false);

  // Fetch generation tasks for this prompt
  const { data: tasks = [] } = useGenerationTasks(prompt.id);
  const latestTask = tasks[0]; // Most recent task

  const handleClick = () => {
    if (onSelect) {
      onSelect(prompt.id);
    }
  };

  // Type-specific colors for circular nodes
  const typeColors: Record<'image' | 'video', {
    bg: string;
    bgHover: string;
    border: string;
    borderSelected: string;
    icon: string;
  }> = {
    image: {
      bg: 'bg-blue-500/10',
      bgHover: 'hover:bg-blue-500/20',
      border: 'border-blue-500/30',
      borderSelected: 'border-blue-500',
      icon: 'text-blue-500',
    },
    video: {
      bg: 'bg-purple-500/10',
      bgHover: 'hover:bg-purple-500/20',
      border: 'border-purple-500/30',
      borderSelected: 'border-purple-500',
      icon: 'text-purple-500',
    },
  };

  const colors = typeColors[prompt.type as 'image' | 'video'];

  const ringColor = prompt.type === 'image' ? 'ring-blue-500/30' : 'ring-purple-500/30';

  return (
    <>
      {/* NodeToolbar for tooltip - rendered outside node via Portal */}
      <NodeToolbar
        isVisible={isHovered}
        position={Position.Top}
        offset={10}
      >
        <div className="w-96 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-xl">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-semibold text-xs text-muted-foreground">ID: {prompt.id}</span>
            <span className={cn('text-xs font-semibold', colors.icon)}>
              {prompt.type === 'image' ? 'Image' : 'Video'}
            </span>
          </div>

          {/* Prompt content (max 150 chars) */}
          <div className="mb-2">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Prompt:</div>
            <div className="whitespace-pre-wrap">
              {prompt.content.length > 150
                ? `${prompt.content.substring(0, 150)}...`
                : prompt.content}
            </div>
          </div>

          {/* User Feedback (max 100 chars) */}
          {prompt.userFeedback && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-blue-400 mb-1">User Feedback:</div>
              <div className="text-xs whitespace-pre-wrap text-muted-foreground">
                {prompt.userFeedback.length > 100
                  ? `${prompt.userFeedback.substring(0, 100)}...`
                  : prompt.userFeedback}
              </div>
            </div>
          )}

          {/* AI Comment (max 100 chars) */}
          {prompt.aiComment && (
            <div>
              <div className="text-xs font-semibold text-purple-400 mb-1">AI Comment:</div>
              <div className="text-xs whitespace-pre-wrap text-muted-foreground">
                {prompt.aiComment.length > 100
                  ? `${prompt.aiComment.substring(0, 100)}...`
                  : prompt.aiComment}
              </div>
            </div>
          )}
        </div>
      </NodeToolbar>

      <div
        className={cn(
          'group relative flex items-center justify-center rounded-full border-2 shadow-md transition-all',
          'hover:shadow-lg hover:scale-110',
          colors.bg,
          colors.bgHover,
          selected
            ? `${colors.borderSelected} ring-4 ${ringColor}`
            : colors.border
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        style={{
          width: 60,
          height: 60,
          cursor: 'pointer'
        }}
        title={`${prompt.type}: ${prompt.content}`}
      >
      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-2 !h-2"
      />

      {/* Icon */}
      {prompt.type === 'image' ? (
        <Image className={cn('h-6 w-6', colors.icon)} aria-label="Image prompt" />
      ) : (
        <Video className={cn('h-6 w-6', colors.icon)} aria-label="Video prompt" />
      )}

      {/* Generation Status Badge */}
      {latestTask && (
        <div
          className="absolute -top-1 -right-1"
          style={{ pointerEvents: 'none' }}
        >
          {latestTask.status === 'PENDING' && (
            <div className="relative">
              <Loader2
                className="h-4 w-4 text-orange-500 animate-spin"
                aria-label="Generating"
              />
              <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-pulse" />
            </div>
          )}
          {latestTask.status === 'SUCCESS' && (
            <CheckCircle2
              className="h-4 w-4 text-green-500"
              aria-label="Generation successful"
            />
          )}
          {latestTask.status === 'FAILED' && (
            <XCircle
              className="h-4 w-4 text-red-500"
              aria-label="Generation failed"
            />
          )}
        </div>
      )}

      {/* Output handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !w-2 !h-2"
      />
    </div>
    </>
  );
});

export default PromptNode;
