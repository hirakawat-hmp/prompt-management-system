/**
 * Imagen4GenerationModal Component
 *
 * Modal for creating Imagen4 image generation tasks.
 * Provides form for configuring generation parameters.
 */

'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useCreateGenerationTask } from '@/hooks/use-generation-tasks';
import type { KieImagen4Params } from '@/types/generation';

export interface Imagen4GenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  promptContent: string;
  onSuccess?: () => void;
}

export function Imagen4GenerationModal({
  open,
  onOpenChange,
  promptId,
  promptContent,
  onSuccess,
}: Imagen4GenerationModalProps) {
  // Form state
  const [prompt, setPrompt] = useState(promptContent);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] =
    useState<KieImagen4Params['input']['aspect_ratio']>('1:1');
  const [numImages, setNumImages] =
    useState<KieImagen4Params['input']['num_images']>('1');
  const [seed, setSeed] = useState('');
  const [error, setError] = useState('');

  const createTask = useCreateGenerationTask();

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setPrompt(promptContent);
    setNegativePrompt('');
    setAspectRatio('1:1');
    setNumImages('1');
    setSeed('');
    setError('');
  };

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    setError('');

    if (!prompt.trim()) {
      setError('Prompt is required');
      return false;
    }

    if (prompt.length > 5000) {
      setError('Prompt must be 5000 characters or less');
      return false;
    }

    if (negativePrompt.length > 5000) {
      setError('Negative prompt must be 5000 characters or less');
      return false;
    }

    return true;
  };

  /**
   * Handle generate button click
   */
  const handleGenerate = () => {
    console.log('[Imagen4Modal] Generate button clicked');

    if (!validateForm()) {
      console.log('[Imagen4Modal] Validation failed');
      return;
    }

    const providerParams: KieImagen4Params = {
      service: 'KIE',
      model: 'IMAGEN4',
      apiModel: 'google/imagen4-fast',
      input: {
        prompt: prompt.trim(),
        ...(negativePrompt.trim() && { negative_prompt: negativePrompt.trim() }),
        aspect_ratio: aspectRatio,
        num_images: numImages,
        ...(seed && { seed: parseInt(seed, 10) }),
      },
    };

    console.log('[Imagen4Modal] Calling createTask.mutate with:', { promptId, providerParams });

    createTask.mutate(
      {
        promptId,
        providerParams,
      },
      {
        onSuccess: (result) => {
          console.log('[Imagen4Modal] Mutation onSuccess:', result);
          if (result.success) {
            resetForm();
            onOpenChange(false);
            onSuccess?.();
          } else {
            setError(result.error);
          }
        },
        onError: (err) => {
          console.error('[Imagen4Modal] Mutation onError:', err);
          setError(err instanceof Error ? err.message : 'Failed to create task');
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

  const isGenerating = createTask.isPending;
  const promptLength = prompt.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate with Imagen4</DialogTitle>
          <DialogDescription>
            Create AI-generated images using Google Imagen4
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="min-h-[100px] resize-none"
              aria-label="Prompt"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {promptLength} / 5000 characters
              </span>
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
            <Textarea
              id="negative-prompt"
              placeholder="blurry, low quality"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              disabled={isGenerating}
              className="min-h-[80px] resize-none"
              aria-label="Negative Prompt"
            />
            <span className="text-xs text-muted-foreground">
              Describe what you don&apos;t want in the image
            </span>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
            <Select
              value={aspectRatio}
              onValueChange={(
                value: KieImagen4Params['input']['aspect_ratio']
              ) => setAspectRatio(value)}
              disabled={isGenerating}
            >
              <SelectTrigger id="aspect-ratio" aria-label="Aspect Ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1</SelectItem>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="9:16">9:16</SelectItem>
                <SelectItem value="3:4">3:4</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Images */}
          <div className="space-y-2">
            <Label htmlFor="num-images">Number of Images</Label>
            <Select
              value={numImages}
              onValueChange={(value: KieImagen4Params['input']['num_images']) =>
                setNumImages(value)
              }
              disabled={isGenerating}
            >
              <SelectTrigger id="num-images" aria-label="Number of Images">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <Label htmlFor="seed">Seed (Optional)</Label>
            <Input
              id="seed"
              type="number"
              placeholder="Random seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              disabled={isGenerating}
              aria-label="Seed"
            />
            <span className="text-xs text-muted-foreground">
              Use the same seed for reproducible results
            </span>
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
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
