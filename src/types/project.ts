/**
 * Project type definitions
 */

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  _count?: {
    prompts: number;
  };
}

export interface ProjectListProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
}
