import { create } from "zustand";
import type { Conversation } from "../types/chat.types";

interface ChatState {
  conversations: Conversation[];
  unreadAdminCount: number;
  unreadCasetaCount: number;
  loading: boolean;
  error: string | null;

  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  setUnreadCounts: (admin: number, caseta: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  unreadAdminCount: 0,
  unreadCasetaCount: 0,
  loading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),
  
  updateConversation: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId ? { ...conv, ...updates } : conv
      ),
    })),

  setUnreadCounts: (admin, caseta) =>
    set({ unreadAdminCount: admin, unreadCasetaCount: caseta }),

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}));
