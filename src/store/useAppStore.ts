import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'dark' | 'light'

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem('trueflow-theme') === 'light' ? 'light' : 'dark'
}

type AppState = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  userTags: string[]
  addUserTag: (tag: string) => void
  removeUserTag: (tag: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      theme: readStoredTheme(),
      setTheme: (mode) => {
        localStorage.setItem('trueflow-theme', mode)
        document.documentElement.classList.toggle('dark', mode === 'dark')
        set({ theme: mode })
      },
      userTags: [],
      addUserTag: (tag) => {
        const t = tag.trim()
        if (!t) return
        set((s) =>
          s.userTags.includes(t) ? s : { userTags: [...s.userTags, t] },
        )
      },
      removeUserTag: (tag) =>
        set((s) => ({ userTags: s.userTags.filter((x) => x !== tag) })),
    }),
    {
      name: 'trueflow-app',
      partialize: (state) => ({ userTags: state.userTags }),
    },
  ),
)
