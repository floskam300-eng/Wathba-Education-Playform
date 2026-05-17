import { useEffect, useRef } from 'react';
import { messaging, getToken, onMessage } from '../lib/firebase';
import api from '../lib/api';
import toast from 'react-hot-toast';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export function useFCM(enabled) {
  const setupDone = useRef(false);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!enabled || setupDone.current) return;
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('[FCM] Service workers or Notifications not supported');
      return;
    }
    if (!VAPID_KEY) {
      console.warn('[FCM] VITE_FIREBASE_VAPID_KEY not set — push notifications disabled');
      return;
    }

    const setup = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('[FCM] Notification permission denied by user');
          return;
        }

        // Register the service worker first
        await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });

        // Wait for an active service worker before getting token
        const swReg = await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (!token) {
          console.warn('[FCM] No token received — check VAPID key and Firebase Console settings');
          return;
        }

        await api.post('/notifications/fcm-token', { token });
        setupDone.current = true;
        console.log('[FCM] Push notifications enabled successfully');

        // Handle foreground messages (app is open)
        unsubscribeRef.current = onMessage(messaging, (payload) => {
          const title = payload.notification?.title || '';
          const body  = payload.notification?.body  || '';
          const text  = [title, body].filter(Boolean).join(' — ');
          if (text) {
            toast(`🔔 ${text}`, {
              duration: 7000,
              style: { fontFamily: 'inherit', direction: 'rtl' },
            });
          }
        });
      } catch (err) {
        console.error('[FCM] Setup failed:', err.message || err);
      }
    };

    setup();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [enabled]);
}
