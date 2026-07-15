import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { subscribeToRoster } from '../services/rosterService';
import { subscribeToQuestData } from '../services/questService';
import { subscribeToQuestLog } from '../services/questLogService';
import { subscribeToTransactions } from '../services/treasuryService';
import { subscribeToMinContributions, setMinContribution } from '../services/memberService';
import { getUniversalQuests, getRaceQuestsForClass, getRaceLabel } from '../data/quests';
import { L2_CLASSES } from '../utils/classes';
import { ClassIcon } from '../components/ClassIcon';
import { UserCheck, Medal, Coins, ChevronDown, ChevronRight, CheckCircle2, Circle, ShieldAlert, Edit2, Check, X } from 'lucide-react';

const getClassDetails = (name) => L2_CLASSES.find(c => c.name === name) || { type: 'unknown', color: '#888' };

export const MemberProgress = () => {
  const { isPL, isOfficer } = useAuth();
  const { t } = useLang();
  const [roster, setRoster] = useState([]);
  const [questData, setQuestData] = useState(null);
  const [questLog, setQuestLog] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [minAdena, setMinAdena] = useState(0);
  const [expandedMembers, setExpandedMembers] = useState({});
  const [editingMin, setEditingMin] = useState(false);
  const [minInput, setMinInput] = useState('');

  const activeMembers = roster.filter(
    m => m.name && m.name !== '—' && m.userId && m.userId !== '__occupied__' && m.userId !== ''
  );

  useEffect(() => {
    if (!isPL && !isOfficer) return;
    const unsubRoster = subscribeToRoster(setRoster);
    const unsubQuests = subscribeToQuestData(setQuestData);
    const unsubLog = subscribeToQuestLog(setQuestLog);
    const unsubTx = subscribeToTransactions((data) => {
      setTransactions(data.transactions || []);
    });
    const unsubMin = subscribeToMinContributions(setMinAdena);
    return () => { unsubRoster(); unsubQuests(); unsubLog(); unsubTx(); unsubMin(); };
  }, [isPL, isOfficer]);

  if (!isPL && !isOfficer) {
    return (
      <div className="access-denied">
        <div className="access-denied-card fade-in">
          <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h2>{t('admin.accessDenied')}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{t('admin.accessDeniedMessage')}</p>
        </div>
      </div>
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const adenaToday = {};
  transactions.forEach(tx => {
    const txDate = tx.timestamp?.toDate?.();
    if (!txDate) return;
    if (tx.type === 'income' && tx.currency === 'adena' && txDate >= todayStart && txDate < todayEnd) {
      const name = tx.member || 'unknown';
      adenaToday[name] = (adenaToday[name] || 0) + tx.amount;
    }
  });

  const getQuestProgress = (member) => {
    if (!questData || !questLog) return null;
    const universal = getUniversalQuests(questData);
    const race = getRaceQuestsForClass(questData, member.className);
    const all = [...universal, ...race];
    return all.map(q => ({
      ...q,
      done: questLog?.[member.id]?.[q.name] === true,
    }));
  };

  const toggleExpand = (slotId) => {
    setExpandedMembers(prev => ({ ...prev, [slotId]: !prev[slotId] }));
  };

  const startEditMin = () => {
    setMinInput(String(minAdena));
    setEditingMin(true);
  };

  const saveMin = async () => {
    if (minInput === '' || isNaN(Number(minInput))) return;
    await setMinContribution(Number(minInput));
    setEditingMin(false);
  };

  return (
    <div className="fade-in">
      <h2 className="page-title"><UserCheck size={22} /> {t('members.title')}</h2>

      <div className="members-controls">
        <div className="members-controls-item">
          <Coins size={15} />
          <span>{t('members.minAdena')}:</span>
          {editingMin ? (
            <div className="min-edit-group">
              <input
                type="number"
                className="input-field"
                style={{ width: '110px', padding: '0.25rem 0.5rem', fontSize: '0.82rem' }}
                value={minInput}
                onChange={e => setMinInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveMin(); if (e.key === 'Escape') setEditingMin(false); }}
                autoFocus
              />
              <button className="btn btn-sm" onClick={saveMin}><Check size={13} /></button>
              <button className="btn btn-sm" onClick={() => setEditingMin(false)}><X size={13} /></button>
            </div>
          ) : (
            <>
              <span className="members-min-value">{minAdena > 0 ? minAdena.toLocaleString('ru-RU') : '—'}</span>
              <button className="btn btn-sm" onClick={startEditMin} title={t('members.clickToSet')}>
                <Edit2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {activeMembers.length === 0 ? (
        <div className="glass-panel">
          <p className="text-center text-muted" style={{ padding: '2rem' }}>{t('members.noMembers')}</p>
        </div>
      ) : (
        <div className="glass-panel members-report">
          <table>
            <thead>
              <tr>
                <th>{t('members.member')}</th>
                <th>{t('members.quests')}</th>
                <th>{t('members.adena')}</th>
                <th>{t('members.status')}</th>
              </tr>
            </thead>
            <tbody>
              {activeMembers.map(m => {
                const cls = getClassDetails(m.className);
                const raceLabel = getRaceLabel(questData, m.className);
                const progress = getQuestProgress(m);
                const done = progress ? progress.filter(q => q.done).length : 0;
                const total = progress ? progress.length : 0;
                const adenaTodayAmount = adenaToday[m.name] || 0;
                const adenaOk = minAdena > 0 ? adenaTodayAmount >= minAdena : null;
                const questsOk = total > 0 ? done === total : null;
                const isExpanded = expandedMembers[m.id];

                let statusLabel, statusClass;
                if (questsOk === false || adenaOk === false) {
                  statusLabel = t('members.notCompliant');
                  statusClass = 'status-bad';
                } else if (questsOk === true && (adenaOk === true || adenaOk === null)) {
                  statusLabel = t('members.compliant');
                  statusClass = 'status-good';
                } else {
                  statusLabel = '—';
                  statusClass = 'status-none';
                }

                return (
                  <React.Fragment key={m.id}>
                    <tr className="member-row" onClick={() => toggleExpand(m.id)}>
                      <td>
                        <button
                          className="member-expand-btn"
                          onClick={(e) => { e.stopPropagation(); toggleExpand(m.id); }}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <ClassIcon className={m.className} type={cls.type} size={24} />
                        <div className="member-cell-info">
                          <span className="member-cell-name">{m.name}</span>
                          <span className="member-cell-class" style={{ color: cls.color }}>
                            {m.className}{raceLabel ? ` · ${raceLabel}` : ''}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`quest-count ${questsOk === true ? 'quest-count--ok' : questsOk === false ? 'quest-count--bad' : ''}`}>
                          {total > 0 ? `${done}/${total}` : '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`adena-today ${adenaOk === true ? 'adena-today--ok' : adenaOk === false ? 'adena-today--bad' : ''}`}>
                          {adenaTodayAmount > 0 ? adenaTodayAmount.toLocaleString('ru-RU') : '0'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="member-detail-row">
                        <td colSpan={4}>
                          <div className="member-detail">
                            <div className="member-detail-section">
                              <h4><Medal size={13} /> {t('members.quests')}</h4>
                              {(!progress || progress.length === 0) ? (
                                <p className="text-muted" style={{ fontSize: '0.8rem' }}>{t('members.noQuests')}</p>
                              ) : (
                                <div className="quest-detail-list">
                                  {progress.map((q, i) => (
                                    <div key={i} className={`quest-detail-item ${q.done ? 'quest-detail-item--done' : ''}`}>
                                      {q.done
                                        ? <CheckCircle2 size={14} color="var(--success)" />
                                        : <Circle size={14} color="var(--text-muted)" />
                                      }
                                      <span className="quest-detail-name">{q.name}</span>
                                      <span className="quest-detail-lvl">LVL {q.lvl}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="member-detail-section">
                              <h4><Coins size={13} /> {t('members.adena')}</h4>
                              <div className="adena-detail-info">
                                <div className="adena-detail-row">
                                  <span className="adena-detail-label">{t('members.today')}:</span>
                                  <span className="adena-detail-value">{adenaTodayAmount.toLocaleString('ru-RU')}</span>
                                </div>
                                {minAdena > 0 && (
                                  <div className="adena-detail-row">
                                    <span className="adena-detail-label">{t('members.minAdena')}:</span>
                                    <span className="adena-detail-value">{minAdena.toLocaleString('ru-RU')}</span>
                                  </div>
                                )}
                                {minAdena > 0 && (
                                  <div className="adena-detail-row">
                                    <span className="adena-detail-label">{t('members.status')}:</span>
                                    <span className={`adena-detail-value ${adenaOk ? 'status-good' : 'status-bad'}`}>
                                      {adenaOk ? t('members.compliant') : t('members.notCompliant')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
