import type { Project } from '../types';
import { ProjectCard } from './ProjectCard';

export function ProjectList({
  projects,
  onDelete,
}: {
  projects: Project[];
  onDelete: (id: string) => void;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
