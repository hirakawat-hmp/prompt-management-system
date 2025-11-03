/**
 * Sora2GenerationModal Component
 *
 * Modal for generating Sora2 videos with configurable parameters.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { useCreateGenerationTask } from '@/hooks/use-generation-tasks';
import type { KieSora2Params } from '@/types/generation';

export interface Sora2GenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  promptContent: string;
  onSuccess?: () => void;
}

export function Sora2GenerationModal({
  open,
  onOpenChange,
  promptId,
  promptContent,
  onSuccess,
}: Sora2GenerationModalProps) {
  const [prompt, setPrompt] = useState(promptContent);
  const [aspectRatio, setAspectRatio] = useState<'portrait' | 'landscape'>('landscape');
  const [duration, setDuration] = useState<'10' | '15'>('10');
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [error, setError] = useState('');

  const createTask = useCreateGenerationTask();

  /**
   * Reset form to initial state with prompt content
   */
  const resetForm = () => {
    setPrompt(promptContent);
    setAspectRatio('landscape');
    setDuration('10');
    setRemoveWatermark(false);
    setError('');
  };

  /**
   * Update prompt when promptContent prop changes
   */
  useEffect(() => {
    if (open) {
      setPrompt(promptContent);
    }
  }, [open, promptContent]);

  /**
   * Handle generate button click
   */
  const handleGenerate = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError('');

    const providerParams: KieSora2Params = {
      service: 'KIE',
      model: 'SORA2',
      apiModel: 'sora-2-text-to-video',
      input: {
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio,
        n_frames: duration,
        remove_watermark: removeWatermark,
      },
    };

    createTask.mutate(
      {
        promptId,
        providerParams,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            resetForm();
            onOpenChange(false);
            onSuccess?.();
          } else {
            setError(result.error);
          }
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to create generation task');
        },
      }
    );
  };

  /**
   * Handle dialog close
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const promptLength = prompt.length;
  const isGenerating = createTask.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Sora2 Video</DialogTitle>
          <DialogDescription>
            Configure parameters and generate a video with Sora2
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Enter your video prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="min-h-[150px] resize-none font-mono text-sm"
              aria-label="Prompt"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {promptLength} characters
              </span>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label htmlFor="aspect-ratio-select">Aspect Ratio</Label>
            <Select
              value={aspectRatio}
              onValueChange={(value: 'portrait' | 'landscape') => setAspectRatio(value)}
              disabled={isGenerating}
            >
              <SelectTrigger id="aspect-ratio-select" aria-label="Aspect Ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landscape">Landscape</SelectItem>
                <SelectItem value="portrait">Portrait</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration-select">Duration</Label>
            <Select
              value={duration}
              onValueChange={(value: '10' | '15') => setDuration(value)}
              disabled={isGenerating}
            >
              <SelectTrigger id="duration-select" aria-label="Duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="15">15s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Remove Watermark */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="remove-watermark"
              checked={removeWatermark}
              onCheckedChange={(checked) => setRemoveWatermark(checked === true)}
              disabled={isGenerating}
              aria-label="Remove Watermark"
            />
            <Label
              htmlFor="remove-watermark"
              className="text-sm font-normal cursor-pointer"
            >
              Remove Watermark
            </Label>
          </div>

          {/* Error Display */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
