import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  sessionId:  null,
  messages:   [],
  isLoading:  false,
  language:   'en',   // 'en' | 'kn'
  sessions:   [],     // list of past session summaries

  setSessionId: (id) => set({ sessionId: id }),
  setLoading:   (v)  => set({ isLoading: v }),
  setLanguage:  (l)  => set({ language: l }),

  addMessage: (msg) => set(state => ({
    messages: [...state.messages, { ...msg, id: Date.now() + Math.random() }]
  })),

  updateLastMessage: (patch) => set(state => {
    const msgs = [...state.messages]
    if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...patch }
    return { messages: msgs }
  }),

  clearSession: () => set({
    sessionId: null,
    messages:  [],
    isLoading: false
  }),

  addSession: (session) => set(state => ({
    sessions: [session, ...state.sessions].slice(0, 20)
  })),
}))
