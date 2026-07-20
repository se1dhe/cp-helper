import React, { useEffect } from 'react';
import { X, ScrollText, MapPin, User, Medal, Lightbulb, ExternalLink } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { getQuestDetails, questWikiUrl, wikiAbsUrl } from '../data/quests';
import { openExternal } from '../utils/openExternal';

// Модалка с прохождением квеста. Данные — src/data/questDetails.json
// (спарсены с l2hub.info/il-ru, русские описания). Если детали не найдены —
// показываем базовую инфу из карточки и предлагаем открыть источник.
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
  const level = quest.lvl || d?.level;
  const npc = d?.startNpc || quest.npc;
  const srcUrl = d?.url ? wikiAbsUrl(d.url) : questWikiUrl(quest.name);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card quest-modal-card fade-in-scale" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>
            <ScrollText size={16} /> {quest.name}
            {level ? <span className="quest-modal-lvl">LVL {level}</span> : null}
          </h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="quest-modal-body">
          {d?.nameRu && <div className="quest-modal-ru">{d.nameRu}</div>}

          {(d?.intro || quest.description) && (
            <p className="quest-modal-intro">{d?.intro || quest.description}</p>
          )}

          {npc && (
            <div className="quest-modal-row"><User size={13} /><span>{npc}</span></div>
          )}
          {d?.location && (
            <div className="quest-modal-row"><MapPin size={13} /><span>{d.location}</span></div>
          )}

          {(d?.rewards?.length || quest.reward) && (
            <div className="quest-modal-section">
              <div className="quest-modal-section-h"><Medal size={13} /> {t('quest.rewards')} <span className="quest-modal-src">Lu4</span></div>
              {d?.rewards?.length ? (
                <ul className="quest-modal-rewards quest-modal-rewards--list">
                  {d.rewards.map((r, i) => <li key={i} className="quest-modal-reward">{r}</li>)}
                </ul>
              ) : (
                <p className="quest-modal-rewards-text">{quest.reward}</p>
              )}
            </div>
          )}

          {d?.tips?.length ? (
            <div className="quest-modal-section">
              <div className="quest-modal-section-h"><Lightbulb size={13} /> {t('quest.tips')}</div>
              <ul className="quest-modal-tips">
                {d.tips.map((tip, i) => <li key={i} className="quest-modal-tip">{tip}</li>)}
              </ul>
            </div>
          ) : null}

          {d?.steps?.length ? (
            <div className="quest-modal-section">
              <div className="quest-modal-section-h"><ScrollText size={13} /> {t('quest.steps')} <span className="quest-modal-src">l2hub</span></div>
              <ol className="quest-modal-steps">
                {d.steps.map((s, i) => (
                  <li key={i} className="quest-modal-step">{s}</li>
                ))}
              </ol>
            </div>
          ) : (
            !d && <p className="quest-modal-nodetails">{t('quest.noDetails')}</p>
          )}
        </div>

        <div className="quest-modal-foot">
          <button className="quest-modal-wiki-btn" onClick={() => openExternal(srcUrl)}>
            <ExternalLink size={14} /> {t('quest.openWiki')}
          </button>
        </div>
      </div>
    </div>
  );
};
