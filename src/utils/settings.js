// Локальные настройки приложения (на устройство).
const CLOSE_KEY = 'cp-close-action';

// 'ask' — спросить каждый раз | 'tray' — свернуть в трей | 'close' — выйти
export const getCloseAction = () => localStorage.getItem(CLOSE_KEY) || 'ask';
export const setCloseAction = (v) => localStorage.setItem(CLOSE_KEY, v);
