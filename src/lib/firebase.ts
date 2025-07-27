import { getApp, getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: 'AIzaSyAobb3hUqqNxNPT5jRvnhTVJZsCD_y46Ss',
    authDomain: 'system-kepolisian.firebaseapp.com',
    projectId: 'system-kepolisian',
    storageBucket: 'system-kepolisian.firebasestorage.app',
    messagingSenderId: '393672829333',
    appId: '1:393672829333:web:d4ac305b7f74d8bfff6e9c',
    measurementId: 'G-B9HPX37TBJ',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
    if (!messaging) {
        console.log('Messaging is not supported in this environment (e.g., server-side).');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            const token = await getToken(messaging, {
                vapidKey: 'BFroGg8ta_44f0CmIOdsdU630fMnFrLKo00xdfWhw8msOokCs4KeCTU2jh-KCA1FPgyx5roAph2QFWL_ZKVfZv0',
            });
            return token;
        } else {
            console.log('Unable to get permission to notify.');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while requesting permission:', error);
        return null;
    }
};
