import { IRealtor, IUser } from "@/types/userTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  user: IUser | null;
  realtor: IRealtor | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: IUser) => void;
  setRealtor: (realtor: IRealtor | null) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<IUser>) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      realtor: null,
      isAuthenticated: false,
      hasHydrated: false,
      setUser: (user: IUser) => set({ user, isAuthenticated: true }),
      setRealtor: (realtor: IRealtor | null) => set({ realtor }),
      logout: () => set({ user: null, realtor: null }),
      clearUser: () =>
        set({ user: null, realtor: null, isAuthenticated: false }),
      updateUser: (updates: Partial<IUser>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        realtor: state.realtor,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
