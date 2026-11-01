import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login, logout, register } from '../api';
import { useUiStore } from '../../../store/ui-store';

export function useLogin() {
  const navigate = useNavigate();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: login,
    onSuccess: () => navigate('/app'),
    onError: (error: Error) => addToast(error.message, 'error'),
  });
}
export function useRegister() {
  const navigate = useNavigate();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: register,
    onSuccess: () => navigate('/app'),
    onError: (error: Error) => addToast(error.message, 'error'),
  });
}
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      navigate('/login');
    },
  });
}
