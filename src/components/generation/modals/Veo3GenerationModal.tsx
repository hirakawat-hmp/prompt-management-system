/**
 * Veo3GenerationModal Component
 *
 * Modal for creating Veo3 video generation tasks with multiple image upload support.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';
import { AlertCircle, X } from 'lucide-react';
import { ImageUploader } from '@/components/generation';
import { useCreateGenerationTask, useUploadFile } from '@/hooks/use-generation-tasks';
import { KieVeo3Schema, type KieVeo3Params } from '@/types/generation';
import type { UploadResult } from '@/types/generation';

export interface Veo3GenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  promptContent: string;
  onSuccess?: () => void;
}

// Form schema for validation
const formSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(5000),
  modelVariant: z.enum(['veo3', 'veo3_fast']),
  generationType: z.enum(['TEXT_2_VIDEO', 'FIRST_AND_LAST_FRAMES_2_VIDEO', 'REFERENCE_2_VIDEO']),
  aspectRatio: z.enum(['16:9', '9:16', 'Auto']),
  seeds: z
    .number()
    .min(10000, 'Seed must be between 10000 and 99999')
    .max(99999, 'Seed must be between 10000 and 99999')
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
});

type FormData = z.infer<typeof formSchema>;

/**
 * Veo3 video generation modal with multiple image upload support
 *
 * Features:
 * - Pre-filled prompt (editable)
 * - Model variant selection (veo3, veo3_fast)
 * - Generation type selection (TEXT_2_VIDEO, FIRST_AND_LAST_FRAMES_2_VIDEO, REFERENCE_2_VIDEO)
 * - Conditional image upload based on generation type
 * - Multiple image upload support (up to 3 for REFERENCE_2_VIDEO)
 * - Aspect ratio and seed configuration
 */
