import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';

/**
 * Hook envoltorio para Expo Router que previene llamadas consecutivas idénticas
 * en una ventana de tiempo corta (Anti Double-Tap).
 * Útil para botones que el usuario puede golpear varias veces accidentalmente 
 * antes de que inicie la transición.
 */
export function useSafeRouter() {
  const router = useRouter();
  const lastPushTimestamp = useRef(0);
  const lastPushHref = useRef<string | null>(null);

  const safePush = useCallback((href: any) => {
    const now = Date.now();
    const hrefStr = href.toString();
    const isSameHref = lastPushHref.current === hrefStr;
    const isRecent = now - lastPushTimestamp.current < 600;

    if (isSameHref && isRecent) {
      // Bloquear navegación basura (bounce)
      return;
    }

    lastPushTimestamp.current = now;
    lastPushHref.current = hrefStr;
    router.push(href);
  }, [router]);

  return {
    ...router,
    push: safePush,
  };
}
