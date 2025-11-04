'use client';

import { useState } from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { ProjectList } from '@/components/projects/ProjectList';
import { PromptDetail } from '@/components/prompts/PromptDetail';
import { PromptGraph } from '@/components/graph';
import { GenerationTaskDashboard } from '@/components/generation/GenerationTaskDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [activeTab, setActiveTab] = useState<'graph' | 'tasks'>('graph');

  // Fetch prompts for the selected project
  const { data: prompts = [] } = usePrompts(selectedProjectId || '');

  // Find the selected prompt from the fetched list
  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId) || null;

  // Handler for when a prompt is selected from the dashboard
  const handlePromptSelectFromDashboard = (promptId: string) => {
    setSelectedPromptId(promptId);
    setActiveTab('graph'); // Switch to graph view when selecting a prompt
  };

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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'graph' | 'tasks')} className="h-full flex flex-col">
            <div className="border-b px-6 pt-4 flex justify-end">
              <TabsList>
                <TabsTrigger value="graph">Graph View</TabsTrigger>
                <TabsTrigger value="tasks">Task Dashboard</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="graph" className="flex-1 m-0">
              <PromptGraph
                projectId={selectedProjectId || ''}
                prompts={prompts}
                selectedPromptId={selectedPromptId}
                onPromptSelect={setSelectedPromptId}
                showControls
                showMinimap={true}
              />
            </TabsContent>
            <TabsContent value="tasks" className="flex-1 m-0">
              <GenerationTaskDashboard
                projectId={selectedProjectId || ''}
                onPromptSelect={handlePromptSelectFromDashboard}
              />
            </TabsContent>
          </Tabs>
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
