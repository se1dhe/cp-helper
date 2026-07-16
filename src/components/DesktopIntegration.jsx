import { useEffect, useRef, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { check } from '@tauri-apps/plugin-updater';
import { ask } from '@tauri-apps/plugin-dialog';
import { RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { subscribeToNews } from '../services/newsService';
import { getCloseAction } from '../utils/settings';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Нативная интеграция десктопа: свернуть в трей по крестику, брендовое авто-обновление,
// уведомления о новых новостях. Работает только внутри Tauri (в браузере — no-op).
export const DesktopIntegration = () => {
  const { t } = useLang();
  const seenNewsRef = useRef(null);
  const updateRef = useRef(null);
  // status: 'idle' | 'available' | 'downloading' | 'installing' | 'error'
  const [upd, setUpd] = useState({ status: 'idle', version: '', progress: 0, indeterminate: false });

  // Перехват закрытия окна: свернуть в трей или выйти.
  useEffect(() => {
    if (!isTauri) return;
    let unlisten;
    (async () => {
      try {
        const appWindow = getCurrentWindow();
        unlisten = await appWindow.onCloseRequested(async (event) => {
          event.preventDefault();
          const action = getCloseAction(); // читаем актуальную настройку в момент закрытия
          if (action === 'tray') { await appWindow.hide(); return; }
          if (action === 'close') { await invoke('quit_app'); return; }
          const minimize = await ask(t('tray.minimizeQuestion'), {
            title: t('tray.minimizeTitle'),
            kind: 'warning',
          });
          if (minimize) await appWindow.hide();
          else await invoke('quit_app');
        });
      } catch (e) {
        console.error('close handler error:', e);
      }
    })();
    return () => { if (unlisten) unlisten(); };
  }, [t]);

  // Проверка обновления при запуске — показываем брендовое окно, НЕ ставим молча.
  useEffect(() => {
    if (!isTauri) return;
    (async () => {
      try {
        const update = await check();
        if (update?.available) {
          updateRef.current = update;
          setUpd({ status: 'available', version: update.version, progress: 0, indeterminate: false });
        }
      } catch (e) {
        console.error('update check failed:', e);
      }
    })();
  }, []);

  const runUpdate = async () => {
    const update = updateRef.current;
    if (!update) return;
    setUpd((s) => ({ ...s, status: 'downloading', progress: 0, indeterminate: false }));
    let total = 0;
    let done = 0;
    try {
      await update.downloadAndInstall((e) => {
        if (e.event === 'Started') {
          total = e.data?.contentLength || 0;
          setUpd((s) => ({ ...s, indeterminate: !total }));
        } else if (e.event === 'Progress') {
          done += e.data?.chunkLength || 0;
          if (total) setUpd((s) => ({ ...s, progress: Math.min(100, Math.round((done / total) * 100)) }));
        } else if (e.event === 'Finished') {
          setUpd((s) => ({ ...s, progress: 100, indeterminate: false }));
        }
      });
      setUpd((s) => ({ ...s, status: 'installing' }));
      await invoke('restart_app');
    } catch (err) {
      console.error('update failed:', err);
      setUpd((s) => ({ ...s, status: 'error' }));
    }
  };

  const dismissUpdate = () => setUpd({ status: 'idle', version: '', progress: 0, indeterminate: false });

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

  if (!isTauri || upd.status === 'idle') return null;

  return (
    <div className="update-overlay">
      <div className="update-card fade-in-scale">
        <div className="update-logo">
          <img src="/icons/icon.png" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>

        {upd.status === 'available' && (
          <>
            <h3 className="update-title">{t('update.newVersion', { version: upd.version })}</h3>
            <p className="update-sub">{t('update.newVersionSub')}</p>
            <div className="update-actions">
              <button className="btn btn-sm" onClick={dismissUpdate}>{t('update.later')}</button>
              <button className="btn btn-primary" onClick={runUpdate}>
                <Download size={16} /> {t('update.updateNow')}
              </button>
            </div>
          </>
        )}

        {upd.status === 'downloading' && (
          <>
            <h3 className="update-title">{t('update.downloading')}</h3>
            <div className={`update-bar ${upd.indeterminate ? 'update-bar--indeterminate' : ''}`}>
              <div className="update-bar-fill" style={upd.indeterminate ? undefined : { width: `${upd.progress}%` }} />
            </div>
            {!upd.indeterminate && <span className="update-pct">{upd.progress}%</span>}
          </>
        )}

        {upd.status === 'installing' && (
          <>
            <div className="update-spinner"><RefreshCw size={30} /></div>
            <h3 className="update-title">{t('update.installing')}</h3>
            <p className="update-sub">{t('update.restarting')}</p>
          </>
        )}

        {upd.status === 'error' && (
          <>
            <div className="update-error-icon"><AlertTriangle size={30} /></div>
            <h3 className="update-title">{t('update.failed')}</h3>
            <div className="update-actions">
              <button className="btn btn-sm" onClick={dismissUpdate}>{t('update.later')}</button>
              <button className="btn btn-primary" onClick={runUpdate}>
                <RefreshCw size={16} /> {t('update.retry')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
