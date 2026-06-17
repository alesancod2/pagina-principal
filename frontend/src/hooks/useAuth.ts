import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, LoginPayload, RegisterPayload } from '../services/auth.service';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query: dados do usuário logado
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authService.getMe(),
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Mutation: login
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      router.push('/main?view=marketplace');
    },
  });

  // Mutation: register
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      router.push('/main?view=marketplace');
    },
  });

  // Mutation: logout
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.push('/auth/signin');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: authService.isAuthenticated(),
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    loginLoading: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    registerLoading: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
  };
}
