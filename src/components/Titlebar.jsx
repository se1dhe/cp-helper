import React, { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, Copy, X, Rocket, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { subscribeToServerInfo } from '../services/roadmapService';
import { subscribeToRoster } from '../services/rosterService';
import { getCountdown } from '../utils/countdown';
import { LU4_PHASES, packLevel, getActivePhaseId } from '../data/lu4Roadmap';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Кастомная полоса заголовка (окно frameless, decorations:false).
// Слева бренд, по центру живые чипы, справа свои кнопки управления.
// Вся полоса — зона перетаскивания окна (data-tauri-drag-region).
export const Titlebar = () => {
  const { t } = useLang();
  const { currentUser, isGuest } = useAuth();
  const [maximized, setMaximized] = useState(false);
  const [launchDate, setLaunchDate] = useState('');
  const [roster, setRoster] = useState([]);

  const active = !!currentUser && !isGuest;

  // Данные для чипов тянем только у авторизованного не-гостя (правила Firestore).
  useEffect(() => {
    if (!active) { setLaunchDate(''); setRoster([]); return; }
    const u1 = subscribeToServerInfo((info) => setLaunchDate(info.launchDate || ''));
    const u2 = subscribeToRoster(setRoster);
    return () => { u1(); u2(); };
  }, [active]);

  // Отслеживаем состояние «развёрнуто» для иконки кнопки.
  useEffect(() => {
    if (!isTauri) return;
    const w = getCurrentWindow();
    let unlisten;
    w.isMaximized().then(setMaximized).catch(() => {});
    w.onResized(() => { w.isMaximized().then(setMaximized).catch(() => {}); })
      .then((u) => { unlisten = u; })
      .catch(() => {});
    return () => { if (unlisten) unlisten(); };
  }, []);

  const win = () => getCurrentWindow();
  const minimize = () => win().minimize().catch(() => {});
  const toggleMax = () => win().toggleMaximize().catch(() => {});
  // close() проходит через onCloseRequested в DesktopIntegration — уважает настройку (трей/спросить/выход).
  const close = () => win().close().catch(() => {});

  const cd = active ? getCountdown(launchDate) : null;
  const activeMembers = roster.filter((m) => m.name && m.name !== '—' && m.userId && m.userId !== '__occupied__');
  const phaseId = active ? getActivePhaseId(packLevel(activeMembers), cd ? cd.started : true) : null;
  const phase = phaseId ? LU4_PHASES.find((p) => p.id === phaseId) : null;

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-left" data-tauri-drag-region>
        <img src="/icons/icon.png" alt="" className="titlebar-logo" onError={(e) => { e.target.style.display = 'none'; }} />
        <span className="titlebar-brand">0utLaw</span>
        <span className="titlebar-sub">CP-Helper · UASQUAD</span>
      </div>

      <div className="titlebar-center" data-tauri-drag-region>
        {cd && (
          <span className={`titlebar-chip ${cd.started ? 'titlebar-chip--live' : ''}`}>
            <Rocket size={12} /> {cd.started ? t('roadmap.dayN', { n: cd.dayNumber }) : t('roadmap.daysLeft', { n: cd.days })}
          </span>
        )}
        {phase && (
          <span className="titlebar-chip titlebar-chip--phase">
            <MapIcon size={12} /> {phase.title}
          </span>
        )}
      </div>

      {isTauri && (
        <div className="titlebar-controls">
          <button className="titlebar-btn" onClick={minimize} title={t('win.minimize')} aria-label={t('win.minimize')}>
            <Minus size={15} />
          </button>
          <button className="titlebar-btn" onClick={toggleMax} title={t('win.maximize')} aria-label={t('win.maximize')}>
            {maximized ? <Copy size={12} /> : <Square size={11} />}
          </button>
          <button className="titlebar-btn titlebar-btn--close" onClick={close} title={t('win.close')} aria-label={t('win.close')}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
};
