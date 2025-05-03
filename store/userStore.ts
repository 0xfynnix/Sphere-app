import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/lib/api/types';
import { authApi } from '@/lib/api/auth';
// import { useRouter } from 'next/navigation';

interface UserState {
  user: UserProfile | null;
  token: string | null;
  setUser: (user: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      refreshUser: async () => {
        try {
          const response = await authApi.get();
          if (response.data?.user) {
            set({ user: response.data.user });
          } else {
            // 如果未获取到用户信息，清除用户信息并跳转到首页
              set({ user: null, token: null });
              window.location.href = '/';
          }
        } catch (error) {
          console.error('Failed to refresh user:', error);
          // 发生错误时也清除用户信息并跳转到首页
          set({ user: null, token: null });
          window.location.href = '/';
        }
      },
    }),
    {
      name: 'sphere-user-storage',
    }
  )
); 