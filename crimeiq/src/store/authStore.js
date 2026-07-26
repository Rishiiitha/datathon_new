import { create } from 'zustand'

const STORAGE_KEY = 'crimeiq_auth'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export const useAuthStore = create((set) => {
  const saved = loadFromStorage()
  return {
    user:            saved?.user  || null,
    token:           saved?.token || null,
    role:            saved?.role  || null,
    isAuthenticated: !!saved?.token,

    setUser: (user, token, role) => {
      const state = { user, token, role, isAuthenticated: true }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token, role }))
      set(state)
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY)
      set({ user: null, token: null, role: null, isAuthenticated: false })
    }
  }
})
