import React, { useEffect, useState } from 'react';
import { X, History, ExternalLink } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { openExternal } from '../utils/openExternal';

const REPO = 'se1dhe/cp-helper';

// Последние релизы приложения (ченжлог) — тянем с GitHub Releases API.
export const ChangelogModal = ({ open, onClose }) => {
  const { t } = useLang();
  const [state, setState] = useState({ loading: true, error: false, releases: [] });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setState({ loading: true, error: false, releases: [] });
    fetch(`https://api.github.com/repos/${REPO}/releases?per_page=10`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('http'))))
      .then(data => { if (!cancelled) setState({ loading: false, error: false, releases: Array.isArray(data) ? data.slice(0, 10) : [] }); })
      .catch(() => { if (!cancelled) setState({ loading: false, error: true, releases: [] }); });
    return () => { cancelled = true; };
  }, [open]);

  if (!open) return null;

  const fmtDate = (s) => { try { return new Date(s).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return ''; } };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card changelog-card fade-in-scale" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3><History size={16} /> {t('changelog.title')}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {state.loading && <div className="changelog-empty">{t('changelog.loading')}</div>}
        {state.error && <div className="changelog-empty">{t('changelog.error')}</div>}
        {!state.loading && !state.error && state.releases.length === 0 && <div className="changelog-empty">{t('changelog.none')}</div>}

        {state.releases.length > 0 && (
          <div className="changelog-list">
            {state.releases.map(r => (
              <div key={r.id} className="changelog-item">
                <div className="changelog-item-head">
                  <span className="changelog-ver">{r.name || r.tag_name}</span>
                  <span className="changelog-date">{fmtDate(r.published_at)}</span>
                </div>
                {r.body && <p className="changelog-body">{r.body.slice(0, 600)}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-sm" onClick={() => openExternal(`https://github.com/${REPO}/releases`)}><ExternalLink size={13} /> {t('changelog.all')}</button>
        </div>
      </div>
    </div>
  );
};
