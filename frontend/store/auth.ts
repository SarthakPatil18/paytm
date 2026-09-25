"use client";
import { create } from "zustand";
import type { User } from "@/types";
import { storeAuth, clearAuth, getStoredUser } from "@/lib/utils";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user, token) => {
    storeAuth(token, user);
    set({ user });
  },

  logout: () => {
    clearAuth();
    set({ user: null });
    window.location.href = "/";
  },

  initialize: () => {
    const stored = getStoredUser();
    set({ user: stored as User | null, isLoading: false });
  },
}));
