"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, VideoIcon, GitBranch, ChevronDown, AlertCircle } from "lucide-react";
import { useUpdatePrompt } from "@/hooks";
import type { Prompt, PromptDetailProps } from "@/types";

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
  const [feedbackInput, setFeedbackInput] = useState('');

  const updatePrompt = useUpdatePrompt();

  const handleSubmitFeedback = () => {
    if (!prompt || !feedbackInput.trim()) return;

    updatePrompt.mutate(
      {
        promptId: prompt.id,
        data: { userFeedback: feedbackInput },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setFeedbackInput('');
          }
        },
      }
    );
  };

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
          {/* User Feedback - Display existing feedback */}
          {prompt.userFeedback && (
            <Collapsible open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">User Feedback</h4>
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

          {/* User Feedback - Form for new feedback */}
          {!prompt.userFeedback && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Add Your Feedback</h4>
              <Textarea
                placeholder="Add your feedback..."
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                disabled={updatePrompt.isPending}
                className="min-h-[100px]"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={updatePrompt.isPending || !feedbackInput.trim()}
                  size="sm"
                >
                  {updatePrompt.isPending ? 'Submitting...' : 'Submit Feedback'}
                </Button>
                {updatePrompt.isError && (
                  <div className="flex items-center gap-1 text-sm text-destructive" role="alert">
                    <AlertCircle className="size-4" />
                    <span>Failed to submit feedback</span>
                  </div>
                )}
              </div>
            </div>
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
              <Button onClick={onGenerateImage} variant="default">
                <ImageIcon />
                Generate Image
              </Button>
            )}
            {prompt.type === "video" && (
              <Button onClick={onGenerateVideo} variant="default">
                <VideoIcon />
                Generate Video
              </Button>
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
              {prompt.assets.map((asset) => (
                <div key={asset.id} className="group relative">
                  {asset.type === "image" ? (
                    <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={asset.url}
                        alt={`Generated asset ${asset.id}`}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                      <VideoIcon className="size-12 text-muted-foreground" />
                    </div>
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
    </div>
  );
}
