import { api } from "../../../api/client";
import {
  UnreadCountResponse,
  ConversationsResponse,
  MessagesResponse,
  SendMessagePayload,
  SendMessageResponse,
  InitChatPayload,
  InitChatResponse
} from "../types/chat.types";

export const chatService = {
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get("/communications/conversations/unread-count");
    return response.data;
  },

  getConversations: async (tipo?: 'caseta' | 'administrador'): Promise<ConversationsResponse> => {
    const params = tipo ? { tipo } : {};
    const response = await api.get("/communications/conversations", { params });
    return response.data;
  },

  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> => {
    const response = await api.get(`/communications/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },

  sendMessage: async (conversationId: string, payload: SendMessagePayload): Promise<SendMessageResponse> => {
    const response = await api.post(`/communications/conversations/${conversationId}/messages`, payload);
    return response.data;
  },

  initChatWithCaseta: async (payload: InitChatPayload): Promise<InitChatResponse> => {
    const response = await api.post("/communications/resident/caseta", payload);
    return response.data;
  },

  initChatWithAdmin: async (payload: InitChatPayload): Promise<InitChatResponse> => {
    const response = await api.post("/communications/resident/admin", payload);
    return response.data;
  }
};