export function Veo3GenerationModal({
  open,
  onOpenChange,
  promptId,
  promptContent,
  onSuccess,
}: Veo3GenerationModalProps) {
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const createTask = useCreateGenerationTask();
  const uploadFile = useUploadFile();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: promptContent,
      modelVariant: 'veo3_fast',
      generationType: 'TEXT_2_VIDEO',
      aspectRatio: '16:9',
      seeds: undefined,
    },
  });

  const generationType = watch('generationType');

  // Reset form when promptContent changes or modal opens
  useEffect(() => {
    if (open) {
      reset({
        prompt: promptContent,
        modelVariant: 'veo3_fast',
        generationType: 'TEXT_2_VIDEO',
        aspectRatio: '16:9',
        seeds: undefined,
      });
      setUploadedImages([]);
      setError('');
    }
  }, [open, promptContent, reset]);

  // Clear images when generation type changes
  useEffect(() => {
    if (generationType === 'TEXT_2_VIDEO') {
      setUploadedImages([]);
    }
  }, [generationType]);

  /**
   * Handle image upload completion
   */
  const handleUploadComplete = (result: UploadResult, index?: number) => {
    if (generationType === 'FIRST_AND_LAST_FRAMES_2_VIDEO') {
      // For first/last frames, update specific index
      setUploadedImages((prev) => {
        const newImages = [...prev];
        newImages[index!] = result.downloadUrl;
        return newImages;
      });
    } else if (generationType === 'REFERENCE_2_VIDEO') {
      // For reference images, append to array
      setUploadedImages((prev) => [...prev, result.downloadUrl]);
    }
    setUploadingIndex(null);
  };

  /**
   * Remove uploaded image
   */
  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Validate images based on generation type
   */
  const validateImages = (): string | null => {
    if (generationType === 'TEXT_2_VIDEO') {
      return null; // No images required
    }

    if (generationType === 'FIRST_AND_LAST_FRAMES_2_VIDEO') {
      if (uploadedImages.length !== 2 || uploadedImages.some((url) => !url)) {
        return 'Please upload both first and last frames';
      }
      return null;
    }

    if (generationType === 'REFERENCE_2_VIDEO') {
      if (uploadedImages.length < 1) {
        return 'Please upload at least 1 reference image';
      }
      return null;
    }

    return null;
  };

  /**
   * Handle form submission
   */
  const onSubmit = (data: FormData) => {
    setError('');

    // Validate images
    const imageValidationError = validateImages();
    if (imageValidationError) {
      setError(imageValidationError);
      return;
    }

    // Build provider params
    const providerParams: KieVeo3Params = {
      service: 'KIE',
      model: 'VEO3',
      prompt: data.prompt,
      modelVariant: data.modelVariant,
      generationType: data.generationType,
      aspectRatio: data.aspectRatio,
      seeds: data.seeds,
    };

    // Add images if required
    if (uploadedImages.length > 0) {
      providerParams.imageUrls = uploadedImages;
    }

    // Validate with Zod schema
    const validation = KieVeo3Schema.safeParse(providerParams);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    // Create generation task
    createTask.mutate(
      {
        promptId,
        providerParams: validation.data,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            reset();
            setUploadedImages([]);
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
      reset();
      setUploadedImages([]);
      setError('');
    }
    onOpenChange(newOpen);
  };

  const isSubmitting = createTask.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Generate Video with Veo3</DialogTitle>
          <DialogDescription>
            Configure video generation parameters for Google Veo3
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              {...register('prompt')}
              placeholder="Describe the video you want to generate..."
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            {errors.prompt && (
              <p className="text-destructive text-sm">{errors.prompt.message}</p>
            )}
          </div>

          {/* Model Variant */}
          <div className="space-y-2">
            <Label htmlFor="model-variant">Model Variant</Label>
            <Select
              value={watch('modelVariant')}
              onValueChange={(value: 'veo3' | 'veo3_fast') => setValue('modelVariant', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="model-variant" aria-label="Model Variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veo3_fast">veo3_fast (Faster)</SelectItem>
                <SelectItem value="veo3">veo3 (Higher Quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generation Type */}
          <div className="space-y-2">
            <Label htmlFor="generation-type">Generation Type</Label>
            <Select
              value={watch('generationType')}
              onValueChange={(
                value: 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO'
              ) => setValue('generationType', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="generation-type" aria-label="Generation Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT_2_VIDEO">Text to Video</SelectItem>
                <SelectItem value="FIRST_AND_LAST_FRAMES_2_VIDEO">
                  First and Last Frames to Video
                </SelectItem>
                <SelectItem value="REFERENCE_2_VIDEO">Reference Images to Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload Section - Conditional */}
          {generationType === 'FIRST_AND_LAST_FRAMES_2_VIDEO' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>First Frame</Label>
                {uploadedImages[0] ? (
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <img
                      src={uploadedImages[0]}
                      alt="First frame"
                      className="size-20 rounded-md object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveImage(0)}
                      disabled={isSubmitting}
                    >
                      <X className="size-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <ImageUploader
                    onUploadComplete={(result) => handleUploadComplete(result, 0)}
                    maxSizeMB={100}
                    accept="image/*"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Last Frame</Label>
                {uploadedImages[1] ? (
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <img
                      src={uploadedImages[1]}
                      alt="Last frame"
                      className="size-20 rounded-md object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveImage(1)}
                      disabled={isSubmitting}
                    >
                      <X className="size-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <ImageUploader
                    onUploadComplete={(result) => handleUploadComplete(result, 1)}
                    maxSizeMB={100}
                    accept="image/*"
                  />
                )}
              </div>
            </div>
          )}

          {generationType === 'REFERENCE_2_VIDEO' && (
            <div className="space-y-3">
              <Label>Reference Images (1-3 images)</Label>

              {/* Display uploaded images */}
              {uploadedImages.map((url, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                  <img src={url} alt={`Reference ${index + 1}`} className="size-20 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="text-sm">Reference Image {index + 1}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isSubmitting}
                  >
                    <X className="size-4" />
                    Remove
                  </Button>
                </div>
              ))}

              {/* Show uploader if less than 3 images */}
              {uploadedImages.length < 3 && (
                <ImageUploader
                  onUploadComplete={(result) => handleUploadComplete(result)}
                  maxSizeMB={100}
                  accept="image/*"
                />
              )}

              {uploadedImages.length >= 3 && (
                <p className="text-muted-foreground text-xs">Maximum 3 reference images reached</p>
              )}
            </div>
          )}

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
            <Select
              value={watch('aspectRatio')}
              onValueChange={(value: '16:9' | '9:16' | 'Auto') => setValue('aspectRatio', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="aspect-ratio" aria-label="Aspect Ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                <SelectItem value="Auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <Label htmlFor="seed">Seed (Optional)</Label>
            <Input
              id="seed"
              type="number"
              placeholder="10000 - 99999"
              {...register('seeds', {
                setValueAs: (v) => (v === '' || v === null ? null : parseInt(v, 10)),
              })}
              disabled={isSubmitting}
            />
            {errors.seeds && <p className="text-destructive text-sm">{errors.seeds.message}</p>}
            <p className="text-muted-foreground text-xs">
              Optional seed value (10000-99999) for reproducible results
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
