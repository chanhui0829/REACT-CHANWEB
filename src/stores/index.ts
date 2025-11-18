import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import supabase from '@/lib/supabase';

// ------------------------------
// 🔹 User 타입 정의
// ------------------------------
export interface User {
  id: string;
  email: string;
  role: string;
}

// ------------------------------
// 🔹 AuthStore 인터페이스
// ------------------------------
interface AuthStore {
  user: User | null;
  setUser: (newUser: User | null) => void;
  reset: () => Promise<void>;
}

// ------------------------------
// 🔥 최적화된 Zustand AuthStore
// ------------------------------
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,

      // 🔹 불필요한 리렌더 줄이기 위해 newUser 그대로 적용
      setUser: (newUser: User | null) => set({ user: newUser }),

      // 🔥 Supabase + Zustand 완전 초기화 (persist와 충돌 없음)
      reset: async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          console.warn('Supabase signOut 실패(네트워크 문제 등)');
        }

        // 👉 상태 초기화 (persist 미들웨어가 자동으로 localStorage 업데이트 처리함)
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',

      // 🔥 user만 저장해서 성능 최적화
      partialize: (state) => ({ user: state.user }),
    }
  )
);
