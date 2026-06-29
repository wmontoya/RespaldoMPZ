import { ParkingResponse } from "@/types/response";
import { urlBase64ToUint8Array } from "@/utils/converter";
import CryptoJS from 'crypto-js';

export const usePushNotifications = () => {
  const subscribeToPushNotifications = async (): Promise<ParkingResponse> => {
    try {
      if (!('serviceWorker' in navigator)) throw new Error('Este sitio no es compatible con este navegador. Instale la aplicación e inténtelo nuevamente.');

      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) throw new Error('Las notificaciones no están disponibles en este navegador. Instale la aplicación e inténtelo nuevamente.');

      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription = existingSubscription || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string),
      })
      return { success: true, data: CryptoJS.AES.encrypt(JSON.stringify(subscription), process.env.NEXT_PUBLIC_ENCRYPTION_KEY!).toString(), message: "" };
    } catch (error: any) {
      if (error.message.includes("permission denied")) {
        return { success: true, message: "incognito" };
      }
      return { success: false, message: error.message };
    }
  };

  return { subscribeToPushNotifications }; 
};
