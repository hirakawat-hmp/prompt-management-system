/**
 * NewPromptModal Component
 *
 * Modal for creating new root prompts with manual input or AI generation.
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useCreatePrompt } from '@/hooks/useCreatePrompt';
import { generatePrompt } from '@/lib/api/prompt-generation';
import type { Model } from '@/lib/api/prompt-generation';

export interface NewPromptModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewPromptModal({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: NewPromptModalProps) {
  const [type, setType] = useState<'image' | 'video'>('image');
  const [model, setModel] = useState<Model>('imagen4');
  const [manualContent, setManualContent] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const createPrompt = useCreatePrompt();

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setType('image');
    setModel('imagen4');
    setManualContent('');
    setRequirements('');
    setError('');
    setIsGenerating(false);
  };

  /**
   * Update model when type changes
   */
  const handleTypeChange = (newType: 'image' | 'video') => {
    setType(newType);
    // Set default model based on type
    setModel(newType === 'image' ? 'imagen4' : 'veo3');
  };

  /**
   * Handle AI generation
   */
  const handleGenerateWithAI = async () => {
    if (!requirements.trim()) {
      setError('Please enter requirements for AI generation');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const result = await generatePrompt(model, requirements.trim());

      if (result.success) {
        // Combine prompt and parameters if available
        let generatedContent = result.data.prompt;
        if (result.data.parameters) {
          generatedContent += `\n\nParameters: ${result.data.parameters}`;
        }
        setManualContent(generatedContent);
        setError('');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle create prompt
   */
  const handleCreate = () => {
    if (!manualContent.trim()) {
      setError('Please enter prompt content or generate with AI');
      return;
    }

    setError('');

    createPrompt.mutate(
      {
        projectId,
        type,
        content: manualContent.trim(),
        parentId: undefined, // Root prompt - no parent
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
          setError(err instanceof Error ? err.message : 'Failed to create prompt');
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

  const manualContentLength = manualContent.length;
  const requirementsLength = requirements.length;
  const isCreating = createPrompt.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Prompt</DialogTitle>
          <DialogDescription>
            Create a new root prompt manually or generate with AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="type-select">Content Type</Label>
            <Select
              value={type}
              onValueChange={(value: 'image' | 'video') => handleTypeChange(value)}
            >
              <SelectTrigger id="type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <Label htmlFor="model-select">AI Model</Label>
            <Select value={model} onValueChange={(value: Model) => setModel(value)}>
              <SelectTrigger id="model-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {type === 'image' ? (
                  <>
                    <SelectItem value="imagen4">Imagen4 (Google)</SelectItem>
                    <SelectItem value="midjourney">Midjourney</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="veo3">Veo3 (Google)</SelectItem>
                    <SelectItem value="sora2">Sora2 (OpenAI)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* AI Generation Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-500" />
              <Label>Generate with AI</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Describe what you want to generate... (e.g., 'A peaceful Japanese garden with cherry blossoms')"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                disabled={isGenerating || isCreating}
                className="min-h-[100px] resize-none"
                aria-label="Requirements for AI generation"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {requirementsLength} characters
                </span>
                <Button
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating || isCreating || !requirements.trim()}
                  size="sm"
                  variant="secondary"
                >
                  <Sparkles className="size-4" />
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Manual Content Section */}
          <div className="space-y-2">
            <Label htmlFor="manual-content">Manual Content</Label>
            <Textarea
              id="manual-content"
              placeholder="Enter your prompt content here..."
              value={manualContent}
              onChange={(e) => setManualContent(e.target.value)}
              disabled={isCreating}
              className="min-h-[150px] resize-none font-mono text-sm"
              aria-label="Manual content input"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {manualContentLength} characters
              </span>
            </div>
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
            disabled={isCreating || isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || isGenerating || !manualContent.trim()}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
