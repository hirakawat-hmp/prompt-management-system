"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { AssetModal } from "./AssetModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageIcon, VideoIcon, GitBranch, ChevronDown } from "lucide-react";
import type { Prompt, PromptDetailProps } from "@/types";
import {
  Imagen4GenerationModal,
  Veo3GenerationModal,
  MidjourneyGenerationModal,
  Sora2GenerationModal,
} from "@/components/generation/modals";

/**
 * Format a date for display
 * Handles both Date objects and ISO string dates from API
 */
function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

export function PromptDetail({
  prompt,
  onGenerateImage,
  onGenerateVideo,
  onCreateDerivative,
}: PromptDetailProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(true);
  const [isCommentOpen, setIsCommentOpen] = useState(true);

  // Generation modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [imageModel, setImageModel] = useState<'MIDJOURNEY' | 'IMAGEN4'>('MIDJOURNEY');
  const [videoModel, setVideoModel] = useState<'VEO3' | 'SORA2'>('VEO3');

  // Asset modal state
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

  const queryClient = useQueryClient();

  if (!prompt) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">No prompt selected</p>
          <p className="text-muted-foreground text-xs mt-2">
            Select a prompt to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6 overflow-y-auto">
      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Details</CardTitle>
          <CardDescription>
            Created: {formatDate(prompt.createdAt)} | Updated:{" "}
            {formatDate(prompt.updatedAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Feedback - Created from derivative instruction */}
          {prompt.userFeedback && (
            <Collapsible open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Derivative Instruction</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-1">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isFeedbackOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-2">
                <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-3 text-sm whitespace-pre-wrap">
                  {prompt.userFeedback}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* AI Comment */}
          {prompt.aiComment && (
            <Collapsible open={isCommentOpen} onOpenChange={setIsCommentOpen}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">AI Comment</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-1">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isCommentOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-2">
                <div className="rounded-md border border-purple-500/20 bg-purple-500/5 p-3 text-sm whitespace-pre-wrap">
                  {prompt.aiComment}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Prompt Content */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Prompt Content</h4>
            <div className="rounded-md border bg-muted/50 p-4 min-h-[120px] whitespace-pre-wrap font-mono text-sm">
              {prompt.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Prompt */}
      {prompt.parent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="size-4" />
              Parent Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground line-clamp-3">
              {prompt.parent.content}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {prompt.type === "image" && (
              <div className="flex gap-2 items-center">
                <Select value={imageModel} onValueChange={(value: 'MIDJOURNEY' | 'IMAGEN4') => setImageModel(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MIDJOURNEY">Midjourney</SelectItem>
                    <SelectItem value="IMAGEN4">Imagen4</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setImageModalOpen(true)} variant="default">
                  <ImageIcon />
                  Generate Image
                </Button>
              </div>
            )}
            {prompt.type === "video" && (
              <div className="flex gap-2 items-center">
                <Select value={videoModel} onValueChange={(value: 'VEO3' | 'SORA2') => setVideoModel(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VEO3">Veo3</SelectItem>
                    <SelectItem value="SORA2">Sora2</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setVideoModalOpen(true)} variant="default">
                  <VideoIcon />
                  Generate Video
                </Button>
              </div>
            )}
            <Button onClick={onCreateDerivative} variant="secondary">
              <GitBranch />
              Create Derivative
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Assets */}
      {prompt.assets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generated Assets</CardTitle>
            <CardDescription>
              {prompt.assets.length} asset{prompt.assets.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {prompt.assets.map((asset, index) => (
                <div key={asset.id} className="group relative">
                  {asset.type === "image" ? (
                    <button
                      onClick={() => {
                        setSelectedAssetIndex(index);
                        setAssetModalOpen(true);
                      }}
                      className="w-full aspect-square overflow-hidden rounded-lg border bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    >
                      <img
                        src={asset.url}
                        alt={`Generated asset ${asset.id}`}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedAssetIndex(index);
                        setAssetModalOpen(true);
                      }}
                      className="w-full aspect-square overflow-hidden rounded-lg border bg-muted flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    >
                      <VideoIcon className="size-12 text-muted-foreground" />
                    </button>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="secondary">{asset.provider}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(asset.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Modals */}
      {imageModel === 'MIDJOURNEY' && (
        <MidjourneyGenerationModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          promptId={prompt.id}
          promptContent={prompt.content}
          onSuccess={() => {
            setImageModalOpen(false);
            // Invalidate prompts query to refetch with new assets
            queryClient.invalidateQueries({
              queryKey: queryKeys.prompts.byProject(prompt.projectId),
            });
          }}
        />
      )}

      {imageModel === 'IMAGEN4' && (
        <Imagen4GenerationModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          promptId={prompt.id}
          promptContent={prompt.content}
          onSuccess={() => {
            setImageModalOpen(false);
            // Invalidate prompts query to refetch with new assets
            queryClient.invalidateQueries({
              queryKey: queryKeys.prompts.byProject(prompt.projectId),
            });
          }}
        />
      )}

      {videoModel === 'VEO3' && (
        <Veo3GenerationModal
          open={videoModalOpen}
          onOpenChange={setVideoModalOpen}
          promptId={prompt.id}
          promptContent={prompt.content}
          onSuccess={() => {
            setVideoModalOpen(false);
            // Invalidate prompts query to refetch with new assets
            queryClient.invalidateQueries({
              queryKey: queryKeys.prompts.byProject(prompt.projectId),
            });
          }}
        />
      )}

      {videoModel === 'SORA2' && (
        <Sora2GenerationModal
          open={videoModalOpen}
          onOpenChange={setVideoModalOpen}
          promptId={prompt.id}
          promptContent={prompt.content}
          onSuccess={() => {
            setVideoModalOpen(false);
            // Invalidate prompts query to refetch with new assets
            queryClient.invalidateQueries({
              queryKey: queryKeys.prompts.byProject(prompt.projectId),
            });
          }}
        />
      )}

      {/* Asset Modal */}
      <AssetModal
        assets={prompt.assets}
        initialIndex={selectedAssetIndex}
        open={assetModalOpen}
        onOpenChange={setAssetModalOpen}
      />
    </div>
  );
}
