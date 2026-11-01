import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProject, deleteProject, getProject, listProjects, updateProjectTitle } from '../api';
import { useUiStore } from '../../../store/ui-store';
import type { Project } from '../types';

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: listProjects });
}
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
    enabled: Boolean(id),
  });
}
export function useCreateProject() {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      addToast('Project created', 'success');
    },
    onError: (error: Error) => addToast(error.message, 'error'),
  });
}
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: deleteProject,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previous = queryClient.getQueryData<Project[]>(['projects']);
      queryClient.setQueryData<Project[]>(['projects'], (old) =>
        (old ?? []).filter((p) => p.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['projects'], context.previous);
      addToast('Could not delete project', 'error');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
export function useUpdateProjectTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateProjectTitle(id, title),
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
