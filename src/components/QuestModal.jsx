import React, { useEffect, useState } from 'react';
import { X, ScrollText, MapPin, User, Medal, Lightbulb, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { getQuestDetails, questWikiUrl, wikiAbsUrl, itemIconUrl } from '../data/quests';
import { openExternal } from '../utils/openExternal';

// Сворачиваемая секция модалки: клик по заголовку раскрывает/скрывает содержимое.
const Section = ({ icon, title, extra, open, onToggle, children }) => (
  <div className="quest-modal-section">
    <button type="button" className="quest-modal-section-h" onClick={onToggle}>
      {icon} <span>{title}</span> {extra}
      <span className="quest-modal-chev">{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
    </button>
    {open && children}
  </div>
);

// Модалка с прохождением квеста. Данные — src/data/questDetails.json
// (описания/прохождение с l2hub.info, награды из данных Lu4, иконки — masterwork).
export const QuestModal = ({ quest, onClose }) => {
  const { t } = useLang();
  const [open, setOpen] = useState({ rewards: true, tips: true, steps: true });

  useEffect(() => {
    if (!quest) return undefined;
    setOpen({ rewards: true, tips: true, steps: true });
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [quest, onClose]);

  if (!quest) return null;

  const d = getQuestDetails(quest.name);
  const level = quest.lvl || d?.level;
  const npc = d?.startNpc || quest.npc;
  const srcUrl = d?.url ? wikiAbsUrl(d.url) : questWikiUrl(quest.name);
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

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

          <div className="quest-modal-meta">
            {npc && <div className="quest-modal-row"><User size={13} /><span>{npc}</span></div>}
            {d?.location && <div className="quest-modal-row"><MapPin size={13} /><span>{d.location}</span></div>}
          </div>

          {(d?.rewards?.length || quest.reward) && (
            <Section
              icon={<Medal size={13} />} title={t('quest.rewards')} open={open.rewards} onToggle={() => toggle('rewards')}
              extra={<><span className="quest-modal-src">Lu4</span>{d?.lu4Changes && <span className="quest-modal-changes">· {d.lu4Changes}</span>}</>}
            >
              {d?.rewards?.length ? (
                <div className="quest-modal-rewards">
                  {d.rewards.map((r, i) => r.t ? (
                    <div key={i} className="quest-modal-reward-note">{r.t}</div>
                  ) : (
                    <div key={i} className="quest-modal-reward-item">
                      {r.ic
                        ? <img className="quest-modal-reward-ic" src={itemIconUrl(r.ic)} alt="" loading="lazy" />
                        : <span className="quest-modal-reward-ic quest-modal-reward-ic--ph" />}
                      <span className="quest-modal-reward-name">{r.n}</span>
                      {r.g && r.g !== 'NG' && <span className="quest-modal-reward-grade">{r.g}</span>}
                      {r.q && <span className="quest-modal-reward-qty">{r.q}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="quest-modal-rewards-text">{quest.reward}</p>
              )}
            </Section>
          )}

          {d?.tips?.length ? (
            <Section icon={<Lightbulb size={13} />} title={t('quest.tips')} open={open.tips} onToggle={() => toggle('tips')}>
              <ul className="quest-modal-tips">
                {d.tips.map((tip, i) => <li key={i} className="quest-modal-tip">{tip}</li>)}
              </ul>
            </Section>
          ) : null}

          {d?.steps?.length ? (
            <Section
              icon={<ScrollText size={13} />} title={t('quest.steps')} open={open.steps} onToggle={() => toggle('steps')}
              extra={<span className="quest-modal-src">l2hub</span>}
            >
              <ol className="quest-modal-steps">
                {d.steps.map((s, i) => <li key={i} className="quest-modal-step">{s}</li>)}
              </ol>
            </Section>
          ) : (!d && <p className="quest-modal-nodetails">{t('quest.noDetails')}</p>)}
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
