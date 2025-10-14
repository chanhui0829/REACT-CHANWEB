import { create } from "zustand";
import { persist } from "zustand/middleware";
import supabase from "@/lib/supabase";

// const useStore = create((set) => ({
//     bears: 0,
//     increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
//     removeAllBears: () => set({ bears: 0 }),
//     updateBears: (newBears) => set({ bears: newBears }),
// }));

// Zustand에서 persist 기능은 상태(state)를 브라우저의 스토리지(LocalStorage나 SesstionStorage 등)에 저장(persist)해서
// 페이지를 새로고침 하거나 브라우저를 닫았다가 다시 열어도 상태를 유지할 수 있게 해주는 기능입니다.

// Zustand는 리액트에서 사용되는 간단한 글로벌 상태 관리 라이브러리 입니다.
// Persist 미들웨어를 사용하면 Zustand store의 데이터를 브라우저 스토리지에 저장할 수 있습니다.
// 이를 통해, 상태를 유지(persist) 할 수 있어, 예를 들어 로그인 상태, 장바구니, 테마 설정 등 페이지를 새로고침해도 유지되게 할 수 있습니다.

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  setUser: (newUser: User | null) => void;
  reset: () => Promise<void>;
}

// export const useAuthStore = create<AuthStore>((set) => ({
//     id: "",
//     email: "",
//     role: "",

//     setId: (newId) => set({ id: newId }),
//     setEmail: (newEmail) => set({ email: newEmail }),
//     setRole: (newRole) => set({ role: newRole }),

//     reset: () => set({ id: "", email: "", role: "" }),
// }));

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (newUser: User | null) => set({ user: newUser }),

      //로그아웃 (상태 + supabase 세션 모두 제거)
      reset: async () => {
        await supabase.auth.signOut();

        set({ user: null }); //Zustand 상태 초기화
        localStorage.removeItem("auth-storage");
      },
    }),
    { name: "auth-storage", partialize: (state) => ({ user: state.user }) } //user만 저장
  )
);
