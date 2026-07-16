import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Map as MapIcon, Rocket, CalendarDays, ChevronDown, ChevronRight,
  CheckCircle2, Circle, Send, Target, MapPin, Sun, Moon, ScrollText,
  Shield, Swords, Lightbulb, Users, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import {
  subscribeToRoadmapProgress, toggleRoadmapProgress,
  subscribeToServerInfo, setLaunchDate,
} from '../services/roadmapService';
import { subscribeToRoster } from '../services/rosterService';
import { addTask } from '../services/taskService';
import { getCountdown } from '../utils/countdown';
import { LU4_PHASES, LU4_MECHANICS, LU4_CHARACTERS, LU4_TENTH, allTaskIds, packLevel, getActivePhaseId } from '../data/lu4Roadmap';

const EXPANDED_KEY = 'roadmapExpanded';

export const Roadmap = () => {
  const { isPL, isOfficer, isGuest } = useAuth();
  const { t } = useLang();
  const [progress, setProgress] = useState({});
  const [launchDate, setLaunchDateState] = useState('');
  const [roster, setRoster] = useState([]);
  const [expanded, setExpanded] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(EXPANDED_KEY) || '[]')); } catch { return new Set(); }
  });
  const [assign, setAssign] = useState(null); // { text, tag, target }

  useEffect(() => {
    const unsub = subscribeToRoadmapProgress(setProgress);
    const unsubServer = subscribeToServerInfo((info) => setLaunchDateState(info.launchDate || ''));
    const unsubRoster = subscribeToRoster(setRoster);
    return () => { unsub(); unsubServer(); unsubRoster(); };
  }, []);

  const persistExpanded = (set) => {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify([...set]));
  };
  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      persistExpanded(next);
      return next;
    });
  };

  const handleToggle = async (id) => {
    if (isGuest) return;
    try { await toggleRoadmapProgress(id, !progress[id]); } catch { alert(t('roadmap.saveError')); }
  };

  const cd = getCountdown(launchDate);
  const allIds = useMemo(() => allTaskIds(), []);
  const totalDone = allIds.filter(id => progress[id]).length;

  const phaseStats = (phase) => {
    const ids = [];
    phase.tasks.forEach(tk => { ids.push(tk.id); if (tk.sub) tk.sub.forEach(s => ids.push(s.id)); });
    return { done: ids.filter(id => progress[id]).length, total: ids.length };
  };

  const activeMembers = roster.filter(m => m.name && m.name !== '—' && m.userId && m.userId !== '__occupied__');
  const pLvl = packLevel(activeMembers);
  const activePhaseId = getActivePhaseId(pLvl, cd ? cd.started : true);

  // Один раз после загрузки ростера открываем активную фазу.
  const autoRef = useRef(false);
  useEffect(() => {
    if (autoRef.current || roster.length === 0) return;
    autoRef.current = true;
    setExpanded(prev => { const n = new Set(prev); n.add(activePhaseId); return n; });
  }, [roster.length, activePhaseId]);

  const openAssign = (task) => {
    setAssign({ text: task.text, tag: task.offprime ? 'offprime' : 'prime', target: '' });
  };
  const sendAssign = async () => {
    if (!assign?.text.trim()) return;
    try {
      const m = activeMembers.find(x => x.userId === assign.target);
      await addTask(assign.text.trim(), assign.tag, assign.target, m?.name || '');
      setAssign(null);
    } catch { alert(t('roadmap.assignError')); }
  };

  const handleDate = async (e) => {
    const v = e.target.value;
    setLaunchDateState(v);
    try { await setLaunchDate(v); } catch { alert(t('roadmap.saveError')); }
  };

  const renderList = (arr, cls) => (
    <ul className={cls}>{arr.map((x, i) => <li key={i}>{x}</li>)}</ul>
  );

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}><MapIcon size={22} /> {t('roadmap.title')}</h2>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          {cd && (
            <span className={`launch-chip ${cd.started ? 'launch-chip--live' : ''}`}>
              <Rocket size={14} />
              {cd.started ? t('roadmap.dayN', { n: cd.dayNumber }) : t('roadmap.daysLeft', { n: cd.days })}
            </span>
          )}
          {isPL && (
            <label className="launch-date-edit" title={t('roadmap.setLaunch')}>
              <CalendarDays size={14} />
              <input type="date" className="input-field" value={launchDate} onChange={handleDate}
                style={{ padding: '0.25rem 0.4rem', fontSize: '0.8rem', width: 'auto' }} />
            </label>
          )}
        </div>
      </div>

      {/* Общий прогресс */}
      <div className="roadmap-overall">
        <div className="roadmap-overall-bar">
          <div className="roadmap-overall-fill" style={{ width: `${Math.round((totalDone / allIds.length) * 100)}%` }} />
        </div>
        <span className="roadmap-overall-label">{totalDone}/{allIds.length}</span>
      </div>

      {/* О пачке и механиках */}
      <div className="rm-phase">
        <button className="rm-phase-head" onClick={() => toggleExpand('about')}>
          <Users size={16} className="rm-phase-icon" />
          <span className="rm-phase-title">{t('roadmap.about')}</span>
          {expanded.has('about') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {expanded.has('about') && (
          <div className="rm-phase-body">
            <div className="rm-section">
              <h4 className="rm-section-h"><Users size={13} /> {t('roadmap.core')}</h4>
              <div className="rm-chars">
                {LU4_CHARACTERS.map((c, i) => (
                  <div key={i} className="rm-char"><b>{c.role}</b> <span className="rm-char-race">{c.race}</span> — {c.note}</div>
                ))}
              </div>
              <div className="rm-tenth">{t('roadmap.tenth')}: {LU4_TENTH.join(', ')}</div>
            </div>
            <div className="rm-section">
              <h4 className="rm-section-h"><Lightbulb size={13} /> {t('roadmap.mechanics')}</h4>
              {renderList(LU4_MECHANICS, 'rm-ul')}
            </div>
          </div>
        )}
      </div>

      {/* Фазы */}
      {LU4_PHASES.map(phase => {
        const st = phaseStats(phase);
        const isOpen = expanded.has(phase.id);
        const complete = st.total > 0 && st.done === st.total;
        const isActive = phase.id === activePhaseId;
        return (
          <div key={phase.id} className={`rm-phase ${complete ? 'rm-phase--done' : ''} ${isActive ? 'rm-phase--active' : ''}`}>
            <button className="rm-phase-head" onClick={() => toggleExpand(phase.id)}>
              {phase.star && <span className="rm-star">★</span>}
              <span className="rm-phase-title">{phase.title}</span>
              <span className="rm-phase-levels">{phase.levels}</span>
              {isActive && <span className="rm-active-badge">{t('roadmap.current')}</span>}
              <span className="rm-phase-count">{st.done}/{st.total}</span>
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className="rm-phase-bar"><div className="rm-phase-fill" style={{ width: `${st.total ? Math.round(st.done / st.total * 100) : 0}%` }} /></div>

            {isOpen && (
              <div className="rm-phase-body">
                <div className="rm-goal"><Target size={14} /> {phase.goal}</div>

                {(phase.prime.length > 0 || phase.offprime.length > 0) && (
                  <div className="rm-primeoff">
                    <div className="rm-po rm-po--prime">
                      <h5><Sun size={13} /> {t('roadmap.prime')}</h5>
                      {phase.prime.length ? renderList(phase.prime, 'rm-ul') : <span className="rm-empty">—</span>}
                    </div>
                    <div className="rm-po rm-po--off">
                      <h5><Moon size={13} /> {t('roadmap.offprime')}</h5>
                      {phase.offprime.length ? renderList(phase.offprime, 'rm-ul') : <span className="rm-empty">—</span>}
                    </div>
                  </div>
                )}

                {phase.farmZones.length > 0 && (
                  <div className="rm-section">
                    <h4 className="rm-section-h"><MapPin size={13} /> {t('roadmap.zones')}</h4>
                    <div className="rm-chips">{phase.farmZones.map((z, i) => <span key={i} className="rm-chip">{z}</span>)}</div>
                  </div>
                )}

                {phase.quests.length > 0 && (
                  <div className="rm-section">
                    <h4 className="rm-section-h"><ScrollText size={13} /> {t('roadmap.quests')}</h4>
                    <div className="rm-quests">
                      {phase.quests.map((q, i) => (
                        <div key={i} className="rm-quest">
                          <span className="rm-quest-rep">{q.rep}</span>
                          <div className="rm-quest-main">
                            <span className="rm-quest-name">{q.ru} <em>({q.name})</em></span>
                            <span className="rm-quest-meta">{q.npc} · {q.lvl}</span>
                          </div>
                          <span className="rm-quest-reward">{q.reward}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {phase.gear.length > 0 && (
                  <div className="rm-section">
                    <h4 className="rm-section-h"><Shield size={13} /> {t('roadmap.gear')}</h4>
                    {renderList(phase.gear, 'rm-ul')}
                  </div>
                )}

                {phase.rb.length > 0 && (
                  <div className="rm-section">
                    <h4 className="rm-section-h"><Swords size={13} /> {t('roadmap.rb')}</h4>
                    <div className="rm-chips">{phase.rb.map((b, i) => <span key={i} className="rm-chip rm-chip--rb">{b}</span>)}</div>
                  </div>
                )}

                <div className="rm-section">
                  <h4 className="rm-section-h"><CheckCircle2 size={13} /> {t('roadmap.tasks')}</h4>
                  <div className="rm-tasks">
                    {phase.tasks.map(task => (
                      <div key={task.id} className="rm-task">
                        <div className="rm-task-row">
                          <button className="rm-check" onClick={() => handleToggle(task.id)} disabled={isGuest}>
                            {progress[task.id] ? <CheckCircle2 size={17} color="var(--success)" /> : <Circle size={17} color="var(--text-muted)" />}
                          </button>
                          <span className={`rm-task-text ${progress[task.id] ? 'rm-done' : ''}`}>{task.text}</span>
                          {task.star && <span className="rm-star rm-star--sm">★</span>}
                          {task.prime && <span className="rm-tag rm-tag--prime">{t('roadmap.primeShort')}</span>}
                          {task.offprime && <span className="rm-tag rm-tag--off">{t('roadmap.offShort')}</span>}
                          {isOfficer && (
                            <button className="rm-assign" onClick={() => openAssign(task)} title={t('roadmap.assign')}>
                              <Send size={13} />
                            </button>
                          )}
                        </div>
                        {task.tip && <div className="rm-tip rm-tip--inline"><Lightbulb size={11} /> {task.tip}</div>}
                        {task.sub && task.sub.map(s => (
                          <div key={s.id} className="rm-subtask">
                            <button className="rm-check rm-check--sm" onClick={() => handleToggle(s.id)} disabled={isGuest}>
                              {progress[s.id] ? <CheckCircle2 size={14} color="var(--success)" /> : <Circle size={14} color="var(--text-muted)" />}
                            </button>
                            <span className={`rm-subtask-text ${progress[s.id] ? 'rm-done' : ''}`}>{s.text}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {phase.tips.length > 0 && (
                  <div className="rm-tips">
                    {phase.tips.map((tp, i) => <div key={i} className="rm-tip"><Lightbulb size={13} /> {tp}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Модалка «Выдать в дашборд» */}
      {assign && (
        <div className="modal-overlay" onClick={() => setAssign(null)}>
          <div className="modal-card fade-in-scale" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{t('roadmap.assignTitle')}</h3>
              <button className="modal-close" onClick={() => setAssign(null)}><X size={18} /></button>
            </div>
            <div className="input-group">
              <label>{t('roadmap.assignText')}</label>
              <input type="text" className="input-field" value={assign.text} onChange={e => setAssign({ ...assign, text: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <div className="input-group" style={{ flex: 1 }}>
                <label>{t('roadmap.assignTo')}</label>
                <select className="input-field" value={assign.target} onChange={e => setAssign({ ...assign, target: e.target.value })}>
                  <option value="">{t('roadmap.forEveryone')}</option>
                  {activeMembers.map(m => <option key={m.id} value={m.userId}>{m.name}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ width: '120px' }}>
                <label>{t('roadmap.assignTag')}</label>
                <select className="input-field" value={assign.tag} onChange={e => setAssign({ ...assign, tag: e.target.value })}>
                  <option value="prime">{t('dashboard.prime')}</option>
                  <option value="offprime">{t('dashboard.offprime')}</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setAssign(null)}>{t('roadmap.cancel')}</button>
              <button className="btn btn-primary btn-sm" onClick={sendAssign}><Send size={14} /> {t('roadmap.assignSend')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
