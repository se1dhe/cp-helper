import React, { useState } from 'react';
import { X, HelpCircle, Minus, LogOut, Moon, Sun } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { getCloseAction, setCloseAction, getTheme, setTheme } from '../utils/settings';

export const SettingsModal = ({ open, onClose }) => {
  const { t } = useLang();
  const [action, setAction] = useState(getCloseAction());
  const [theme, setThemeState] = useState(getTheme());

  if (!open) return null;

  const choose = (v) => { setAction(v); setCloseAction(v); };
  const chooseTheme = (v) => { setThemeState(v); setTheme(v); };

  const options = [
    { v: 'ask', icon: HelpCircle, label: t('settings.closeAsk') },
    { v: 'tray', icon: Minus, label: t('settings.closeTray') },
    { v: 'close', icon: LogOut, label: t('settings.closeQuit') },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card fade-in-scale" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{t('settings.title')}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="settings-group">
          <span className="settings-label">{t('settings.closeAction')}</span>
          <div className="settings-options">
            {options.map(o => (
              <button
                key={o.v}
                className={`settings-option ${action === o.v ? 'settings-option--active' : ''}`}
                onClick={() => choose(o.v)}
              >
                <o.icon size={16} />
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-group" style={{ marginTop: '1rem' }}>
          <span className="settings-label">{t('settings.theme')}</span>
          <div className="settings-options">
            {[{ v: 'dark', icon: Moon, label: t('settings.themeDark') }, { v: 'light', icon: Sun, label: t('settings.themeLight') }].map(o => (
              <button key={o.v} className={`settings-option ${theme === o.v ? 'settings-option--active' : ''}`} onClick={() => chooseTheme(o.v)}>
                <o.icon size={16} /><span>{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary btn-sm" onClick={onClose}>{t('settings.done')}</button>
        </div>
      </div>
    </div>
  );
};
