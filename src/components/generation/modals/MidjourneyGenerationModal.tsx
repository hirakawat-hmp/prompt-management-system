/**
 * MidjourneyGenerationModal Component
 *
 * Modal for generating images/videos with Midjourney via Kie.ai.
 * Supports advanced parameters like variety, stylization, and weirdness.
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageUploader } from '@/components/generation/ImageUploader';
import { useCreateGenerationTask } from '@/hooks/use-generation-tasks';
import { KieMidjourneySchema, type KieMidjourneyParams, type UploadResult } from '@/types/generation';
import { cn } from '@/lib/utils';

export interface MidjourneyGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  promptContent: string;
  onSuccess?: () => void;
}

/**
 * Midjourney generation modal
 *
 * Features:
 * - Pre-filled prompt from prompt node
 * - Basic settings: task type, speed, aspect ratio, version
 * - Advanced settings: variety, stylization, weirdness
 * - Conditional fields based on task type
 * - File upload for img2img and reference tasks
 * - Video-specific settings (batch size, motion)
 */
export function MidjourneyGenerationModal({
  open,
  onOpenChange,
  promptId,
  promptContent,
  onSuccess,
}: MidjourneyGenerationModalProps) {
  // Form state
  const [prompt, setPrompt] = useState(promptContent);
  const [taskType, setTaskType] = useState<KieMidjourneyParams['taskType']>('mj_txt2img');
  const [speed, setSpeed] = useState<KieMidjourneyParams['speed']>('fast');
  const [aspectRatio, setAspectRatio] = useState<KieMidjourneyParams['aspectRatio']>('1:1');
  const [version, setVersion] = useState<KieMidjourneyParams['version']>('7');

  // Advanced settings
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [variety, setVariety] = useState(0);
  const [stylization, setStylization] = useState(100);
  const [weirdness, setWeirdness] = useState(0);
  const [ow, setOw] = useState<number | undefined>(undefined);

  // Video settings
  const [videoBatchSize, setVideoBatchSize] = useState<KieMidjourneyParams['videoBatchSize']>(1);
  const [motion, setMotion] = useState<KieMidjourneyParams['motion']>('high');

  // File upload
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);

  // UI state
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // React Query hook for creating generation tasks
  const createTask = useCreateGenerationTask();

  // Update prompt when promptContent changes
  useEffect(() => {
    setPrompt(promptContent);
  }, [promptContent]);

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setPrompt(promptContent);
    setTaskType('mj_txt2img');
    setSpeed('fast');
    setAspectRatio('1:1');
    setVersion('7');
    setVariety(0);
    setStylization(100);
    setWeirdness(0);
    setOw(undefined);
    setVideoBatchSize(1);
    setMotion('high');
    setUploadedFiles([]);
    setAdvancedOpen(false);
    setError('');
    setIsGenerating(false);
  };

  /**
   * Check if task type requires file upload
   */
  const requiresFileUpload = () => {
    return (
      taskType === 'mj_img2img' ||
      taskType === 'mj_style_reference' ||
      taskType === 'mj_omni_reference' ||
      taskType.includes('video')
    );
  };

  /**
   * Check if task type is video
   */
  const isVideoTask = () => {
    return taskType === 'mj_video' || taskType === 'mj_video_hd';
  };

  /**
   * Handle file upload complete
   */
  const handleUploadComplete = (result: UploadResult) => {
    setUploadedFiles((prev) => [...prev, result]);
    setError('');
  };

  /**
   * Validate form
   */
  const validateForm = (): string | null => {
    // Validate prompt
    if (!prompt.trim()) {
      return 'Prompt is required';
    }

    if (prompt.length > 2000) {
      return 'Prompt must be 2000 characters or less';
    }

    // Validate motion for video tasks
    if (isVideoTask() && !motion) {
      return 'Motion is required for video generation';
    }

    // Validate file upload for tasks that require it
    if (requiresFileUpload() && uploadedFiles.length === 0) {
      // Note: File upload might be optional for some tasks
      // This is a soft validation
    }

    return null;
  };

  /**
   * Handle form submission
   */
  const handleGenerate = async () => {
    setError('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGenerating(true);

    try {
      // Build params
      const params: KieMidjourneyParams = {
        service: 'KIE',
        model: 'MIDJOURNEY',
        taskType,
        prompt: prompt.trim(),
        speed,
        aspectRatio,
        version,
        variety: variety > 0 ? variety : undefined,
        stylization: stylization !== 100 ? stylization : undefined,
        weirdness: weirdness > 0 ? weirdness : undefined,
        fileUrls: uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.downloadUrl) : undefined,
      };

      // Add OW for omni_reference
      if (taskType === 'mj_omni_reference' && ow !== undefined) {
        params.ow = ow;
      }

      // Add video settings
      if (isVideoTask()) {
        params.videoBatchSize = videoBatchSize;
        params.motion = motion;
      }

      // Validate with Zod schema
      const validated = KieMidjourneySchema.parse(params);

      console.log('[MidjourneyModal] Validated params:', validated);
      console.log('[MidjourneyModal] Calling createTask.mutate with:', { promptId, providerParams: validated });

      // Call API to create generation task
      createTask.mutate(
        {
          promptId,
          providerParams: validated,
        },
        {
          onSuccess: (result) => {
            console.log('[MidjourneyModal] Mutation onSuccess:', result);
            if (result.success) {
              resetForm();
              onOpenChange(false);
              onSuccess?.();
            } else {
              setError(result.error);
            }
            setIsGenerating(false);
          },
          onError: (err) => {
            console.error('[MidjourneyModal] Mutation onError:', err);
            setError(err instanceof Error ? err.message : 'Generation failed');
            setIsGenerating(false);
          },
        }
      );
    } catch (err) {
      console.error('[MidjourneyModal] Validation or other error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
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

  const promptLength = prompt.length;
  const maxPromptLength = 2000;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Midjourney Generation</DialogTitle>
          <DialogDescription>
            Generate images or videos using Midjourney AI model
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              rows={4}
              className={cn(promptLength > maxPromptLength && 'border-destructive')}
              aria-label="Prompt"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Maximum 2000 characters</span>
              <span className={cn(promptLength > maxPromptLength && 'text-destructive')}>
                {promptLength} / {maxPromptLength}
              </span>
            </div>
          </div>

          {/* Task Type */}
          <div className="space-y-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Select
              value={taskType}
              onValueChange={(value) => setTaskType(value as KieMidjourneyParams['taskType'])}
            >
              <SelectTrigger id="taskType" aria-label="Task Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mj_txt2img">Text to Image</SelectItem>
                <SelectItem value="mj_img2img">Image to Image</SelectItem>
                <SelectItem value="mj_style_reference">Style Reference</SelectItem>
                <SelectItem value="mj_omni_reference">Omni Reference</SelectItem>
                <SelectItem value="mj_video">Video</SelectItem>
                <SelectItem value="mj_video_hd">Video HD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload - Conditional */}
          {requiresFileUpload() && (
            <div className="space-y-2">
              <Label>Reference File</Label>
              <ImageUploader
                onUploadComplete={handleUploadComplete}
                maxSizeMB={100}
                accept={isVideoTask() ? 'video/*,image/*' : 'image/*'}
              />
            </div>
          )}

          {/* Speed */}
          <div className="space-y-2">
            <Label htmlFor="speed">Speed</Label>
            <Select
              value={speed}
              onValueChange={(value) => setSpeed(value as KieMidjourneyParams['speed'])}
            >
              <SelectTrigger id="speed" aria-label="Speed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relaxed">Relaxed</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="turbo">Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label htmlFor="aspectRatio">Aspect Ratio</Label>
            <Select
              value={aspectRatio}
              onValueChange={(value) => setAspectRatio(value as KieMidjourneyParams['aspectRatio'])}
            >
              <SelectTrigger id="aspectRatio" aria-label="Aspect Ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:2">1:2 (Portrait)</SelectItem>
                <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                <SelectItem value="2:3">2:3</SelectItem>
                <SelectItem value="3:4">3:4</SelectItem>
                <SelectItem value="5:6">5:6</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="6:5">6:5</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
                <SelectItem value="3:2">3:2</SelectItem>
                <SelectItem value="16:9">16:9 (Horizontal)</SelectItem>
                <SelectItem value="2:1">2:1 (Landscape)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Version */}
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Select
              value={version}
              onValueChange={(value) => setVersion(value as KieMidjourneyParams['version'])}
            >
              <SelectTrigger id="version" aria-label="Version">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Version 7 (Latest)</SelectItem>
                <SelectItem value="6.1">Version 6.1</SelectItem>
                <SelectItem value="6">Version 6</SelectItem>
                <SelectItem value="5.2">Version 5.2</SelectItem>
                <SelectItem value="5.1">Version 5.1</SelectItem>
                <SelectItem value="niji6">Niji 6 (Anime)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Video Settings - Conditional */}
          {isVideoTask() && (
            <>
              <div className="space-y-2">
                <Label htmlFor="batchSize">Batch Size</Label>
                <Select
                  value={videoBatchSize?.toString()}
                  onValueChange={(value) => setVideoBatchSize(parseInt(value) as 1 | 2 | 4)}
                >
                  <SelectTrigger id="batchSize" aria-label="Batch Size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motion">Motion</Label>
                <Select
                  value={motion}
                  onValueChange={(value) => setMotion(value as 'high' | 'low')}
                >
                  <SelectTrigger id="motion" aria-label="Motion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Advanced Settings */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between"
                type="button"
                aria-label="Advanced Settings"
              >
                <span>Advanced Settings</span>
                {advancedOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Variety */}
              <div className="space-y-2">
                <Label htmlFor="variety">Variety: {variety}</Label>
                <Slider
                  id="variety"
                  min={0}
                  max={100}
                  step={5}
                  value={[variety]}
                  onValueChange={(vals) => setVariety(vals[0])}
                  className="w-full"
                  aria-label="Variety"
                />
                <p className="text-xs text-muted-foreground">
                  Controls variation in output (0-100, step 5)
                </p>
              </div>

              {/* Stylization */}
              <div className="space-y-2">
                <Label htmlFor="stylization">Stylization: {stylization}</Label>
                <Slider
                  id="stylization"
                  min={0}
                  max={1000}
                  step={50}
                  value={[stylization]}
                  onValueChange={(vals) => setStylization(vals[0])}
                  className="w-full"
                  aria-label="Stylization"
                />
                <p className="text-xs text-muted-foreground">
                  How artistic the output should be (0-1000, step 50)
                </p>
              </div>

              {/* Weirdness */}
              <div className="space-y-2">
                <Label htmlFor="weirdness">Weirdness: {weirdness}</Label>
                <Slider
                  id="weirdness"
                  min={0}
                  max={3000}
                  step={100}
                  value={[weirdness]}
                  onValueChange={(vals) => setWeirdness(vals[0])}
                  className="w-full"
                  aria-label="Weirdness"
                />
                <p className="text-xs text-muted-foreground">
                  Unconventional interpretations (0-3000, step 100)
                </p>
              </div>

              {/* OW - Conditional for omni_reference only */}
              {taskType === 'mj_omni_reference' && (
                <div className="space-y-2">
                  <Label htmlFor="ow">OW (Omni Weight)</Label>
                  <Input
                    id="ow"
                    type="number"
                    min={1}
                    max={1000}
                    value={ow ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value) : undefined;
                      setOw(val);
                    }}
                    placeholder="1-1000"
                    aria-label="OW"
                  />
                  <p className="text-xs text-muted-foreground">
                    Omni reference weight (1-1000)
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating} type="button">
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
