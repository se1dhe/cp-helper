import React, { useEffect } from 'react';
import { X, ScrollText, MapPin, Medal, ExternalLink } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { getQuestDetails, questWikiUrl, wikiAbsUrl } from '../data/quests';
import { openExternal } from '../utils/openExternal';

// Модалка с полным прохождением квеста (данные — src/data/questDetails.json,
// спарсены с masterwork.wiki). Если детали не найдены — показываем базовую
// инфу из карточки и предлагаем открыть вики.
export const QuestModal = ({ quest, onClose }) => {
  const { t } = useLang();

  useEffect(() => {
    if (!quest) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [quest, onClose]);

  if (!quest) return null;

  const d = getQuestDetails(quest.name);
  const level = d?.level || quest.lvl;
  const npc = d?.startNpc?.name || quest.npc;
  const wikiHref = d?.url ? wikiAbsUrl(d.url) : questWikiUrl(quest.name);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card quest-modal-card fade-in-scale" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3><ScrollText size={16} /> {quest.name}{level ? <span className="quest-modal-lvl">LVL {level}</span> : null}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="quest-modal-body">
          {(d?.intro || quest.description) && (
            <p className="quest-modal-intro">{d?.intro || quest.description}</p>
          )}

          {npc && (
            <div className="quest-modal-row"><MapPin size={13} /><span>{npc}</span></div>
          )}

          {(d?.rewards?.length || quest.reward) && (
            <div className="quest-modal-section">
              <div className="quest-modal-section-h"><Medal size={13} /> {t('quest.rewards')}</div>
              {d?.rewards?.length ? (
                <ul className="quest-modal-rewards">
                  {d.rewards.map((r, i) => (
                    <li key={i}>
                      <button className="quest-modal-link" onClick={() => openExternal(wikiAbsUrl(r.href))}>{r.name}</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="quest-modal-rewards-text">{quest.reward}</p>
              )}
            </div>
          )}

          {d?.steps?.length ? (
            <div className="quest-modal-section">
              <div className="quest-modal-section-h"><ScrollText size={13} /> {t('quest.steps')}</div>
              <ol className="quest-modal-steps">
                {d.steps.map((s, i) => (
                  <li key={i} className="quest-modal-step">
                    <span className="quest-modal-step-title">{s.title}</span>
                    <span className="quest-modal-step-text">{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            !d && <p className="quest-modal-nodetails">{t('quest.noDetails')}</p>
          )}
        </div>

        <div className="quest-modal-foot">
          <button className="quest-modal-wiki-btn" onClick={() => openExternal(wikiHref)}>
            <ExternalLink size={14} /> {t('quest.openWiki')}
          </button>
        </div>
      </div>
    </div>
  );
};
