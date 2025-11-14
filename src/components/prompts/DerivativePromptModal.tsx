/**
 * DerivativePromptModal Component
 *
 * Modal for creating derivative prompts (child prompts based on a parent).
 * Supports manual creation and AI-powered batch generation.
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
import { AlertCircle, Sparkles, GitBranch, Edit3, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { useCreatePrompt } from '@/hooks/useCreatePrompt';
import { improvePrompt } from '@/lib/api/prompt-generation';
import type { Model } from '@/lib/api/prompt-generation';

export interface DerivativePromptModalProps {
  projectId: string;
  parentPrompt: {
    id: string;
    type: 'image' | 'video';
    content: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type DerivativeMode = 'select' | 'manual' | 'ai-image' | 'ai-video';

export function DerivativePromptModal({
  projectId,
  parentPrompt,
  open,
  onOpenChange,
  onSuccess,
}: DerivativePromptModalProps) {
  const [mode, setMode] = useState<DerivativeMode>('select');

  // Manual mode state
  const [manualContent, setManualContent] = useState(parentPrompt.content);

  // AI mode state
  const [model, setModel] = useState<Model>('imagen4');
  const [instruction1, setInstruction1] = useState('');
  const [instruction2, setInstruction2] = useState('');
  const [instruction3, setInstruction3] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const createPrompt = useCreatePrompt();

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setMode('select');
    setManualContent(parentPrompt.content);
    setModel('imagen4');
    setInstruction1('');
    setInstruction2('');
    setInstruction3('');
    setError('');
    setIsGenerating(false);
  };

  /**
   * Handle manual derivative creation
   */
  const handleManualCreate = () => {
    if (!manualContent.trim()) {
      setError('Prompt content is required');
      return;
    }

    setError('');

    createPrompt.mutate(
      {
        projectId,
        type: parentPrompt.type,
        content: manualContent.trim(),
        parentId: parentPrompt.id,
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
          setError(err instanceof Error ? err.message : 'Failed to create derivative');
        },
      }
    );
  };

  /**
   * Handle AI batch derivative creation
   */
  const handleAICreate = async () => {
    const instructions = [instruction1, instruction2, instruction3]
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (instructions.length === 0) {
      setError('Please enter at least one improvement instruction');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Step 1: Call improvePrompt API for each instruction in parallel
      const improvePromises = instructions.map((instruction) =>
        improvePrompt(model, parentPrompt.content, instruction)
      );

      const results = await Promise.all(improvePromises);

      // Step 2: Check for errors
      const failedResults = results.filter((r) => !r.success);
      if (failedResults.length > 0) {
        setError(`Failed to generate ${failedResults.length} prompt(s): ${failedResults[0].error}`);
        setIsGenerating(false);
        return;
      }

      // Step 3: Extract improved prompts with their corresponding instructions
      const improvedPromptsWithInstructions = results
        .filter((r) => r.success)
        .map((r, index) => {
          if (!r.success) return { content: '', instruction: '' }; // Type guard
          let content = r.data.prompt;
          if (r.data.parameters) {
            content += `\n\nParameters: ${r.data.parameters}`;
          }
          return {
            content,
            instruction: instructions[index], // Keep track of which instruction generated this
          };
        });

      // Step 4: Create derivative prompts in parallel
      const contentType = mode === 'ai-image' ? 'image' : 'video';
      let successCount = 0;
      let failCount = 0;

      for (const { content, instruction } of improvedPromptsWithInstructions) {
        try {
          await new Promise<void>((resolve, reject) => {
            createPrompt.mutate(
              {
                projectId,
                type: contentType,
                content,
                parentId: parentPrompt.id,
                userFeedback: instruction, // Save the instruction as user feedback
              },
              {
                onSuccess: (result) => {
                  if (result.success) {
                    successCount++;
                    resolve();
                  } else {
                    failCount++;
                    reject(new Error(result.error));
                  }
                },
                onError: (err) => {
                  failCount++;
                  reject(err);
                },
              }
            );
          });
        } catch (err) {
          console.error('Failed to create derivative:', err);
        }
      }

      setIsGenerating(false);

      if (successCount > 0) {
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(`Failed to create all ${improvedPromptsWithInstructions.length} derivative prompts`);
      }
    } catch (err) {
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : 'Failed to generate derivatives');
    }
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

  const isCreating = createPrompt.isPending;
  const isDisabled = isGenerating || isCreating;

  // Count active instructions for AI mode
  const activeInstructionCount = [instruction1, instruction2, instruction3]
    .filter((i) => i.trim().length > 0).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="size-5" />
            Create Derivative Prompt
          </DialogTitle>
          <DialogDescription>
            {mode === 'select' && 'Choose how to create a derivative prompt'}
            {mode === 'manual' && 'Manually create a derivative prompt'}
            {mode === 'ai-image' && 'Generate AI-powered image prompt derivatives'}
            {mode === 'ai-video' && 'Generate AI-powered video prompt derivatives'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mode Selection */}
          {mode === 'select' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Parent Prompt ({parentPrompt.type})</Label>
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground max-h-[100px] overflow-y-auto">
                  {parentPrompt.content}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Choose Derivative Method</Label>

                <Button
                  onClick={() => setMode('manual')}
                  variant="outline"
                  className="w-full h-auto py-4 flex items-start gap-3 justify-start"
                >
                  <Edit3 className="size-5 mt-0.5 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">Manual Derivative</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      Manually edit the prompt content
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => {
                    setMode('ai-image');
                    setModel('imagen4');
                  }}
                  variant="outline"
                  className="w-full h-auto py-4 flex items-start gap-3 justify-start"
                >
                  <ImageIcon className="size-5 mt-0.5 shrink-0 text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold">AI Image Derivatives</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      Generate up to 3 image prompt variations with AI
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => {
                    setMode('ai-video');
                    setModel('veo3');
                  }}
                  variant="outline"
                  className="w-full h-auto py-4 flex items-start gap-3 justify-start"
                >
                  <VideoIcon className="size-5 mt-0.5 shrink-0 text-purple-500" />
                  <div className="text-left">
                    <div className="font-semibold">AI Video Derivatives</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      Generate up to 3 video prompt variations with AI
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Manual Mode */}
          {mode === 'manual' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Parent Prompt ({parentPrompt.type})</Label>
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground max-h-[80px] overflow-y-auto">
                  {parentPrompt.content}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="manual-content">Derivative Prompt Content</Label>
                <Textarea
                  id="manual-content"
                  placeholder="Edit the derivative prompt content..."
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  disabled={isDisabled}
                  className="min-h-[200px] resize-none font-mono text-sm"
                  aria-label="Manual prompt content"
                />
                <div className="text-xs text-muted-foreground">
                  {manualContent.length} characters
                </div>
              </div>
            </div>
          )}

          {/* AI Mode (Image or Video) */}
          {(mode === 'ai-image' || mode === 'ai-video') && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Parent Prompt ({parentPrompt.type})</Label>
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground max-h-[80px] overflow-y-auto">
                  {parentPrompt.content}
                </div>
              </div>

              <Separator />

              {/* Model Selector */}
              <div className="space-y-2">
                <Label htmlFor="model-select">Target AI Model</Label>
                <Select value={model} onValueChange={(value: Model) => setModel(value)}>
                  <SelectTrigger id="model-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mode === 'ai-image' ? (
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

              {/* Instructions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-purple-500" />
                  <Label>Improvement Instructions (1-3)</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Each instruction will generate a separate derivative prompt. Leave empty to skip.
                </p>

                {/* Instruction #1 */}
                <div className="space-y-2">
                  <Label htmlFor="instruction-1" className="text-xs font-medium">
                    Instruction #1
                  </Label>
                  <Textarea
                    id="instruction-1"
                    placeholder="e.g., 'Add more specific details about lighting'"
                    value={instruction1}
                    onChange={(e) => setInstruction1(e.target.value)}
                    disabled={isDisabled}
                    className="min-h-[60px] resize-none text-sm"
                  />
                </div>

                {/* Instruction #2 */}
                <div className="space-y-2">
                  <Label htmlFor="instruction-2" className="text-xs font-medium">
                    Instruction #2
                  </Label>
                  <Textarea
                    id="instruction-2"
                    placeholder="e.g., 'Make it more cinematic'"
                    value={instruction2}
                    onChange={(e) => setInstruction2(e.target.value)}
                    disabled={isDisabled}
                    className="min-h-[60px] resize-none text-sm"
                  />
                </div>

                {/* Instruction #3 */}
                <div className="space-y-2">
                  <Label htmlFor="instruction-3" className="text-xs font-medium">
                    Instruction #3
                  </Label>
                  <Textarea
                    id="instruction-3"
                    placeholder="e.g., 'Focus on composition and framing'"
                    value={instruction3}
                    onChange={(e) => setInstruction3(e.target.value)}
                    disabled={isDisabled}
                    className="min-h-[60px] resize-none text-sm"
                  />
                </div>

                {activeInstructionCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {activeInstructionCount} derivative{activeInstructionCount > 1 ? 's' : ''} will be created
                  </p>
                )}
              </div>
            </div>
          )}

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
          {mode === 'select' ? (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setMode('select')}
                disabled={isDisabled}
              >
                Back
              </Button>
              <Button
                onClick={mode === 'manual' ? handleManualCreate : handleAICreate}
                disabled={
                  isDisabled ||
                  (mode === 'manual' && !manualContent.trim()) ||
                  ((mode === 'ai-image' || mode === 'ai-video') && activeInstructionCount === 0)
                }
              >
                {isGenerating && 'Generating...'}
                {isCreating && 'Creating...'}
                {!isGenerating && !isCreating && mode === 'manual' && 'Create Derivative'}
                {!isGenerating && !isCreating && (mode === 'ai-image' || mode === 'ai-video') &&
                  `Create ${activeInstructionCount} Derivative${activeInstructionCount > 1 ? 's' : ''}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
