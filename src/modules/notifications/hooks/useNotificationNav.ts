import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import type { NotificationActionType, FCMDataPayload } from '../types/notification.types';
import { systemApi } from '../../../api/endpoints/system.api';

// ─────────────────────────────────────────────────────────────────────────────
// Type Guard: valida que el string de FCM sea un NotificationActionType conocido
// ─────────────────────────────────────────────────────────────────────────────
const VALID_ACTION_TYPES: NotificationActionType[] = [
  'ver_comprobante',
  'descargar_comprobante',
  'ver_estado_cuenta',
  'responder_mensaje',
  'ver_cargo',
  'pagar_cargo',
  'ver_visita',
  'ver_evento',
  'ver_paquete',
  'ver_bitacora',
  'ver_publicacion',
  'authorization_created', // Retro-compatibilidad con payloads antiguos del backend
  'authorization_cancelled', // Retro-compatibilidad
];

function isValidActionType(value: string): value is NonNullable<NotificationActionType> {
  return VALID_ACTION_TYPES.includes(value as NotificationActionType);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Limpia IDs que puedan traer comillas dobles (p. ej. '"69b3..."')
// ─────────────────────────────────────────────────────────────────────────────
function sanitizeId(id: any): string | null {
  if (!id) return null;
  return String(id).replace(/['"]+/g, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useNotificationNav
// Responsabilidad: mapear el payload de FCM a una ruta de Expo Router
// ─────────────────────────────────────────────────────────────────────────────
export function useNotificationNav() {
  const router = useRouter();

  const handleNotificationTap = useCallback((data: Record<string, any>) => {
    const payload = data as FCMDataPayload;

    // Si no hay payload, vamos al historial
    if (!payload) {
      router.push('/(tabs)/notifications');
      return;
    }

    // Auto-marcado como leída si la push contiene su propio ID
    const notificationId = payload.notification_id || payload.notificationId;
    if (notificationId) {
      systemApi.markAsRead(notificationId).catch((err) => {
        console.warn('[NotificationNav] Background mark as read failed:', err);
      });
    }

    let actionType = payload.accion_tipo;

    // Si es boletin pero no trae accion_tipo (Backend bug), le asignamos ver_publicacion
    if (!actionType && payload.tipo === 'boletin') {
      actionType = 'ver_publicacion';
    }

    if (!actionType) {
      router.push('/(tabs)/notifications');
      return;
    }

    // Parsear accion_data (viene como JSON string del backend)
    let actionData: Record<string, any> = {};
    try {
      if (payload.accion_data && typeof payload.accion_data === 'string') {
        actionData = JSON.parse(payload.accion_data);
      }
    } catch (e) {
      console.warn('[NotificationNav] Could not parse accion_data JSON', e);
    }

    // Validar que sea un tipo conocido; si no, enviar al historial
    if (!isValidActionType(actionType)) {
      console.warn('[NotificationNav] Unknown action type, redirecting to fallback:', actionType);
      router.push('/(tabs)/notifications');
      return;
    }

    switch (actionType) {
      // ── Pagos ─────────────────────────────────────────────────────────────
      case 'ver_comprobante':
      case 'descargar_comprobante': {
        const rawId = actionData.pago_id || actionData.pagoId || actionData.comprobanteId || actionData.comprobante_id || payload.pago_id || payload.pagoId || payload.comprobanteId || payload.comprobante_id;
        const id = sanitizeId(rawId);
        if (id) {
          router.push({ pathname: '/payments/payment-detail', params: { id } } as any);
        } else {
          router.push('/(tabs)/payments');
        }
        break;
      }

      case 'ver_estado_cuenta':
        router.push('/(tabs)/payments');
        break;

      case 'ver_cargo':
      case 'pagar_cargo': {
        const rawId = actionData.cargo_id || actionData.cargoId || payload.cargo_id || payload.cargoId;
        const id = sanitizeId(rawId);
        if (id) {
          router.push({ pathname: '/payments/charge-detail', params: { id } } as any);
        } else {
          router.push('/(tabs)/payments');
        }
        break;
      }

      // ── Chat ──────────────────────────────────────────────────────────────
      case 'responder_mensaje': {
        const rawId = actionData.conversacion_id || actionData.conversacionId || payload.conversacion_id || payload.conversacionId;
        const id = sanitizeId(rawId);
        if (id) {
          // Navega al ChatDetailScreen en el Root Stack (sin tab bar)
          router.push(`/chat/${id}` as any);
        } else {
          router.push('/(tabs)/chat');
        }
        break;
      }

      // ── Visitas ───────────────────────────────────────────────────────────
      case 'ver_visita':
      case 'authorization_created':
      case 'authorization_cancelled': {
        const rawId = actionData.visita_id || actionData.visitaId || actionData.autorizacionId || actionData.autorizacion_id || payload.visita_id || payload.visitaId || payload.autorizacionId || payload.autorizacion_id || payload.registroId;
        const id = sanitizeId(rawId);
        if (id) {
          router.push(`/visits/${id}` as any);
        } else {
          router.push('/(tabs)/visits');
        }
        break;
      }

      // ── Paquetes ──────────────────────────────────────────────────────────
      case 'ver_paquete': {
        const rawId = actionData.paquete_id || actionData.paqueteId || payload.paquete_id || payload.paqueteId;
        const id = sanitizeId(rawId);
        if (id) {
          router.push(`/home/packages/${id}` as any);
        } else {
          router.push('/home/packages');
        }
        break;
      }

      // ── Eventos ───────────────────────────────────────────────────────────
      case 'ver_evento': {
        const rawId = actionData.evento_id || actionData.eventoId || payload.evento_id || payload.eventoId;
        const id = sanitizeId(rawId);
        if (id) {
          router.push(`/events/${id}` as any);
        } else {
          router.push('/(tabs)/visits'); // ← Esto asumiendo que eventos está en visits, de lo contrario cambiar
        }
        break;
      }

      // ── Bitácora/Incidencias ───────────────────────────────────────────────
      case 'ver_bitacora':
        router.push('/home/incidents');
        break;

      // ── Publicaciones ──────────────────────────────────────────────────────
      case 'ver_publicacion': {
        const rawId = actionData.publicacion_id || actionData.publicacionId || payload.publicacion_id || payload.publicacionId || actionData.boletin_id || actionData.boletinId || payload.boletin_id || payload.boletinId;
        const id = sanitizeId(rawId);
        if (id) {
          router.push(`/home/publications/${id}` as any);
        } else {
          router.push('/(tabs)/home');
        }
        break;
      }

      default:
        router.push('/(tabs)/notifications');
        break;
    }
  }, [router]);

  return { handleNotificationTap };
}
