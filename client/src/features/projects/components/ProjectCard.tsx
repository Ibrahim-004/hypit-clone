import { Link } from 'react-router-dom';
import type { Project } from '../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <Link to={`/app/projects/${project.id}`} className="block">
        <h2 className="text-lg font-semibold">{project.title}</h2>
        <p className="mt-1 text-sm text-muted">{project.scenes?.length ?? 0} scenes</p>
      </Link>
      <div className="mt-4 flex justify-end">
        <Button
          variant="danger"
          onClick={() => onDelete(project.id)}
          aria-label={`Delete ${project.title}`}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
