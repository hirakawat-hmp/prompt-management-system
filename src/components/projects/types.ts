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
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
}
