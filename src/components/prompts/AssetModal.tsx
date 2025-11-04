/**
 * AssetModal Component
 *
 * Displays a full-size preview of an asset (image or video) in a modal dialog.
 * Supports navigation between multiple assets and displays metadata.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import type { Asset } from '@/types/project';

export interface AssetModalProps {
  /**
   * Array of assets to display
   */
  assets: Asset[];

  /**
   * Index of the initially selected asset
   */
  initialIndex: number;

  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * Callback when modal close is requested
   */
  onOpenChange: (open: boolean) => void;
}

/**
 * Format a date for display
 */
function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return 'Unknown size';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function AssetModal({
  assets,
  initialIndex,
  open,
  onOpenChange,
}: AssetModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentAsset = assets[currentIndex];

  // Reset to initial index when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : assets.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < assets.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = currentAsset.url;
    link.download = `asset-${currentAsset.id}.${currentAsset.url.split('.').pop()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentAsset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2">
                <Badge variant="secondary">{currentAsset.provider}</Badge>
                <Badge variant="outline">{currentAsset.type}</Badge>
                {assets.length > 1 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {currentIndex + 1} / {assets.length}
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="mt-2">
                Created: {formatDate(currentAsset.createdAt)}
                {currentAsset.metadata?.fileSize && (
                  <> • {formatFileSize(currentAsset.metadata.fileSize as number)}</>
                )}
                {currentAsset.metadata?.width && currentAsset.metadata?.height && (
                  <> • {currentAsset.metadata.width} × {currentAsset.metadata.height}</>
                )}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Asset Display */}
        <div className="flex-1 relative overflow-hidden bg-muted/30">
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {currentAsset.type === 'image' ? (
              <img
                src={currentAsset.url}
                alt={`Asset ${currentAsset.id}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : (
              <video
                src={currentAsset.url}
                controls
                className="max-w-full max-h-full rounded-lg"
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>

          {/* Navigation Arrows */}
          {assets.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                onClick={handlePrevious}
                title="Previous (←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                onClick={handleNext}
                title="Next (→)"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Strip (if multiple assets) */}
        {assets.length > 1 && (
          <div className="border-t bg-muted/10 p-4">
            <div className="flex gap-2 overflow-x-auto">
              {assets.map((asset, index) => (
                <button
                  key={asset.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-all ${
                    index === currentIndex
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-muted-foreground/20'
                  }`}
                >
                  {asset.type === 'image' ? (
                    <img
                      src={asset.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                      Video
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
