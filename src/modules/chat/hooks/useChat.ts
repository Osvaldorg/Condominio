import { useCallback, useState } from "react";
import { chatService } from "../services/chat.service";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "../../auth/store/auth.store";
import type { Message, SendMessagePayload, InitChatPayload } from "../types/chat.types";

export function useChat() {
  const conversations = useChatStore(s => s.conversations);
  const unreadAdminCount = useChatStore(s => s.unreadAdminCount);
  const unreadCasetaCount = useChatStore(s => s.unreadCasetaCount);
  const storeLoading = useChatStore(s => s.loading);
  const storeError = useChatStore(s => s.error);

  const setConversations = useChatStore(s => s.setConversations);
  const setUnreadCounts = useChatStore(s => s.setUnreadCounts);
  const setStoreLoading = useChatStore(s => s.setLoading);
  const setStoreError = useChatStore(s => s.setError);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCounts = useCallback(async () => {
    // No intentar si no hay token (evita ráfagas de 401 al cerrar sesión)
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const res = await chatService.getUnreadCount();
      if (res.success) {
        setUnreadCounts(res.administrador, res.caseta);
      }
    } catch (e: any) {
      // Solo loguear si no es un 401 (que ya manejamos globalmente)
      if (e?.response?.status !== 401) {
        console.warn("Failed to fetch unread counts", e?.message || e);
      }
    }
  }, [setUnreadCounts]);

  const fetchConversations = useCallback(async (tipo?: 'caseta' | 'administrador', showLoading = true) => {
    if (showLoading) setStoreLoading(true);
    if (showLoading) setStoreError(null);
    try {
      const res = await chatService.getConversations(tipo);
      if (res.success) {
        setConversations(res.conversaciones);
      }
    } catch (e: any) {
      if (showLoading) setStoreError(e?.message ?? "Error al cargar conversaciones");
    } finally {
      if (showLoading) setStoreLoading(false);
    }
  }, [setConversations, setStoreLoading, setStoreError]);

  const fetchMessages = useCallback(async (conversationId: string, page = 1, showLoading = true) => {
    if (showLoading) setLoading(true);
    if (showLoading) setError(null);
    try {
      const res = await chatService.getMessages(conversationId, page);
      return res;
    } catch (e: any) {
      if (showLoading) setError(e?.message ?? "Error al cargar mensajes");
      return null;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, payload: SendMessagePayload) => {
    try {
      const res = await chatService.sendMessage(conversationId, payload);
      fetchConversations(undefined, false);
      return res;
    } catch (e: any) {
      throw new Error(e?.message ?? "Error al enviar mensaje");
    }
  }, [fetchConversations]);

  const initChatCaseta = useCallback(async (payload: InitChatPayload) => {
    try {
      const res = await chatService.initChatWithCaseta(payload);
      fetchConversations(undefined, false);
      return res;
    } catch (e: any) {
      throw new Error(e?.message ?? "Error al iniciar chat con caseta");
    }
  }, [fetchConversations]);

  const initChatAdmin = useCallback(async (payload: InitChatPayload) => {
    try {
      const res = await chatService.initChatWithAdmin(payload);
      fetchConversations(undefined, false);
      return res;
    } catch (e: any) {
      throw new Error(e?.message ?? "Error al iniciar chat con administrador");
    }
  }, [fetchConversations]);

  return {
    conversations,
    unreadAdminCount,
    unreadCasetaCount,
    storeLoading,
    storeError,
    loading,
    error,
    fetchUnreadCounts,
    fetchConversations,
    fetchMessages,
    sendMessage,
    initChatCaseta,
    initChatAdmin,
  };
}
