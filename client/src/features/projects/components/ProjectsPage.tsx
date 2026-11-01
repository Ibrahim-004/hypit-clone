import { useState } from 'react';
import { useCreateProject, useDeleteProject, useProjects } from '../hooks/useProjects';
import { ProjectList } from './ProjectList';
import { ProjectListSkeleton } from './ProjectListSkeleton';
import { ProjectEmptyState } from './ProjectEmptyState';
import { CreateProjectForm } from './CreateProjectForm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useLogout } from '../../auth/hooks/useAuth';

export function ProjectsPage() {
  const projectsQuery = useProjects();
  const createMutation = useCreateProject();
  const deleteMutation = useDeleteProject();
  const logoutMutation = useLogout();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <main className="mx-auto max-w-6xl p-4">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Your projects</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(true)}>New project</Button>
          <Button variant="secondary" onClick={() => logoutMutation.mutate()}>
            Log out
          </Button>
        </div>
      </header>
      {projectsQuery.isPending ? <ProjectListSkeleton /> : null}
      {projectsQuery.isError ? (
        <p role="alert" className="text-danger">
          Could not load projects. Please try again.
        </p>
      ) : null}
      {projectsQuery.data && projectsQuery.data.length === 0 ? <ProjectEmptyState /> : null}
      {projectsQuery.data && projectsQuery.data.length > 0 ? (
        <ProjectList projects={projectsQuery.data} onDelete={(id) => deleteMutation.mutate(id)} />
      ) : null}
      {showCreate ? (
        <Modal title="Create project" onClose={() => setShowCreate(false)}>
          <CreateProjectForm
            creating={createMutation.isPending}
            onCreate={(title) => {
              createMutation.mutate(title, { onSuccess: () => setShowCreate(false) });
            }}
          />
        </Modal>
      ) : null}
    </main>
  );
}
