'use client';

import { useState } from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { ProjectList } from '@/components/projects/ProjectList';
import { PromptDetail } from '@/components/prompts/PromptDetail';
import { PromptGraph } from '@/components/graph';
import type { Prompt } from '@/types';

/**
 * Mock data for development
 * TODO: Replace with actual API calls
 */
const mockProjects = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  name: `Project ${i + 1}`,
  createdAt: new Date(2025, 0, i + 1), // Jan 1-20, 2025
  _count: { prompts: ((i * 7) % 20) + 1 }, // Deterministic pseudo-random
}));

/**
 * Mock prompts with hierarchical relationships
 * Demonstrates prompt derivation and branching
 */
const mockPrompts: Prompt[] = [
  {
    id: '1',
    type: 'image',
    content: 'A serene mountain landscape at sunset',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T10:00:00Z'),
    assets: [
      {
        id: 'asset-1',
        promptId: '1',
        type: 'image',
        url: '/placeholder-image.jpg',
        provider: 'midjourney',
        createdAt: new Date('2025-01-01T10:05:00Z'),
      },
    ],
  },
  {
    id: '2',
    type: 'image',
    content: 'A serene mountain landscape at sunset with golden light, dramatic clouds, 4k quality',
    userFeedback: 'Make it more dramatic with darker clouds and stronger contrast',
    aiComment: 'Added "dramatic clouds" and "4k quality" to enhance the visual impact based on user feedback',
    createdAt: new Date('2025-01-01T11:00:00Z'),
    updatedAt: new Date('2025-01-01T11:00:00Z'),
    parent: {
      id: '1',
      content: 'A serene mountain landscape at sunset',
    },
    assets: [
      {
        id: 'asset-2',
        promptId: '2',
        type: 'image',
        url: '/placeholder-image.jpg',
        provider: 'dall-e',
        createdAt: new Date('2025-01-01T11:05:00Z'),
      },
    ],
  },
  {
    id: '3',
    type: 'video',
    content: 'A serene mountain landscape at sunset, camera slowly panning right, cinematic motion',
    userFeedback: 'Convert this to a video with camera movement',
    aiComment: 'Added camera movement description and cinematic style for video generation',
    createdAt: new Date('2025-01-01T12:00:00Z'),
    updatedAt: new Date('2025-01-01T12:00:00Z'),
    parent: {
      id: '1',
      content: 'A serene mountain landscape at sunset',
    },
    assets: [
      {
        id: 'asset-3',
        promptId: '3',
        type: 'video',
        url: '/placeholder-video.mp4',
        provider: 'veo',
        createdAt: new Date('2025-01-01T12:30:00Z'),
      },
    ],
  },
  {
    id: '4',
    type: 'image',
    content: 'A serene mountain landscape at sunset with golden light, dramatic clouds, snow-capped peaks, 8k ultra quality',
    userFeedback: 'Add more detail to the mountains and increase quality',
    aiComment: 'Added "snow-capped peaks" detail and upgraded to "8k ultra quality"',
    createdAt: new Date('2025-01-01T13:00:00Z'),
    updatedAt: new Date('2025-01-01T13:00:00Z'),
    parent: {
      id: '2',
      content: 'A serene mountain landscape at sunset with golden light, dramatic clouds, 4k quality',
    },
    assets: [
      {
        id: 'asset-4',
        promptId: '4',
        type: 'image',
        url: '/placeholder-image.jpg',
        provider: 'stable-diffusion',
        createdAt: new Date('2025-01-01T13:05:00Z'),
      },
    ],
  },
  {
    id: '5',
    type: 'image',
    content: 'A serene mountain landscape at night with aurora borealis, dramatic clouds, 4k quality',
    userFeedback: 'Change sunset to night time with northern lights',
    aiComment: 'Changed time of day and added "aurora borealis" while keeping the dramatic atmosphere',
    createdAt: new Date('2025-01-01T14:00:00Z'),
    updatedAt: new Date('2025-01-01T14:00:00Z'),
    parent: {
      id: '2',
      content: 'A serene mountain landscape at sunset with golden light, dramatic clouds, 4k quality',
    },
    assets: [
      {
        id: 'asset-5',
        promptId: '5',
        type: 'image',
        url: '/placeholder-image.jpg',
        provider: 'flux',
        createdAt: new Date('2025-01-01T14:05:00Z'),
      },
    ],
  },
];

/**
 * Home page - Main prompt management interface
 */
export default function Home() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(
    mockProjects[0].id
  );
  const [selectedPromptId, setSelectedPromptId] = useState<string | undefined>(
    mockPrompts[0].id
  );

  // Find the selected prompt from the list
  const selectedPrompt = mockPrompts.find((p) => p.id === selectedPromptId) || null;

  return (
    <div className="h-screen">
      <ThreeColumnLayout
        leftPanel={
          <ProjectList
            projects={mockProjects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onCreateProject={() => console.log('Create project')}
          />
        }
        centerPanel={
          <PromptGraph
            prompts={mockPrompts}
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
