import { useEffect, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { check } from '@tauri-apps/plugin-updater';
import { ask } from '@tauri-apps/plugin-dialog';
import { useLang } from '../context/LanguageContext';
import { subscribeToNews } from '../services/newsService';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Нативная интеграция десктопа: свернуть в трей по крестику, авто-обновление,
// уведомления о новых новостях. Работает только внутри Tauri (в браузере — no-op).
export const DesktopIntegration = () => {
  const { t } = useLang();
  const seenNewsRef = useRef(null);

  // Перехват закрытия окна: спрашиваем «свернуть в трей или выйти».
  useEffect(() => {
    if (!isTauri) return;
    let unlisten;
    (async () => {
      try {
        const appWindow = getCurrentWindow();
        unlisten = await appWindow.onCloseRequested(async (event) => {
          event.preventDefault();
          const minimize = await ask(t('tray.minimizeQuestion'), {
            title: t('tray.minimizeTitle'),
            kind: 'warning',
          });
          if (minimize) {
            await appWindow.hide();
          } else {
            await invoke('quit_app');
          }
        });
      } catch (e) {
        console.error('close handler error:', e);
      }
    })();
    return () => { if (unlisten) unlisten(); };
  }, [t]);

  // Авто-обновление при запуске: скачать, установить, предложить перезапуск.
  useEffect(() => {
    if (!isTauri) return;
    (async () => {
      try {
        const update = await check();
        if (update?.available) {
          await update.downloadAndInstall();
          const restart = await ask(t('update.restart', { version: update.version }), {
            title: t('update.restartTitle'),
            kind: 'info',
          });
          if (restart) await invoke('restart_app');
        }
      } catch (e) {
        console.error('update check failed:', e);
      }
    })();
  }, [t]);

  // Уведомления о новых новостях, когда окно не в фокусе.
  useEffect(() => {
    if (!isTauri) return;
    const unsub = subscribeToNews((list) => {
      if (seenNewsRef.current === null) {
        seenNewsRef.current = new Set(list.map((n) => n.id));
        return;
      }
      const fresh = list.filter((n) => !seenNewsRef.current.has(n.id));
      fresh.forEach((n) => {
        seenNewsRef.current.add(n.id);
        if (!document.hasFocus()) {
          invoke('notify', {
            title: n.title || t('news.title'),
            body: (n.body || '').slice(0, 140),
          }).catch(() => {});
        }
      });
    });
    return () => unsub();
  }, [t]);

  return null;
};
