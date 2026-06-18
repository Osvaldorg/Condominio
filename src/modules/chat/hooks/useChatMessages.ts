import { useState, useCallback, useRef, useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { useChat } from './useChat';
import { Message, Conversation } from '../types/chat.types';

export function useChatMessages(conversationId: string | undefined) {
  const { fetchMessages, sendMessage, fetchConversations } = useChat();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  
  // Estados de carga de pantalla principal y paginación
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);

  // Estados del cursor de paginación
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Usamos un Ref para bloquear llamadas de paginación dobles
  const fetchLock = useRef(false);

  /**
   * Carga mensajes de la API.
   * @param pageNumber Página a solicitar.
   * @param isPolling Indica si es una llamada silenciosa del Cronómetro (solo refresca datos nuevos).
   */
  const loadMessages = useCallback(async (pageNumber = 1, isPolling = false) => {
    if (!conversationId || fetchLock.current) return;
    
    fetchLock.current = true;

    // Solo activamos banderas visuales si NO es polling
    if (!isPolling) {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);
    }

    try {
      const res = await fetchMessages(conversationId, pageNumber, false);
      
      if (res && res.success) {
        const newMessages = res.mensajes || [];
        setConversation(res.conversacion);

        if (isPolling) {
          // ==========================================
          // POLÍTICA DE POLLING (Silenciosa)
          // ==========================================
          // El polling siempre pide la page=1 (los últimos 50 mensajes).
          // Debemos fusionarlos con los mensajes que el usuario ya tiene cargados
          // en memoria (incluso si está leyendo la página 10), priorizando los nuevos
          // sin borrar los viejos ni causar saltos visuales.
          
          setMessages(prev => {
            const newMsgIds = new Set(newMessages.map(m => m._id));
            // Filtramos los mensajes previos para quitar aquellos que vienen actualizados en la nueva petición
            const filteredPrev = prev.filter(m => !newMsgIds.has(m._id));
            
            // Unimos los nuevos (al inicio de la lista invertida) con los viejos restantes
            const merged = [...newMessages, ...filteredPrev];
            
            // Ordenamos descendentemente (el FlatList Inverted los pone abajo)
            return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          });

        } else {
          // ==========================================
          // POLÍTICA DE PAGINACIÓN (User Scroll / Init)
          // ==========================================
          setMessages(prev => {
            if (pageNumber === 1) return newMessages;

            // Anexamos de forma segura sin duplicar
            const prevIds = new Set(prev.map(m => m._id));
            const uniqueNewMessages = newMessages.filter(m => !prevIds.has(m._id));
            
            const merged = [...prev, ...uniqueNewMessages];
            return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          });

          setPage(pageNumber);
          
          if (res.pagination) {
            setHasMore(pageNumber < res.pagination.totalPages);
          } else {
            setHasMore(newMessages.length >= 50);
          }
        }

        // Si es carga inicial, actualizamos contadores silenciosamente
        if (pageNumber === 1 && !isPolling) {
          fetchConversations(undefined, false);
        }
      }
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
    } finally {
      if (!isPolling) {
        setLoading(false);
        setLoadingMore(false);
      }
      fetchLock.current = false;
    }
  }, [conversationId, fetchMessages, fetchConversations]);

  /**
   * Disparador para Scroll Infinito en el FlatList
   */
  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore && !fetchLock.current) {
      loadMessages(page + 1, false);
    }
  }, [loading, loadingMore, hasMore, page, loadMessages]);

  /**
   * Envia un mensaje nuevo e inyecta optimistamente en la lista
   */
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !conversationId || sending) return false;
    
    setSending(true);
    try {
      const res = await sendMessage(conversationId, { mensaje: text, tipo: 'texto' });
      if (res.success && res.mensaje) {
        setMessages(prev => {
          // Evitar inserción doble si el polling fue más rápido
          if (prev.some(m => m._id === res.mensaje._id)) return prev;
          return [res.mensaje, ...prev];
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setSending(false);
    }
  }, [conversationId, sending, sendMessage]);

  // Hook Automático de Ciclo de Vida
  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval>;

    // Retrasamos la carga pesada hasta que la animación de navegación (Push) haya concluido
    // Esto previene que el JS Thread sature los frames de transición y provoque lag visual.
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      if (!mounted) return;

      setLoading(true);
      setPage(1);
      setHasMore(true);
      setMessages([]);
      
      // Carga inicial
      loadMessages(1, false);
      
      // Polling cada 5 segundos
      intervalId = setInterval(() => {
        loadMessages(1, true); // Polling silencioso
      }, 5000);
    });

    return () => {
      mounted = false;
      interactionTask.cancel();
      if (intervalId) clearInterval(intervalId);
    };
  }, [conversationId, loadMessages]);

  return {
    messages,
    conversation,
    loading,
    loadingMore,
    sending,
    hasMore,
    handleLoadMore,
    handleSendMessage,
  };
}
