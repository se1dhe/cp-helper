import React from 'react';
import { X, History } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import CHANGELOG from '../data/changelog.json';

// Ченжлог приложения — встроен в билд (пополняется release.sh при релизе).
// Работает офлайн и не зависит от доступности репозитория.
export const ChangelogModal = ({ open, onClose }) => {
  const { t } = useLang();
  if (!open) return null;

  const fmtDate = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
    return m ? `${m[3]}.${m[2]}.${m[1]}` : (s || '');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card changelog-card fade-in-scale" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3><History size={16} /> {t('changelog.title')}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {CHANGELOG.length === 0 ? (
          <div className="changelog-empty">{t('changelog.none')}</div>
        ) : (
          <div className="changelog-list">
            {CHANGELOG.map((r, i) => (
              <div key={`${r.version}-${i}`} className="changelog-item">
                <div className="changelog-item-head">
                  <span className="changelog-ver">CP-Helper v{r.version}</span>
                  <span className="changelog-date">{fmtDate(r.date)}</span>
                </div>
                {r.text && <p className="changelog-body">{r.text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
