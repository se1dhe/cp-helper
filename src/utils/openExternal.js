import { invoke } from '@tauri-apps/api/core';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Открыть ссылку в системном браузере (в Tauri — через нативную команду, в вебе — new tab).
export const openExternal = (url) => {
  if (!url) return;
  if (isTauri) {
    invoke('open_url', { url }).catch(() => window.open(url, '_blank'));
  } else {
    window.open(url, '_blank', 'noopener');
  }
};
