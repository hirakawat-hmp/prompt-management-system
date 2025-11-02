'use client';

import { useState } from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { ProjectList } from '@/components/projects/ProjectList';
import { PromptDetail } from '@/components/prompts/PromptDetail';
import { PromptGraph } from '@/components/graph';
import { usePrompts } from '@/hooks';

/**
 * Home page - Main prompt management interface
 *
 * Now using React Query hooks for data fetching:
 * - ProjectList fetches its own data via useProjects()
 * - Prompts are fetched via usePrompts(selectedProjectId)
 * - PromptDetail uses mutation hooks for feedback
 */
export default function Home() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedPromptId, setSelectedPromptId] = useState<string | undefined>();

  // Fetch prompts for the selected project
  const { data: prompts = [] } = usePrompts(selectedProjectId || '');

  // Find the selected prompt from the fetched list
  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId) || null;

  return (
    <div className="h-screen">
      <ThreeColumnLayout
        leftPanel={
          <ProjectList
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
        }
        centerPanel={
          <PromptGraph
            prompts={prompts}
            selectedPromptId={selectedPromptId}
            onPromptSelect={setSelectedPromptId}
            showControls
            showMinimap={true}
          />
        }
        rightPanel={
          <PromptDetail
            prompt={selectedPrompt}
            onGenerateImage={() => console.log('Generate image')}
            onGenerateVideo={() => console.log('Generate video')}
            onCreateDerivative={() => console.log('Create derivative')}
          />
        }
      />
    </div>
  );
}
