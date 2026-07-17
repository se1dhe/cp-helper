// Локальные настройки приложения (на устройство).
const CLOSE_KEY = 'cp-close-action';

// 'ask' — спросить каждый раз | 'tray' — свернуть в трей | 'close' — выйти
export const getCloseAction = () => localStorage.getItem(CLOSE_KEY) || 'ask';
export const setCloseAction = (v) => localStorage.setItem(CLOSE_KEY, v);

// Тема: 'dark' | 'light'
const THEME_KEY = 'cp-theme';
export const getTheme = () => localStorage.getItem(THEME_KEY) || 'dark';
export const applyTheme = (v) => { document.documentElement.dataset.theme = v; };
export const setTheme = (v) => { localStorage.setItem(THEME_KEY, v); applyTheme(v); };
