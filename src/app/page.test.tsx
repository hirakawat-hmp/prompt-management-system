import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import ProjectsPage from './page';

// Mock the child components to isolate page logic
vi.mock('@/components/layout/ThreeColumnLayout', () => ({
  ThreeColumnLayout: ({
    leftPanel,
    centerPanel,
    rightPanel,
  }: {
    leftPanel: React.ReactNode;
    centerPanel: React.ReactNode;
    rightPanel: React.ReactNode;
  }) => (
    <div data-testid="three-column-layout">
      <div data-testid="left-panel">{leftPanel}</div>
      <div data-testid="center-panel">{centerPanel}</div>
      <div data-testid="right-panel">{rightPanel}</div>
    </div>
  ),
}));

vi.mock('@/components/projects/ProjectList', () => ({
  ProjectList: ({
    projects,
    selectedProjectId,
    onSelectProject,
    onCreateProject,
  }: {
    projects: Array<{ id: string; name: string }>;
    selectedProjectId?: string;
    onSelectProject: (id: string) => void;
    onCreateProject: () => void;
  }) => (
    <div data-testid="project-list">
      <button onClick={onCreateProject}>New Project</button>
      {projects.map((project) => (
        <div key={project.id}>
          <button
            onClick={() => onSelectProject(project.id)}
            data-selected={project.id === selectedProjectId}
          >
            {project.name}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/prompts/PromptDetail', () => ({
  PromptDetail: ({
    prompt,
    onGenerateImage,
    onGenerateVideo,
    onCreateDerivative,
  }: {
    prompt: { content: string; type: string } | null;
    onGenerateImage: () => void;
    onGenerateVideo: () => void;
    onCreateDerivative: () => void;
  }) => (
    <div data-testid="prompt-detail">
      {prompt && <div>{prompt.content}</div>}
      <button onClick={onGenerateImage}>Generate Image</button>
      <button onClick={onGenerateVideo}>Generate Video</button>
      <button onClick={onCreateDerivative}>Create Derivative</button>
    </div>
  ),
}));

vi.mock('@/components/graph', () => ({
  PromptGraph: ({
    prompts,
    selectedPromptId,
    onPromptSelect,
  }: {
    prompts: Array<{ id: string; content: string }>;
    selectedPromptId?: string;
    onPromptSelect?: (id: string) => void;
  }) => (
    <div data-testid="prompt-graph">
      <div>Prompt Graph</div>
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          onClick={() => onPromptSelect?.(prompt.id)}
          data-selected={prompt.id === selectedPromptId}
        >
          {prompt.content}
        </button>
      ))}
    </div>
  ),
}));

describe('ProjectsPage', () => {
  describe('Rendering', () => {
    it('should render with ThreeColumnLayout', () => {
      render(<ProjectsPage />);

      expect(screen.getByTestId('three-column-layout')).toBeInTheDocument();
    });

    it('should render ProjectList in left panel', () => {
      render(<ProjectsPage />);

      const leftPanel = screen.getByTestId('left-panel');
      expect(leftPanel.querySelector('[data-testid="project-list"]')).toBeInTheDocument();
    });

    it('should render PromptGraph in center panel', () => {
      render(<ProjectsPage />);

      const centerPanel = screen.getByTestId('center-panel');
      expect(centerPanel.querySelector('[data-testid="prompt-graph"]')).toBeInTheDocument();
    });

    it('should render PromptDetail in right panel', () => {
      render(<ProjectsPage />);

      const rightPanel = screen.getByTestId('right-panel');
      expect(rightPanel.querySelector('[data-testid="prompt-detail"]')).toBeInTheDocument();
    });

    it('should have full height container', () => {
      const { container } = render(<ProjectsPage />);

      const pageContainer = container.firstChild as HTMLElement;
      expect(pageContainer).toHaveClass('h-screen');
    });
  });

  describe('Project Selection', () => {
    it('should select first project by default', () => {
      render(<ProjectsPage />);

      const firstProjectButton = screen.getByText('Project 1');
      expect(firstProjectButton).toHaveAttribute('data-selected', 'true');
    });

    it('should change selected project when clicking on different project', async () => {
      const user = userEvent.setup();
      render(<ProjectsPage />);

      const secondProjectButton = screen.getByText('Project 2');
      await user.click(secondProjectButton);

      expect(secondProjectButton).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('Mock Data Display', () => {
    it('should display mock projects', () => {
      render(<ProjectsPage />);

      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });

    it('should display mock prompt content', () => {
      render(<ProjectsPage />);

      const rightPanel = screen.getByTestId('right-panel');
      expect(
        rightPanel
      ).toHaveTextContent('A serene mountain landscape at sunset');
    });
  });

  describe('Action Handlers', () => {
    it('should handle create project action', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(<ProjectsPage />);

      await user.click(screen.getByText('New Project'));
      expect(consoleSpy).toHaveBeenCalledWith('Create project');

      consoleSpy.mockRestore();
    });

    it('should handle generate image action', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(<ProjectsPage />);

      await user.click(screen.getByText('Generate Image'));
      expect(consoleSpy).toHaveBeenCalledWith('Generate image');

      consoleSpy.mockRestore();
    });

    it('should handle generate video action', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(<ProjectsPage />);

      await user.click(screen.getByText('Generate Video'));
      expect(consoleSpy).toHaveBeenCalledWith('Generate video');

      consoleSpy.mockRestore();
    });

    it('should handle create derivative action', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(<ProjectsPage />);

      await user.click(screen.getByText('Create Derivative'));
      expect(consoleSpy).toHaveBeenCalledWith('Create derivative');

      consoleSpy.mockRestore();
    });
  });

  describe('PromptGraph', () => {
    it('should render graph with prompts', () => {
      render(<ProjectsPage />);

      const centerPanel = screen.getByTestId('center-panel');
      const graph = centerPanel.querySelector('[data-testid="prompt-graph"]');
      expect(graph).toBeInTheDocument();
    });

    it('should display Prompt Graph text', () => {
      render(<ProjectsPage />);

      expect(screen.getByText('Prompt Graph')).toBeInTheDocument();
    });
  });
});
