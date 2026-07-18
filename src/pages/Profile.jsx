import React, { useEffect, useMemo, useState } from 'react';
import { User, Coins, Medal, Map as MapIcon, Flame, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { subscribeToTransactions } from '../services/treasuryService';
import { subscribeToQuestData } from '../services/questService';
import { subscribeToQuestLog } from '../services/questLogService';
import { subscribeToMinContributions } from '../services/memberService';
import { getUniversalQuests, getRaceQuestsForClass, isQuestHiddenForMember, questWikiUrl } from '../data/quests';
import { LU4_PHASES, getActivePhaseId } from '../data/lu4Roadmap';
import { openExternal } from '../utils/openExternal';
import { L2_CLASSES } from '../utils/classes';
import { ClassIcon } from '../components/ClassIcon';

const getClassDetails = (name) => L2_CLASSES.find(c => c.name === name) || { type: 'unknown', color: '#888' };
const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);
const dayKey = (d) => d.toISOString().slice(0, 10);

export const Profile = () => {
  const { currentUser, userNickname, userClass, userLevel, userRole, userAvatar } = useAuth();
  const { t } = useLang();
  const [transactions, setTransactions] = useState([]);
  const [questData, setQuestData] = useState(null);
  const [questLog, setQuestLog] = useState({});
  const [minAdena, setMinAdena] = useState(0);

  useEffect(() => {
    const u1 = subscribeToTransactions((d) => setTransactions(d.transactions || []));
    const u2 = subscribeToQuestData(setQuestData);
    const u3 = subscribeToQuestLog(setQuestLog);
    const u4 = subscribeToMinContributions(setMinAdena);
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const uid = currentUser?.uid;
  const cls = getClassDetails(userClass);

  const myTx = useMemo(() => transactions.filter(tx =>
    tx.type === 'income' && tx.currency === 'adena' && (tx.memberId === uid || tx.member === userNickname)
  ), [transactions, uid, userNickname]);

  const totalContrib = myTx.reduce((s, tx) => s + (Number(tx.amount) || 0), 0);

  // Стрик дисциплины: подряд дней (заканчивая сегодня/вчера), где адена >= минимума.
  const streak = useMemo(() => {
    if (!minAdena) return null;
    const byDay = {};
    myTx.forEach(tx => { const d = tx.timestamp?.toDate?.(); if (d) byDay[dayKey(d)] = (byDay[dayKey(d)] || 0) + (Number(tx.amount) || 0); });
    let s = 0;
    const day = new Date(); day.setHours(0, 0, 0, 0);
    // допускаем, что сегодня ещё не сдал — стартуем со вчера, если сегодня 0
    if ((byDay[dayKey(day)] || 0) < minAdena) day.setDate(day.getDate() - 1);
    for (let i = 0; i < 60; i++) {
      if ((byDay[dayKey(day)] || 0) >= minAdena) { s++; day.setDate(day.getDate() - 1); }
      else break;
    }
    return s;
  }, [myTx, minAdena]);

  const quests = useMemo(() => {
    if (!questData || !userClass) return { done: 0, total: 0, list: [] };
    const all = [...getRaceQuestsForClass(questData, userClass), ...getUniversalQuests(questData)];
    const log = questLog?.[uid] || {};
    // Прячем выполненные квесты, которые мембер перерос по уровню.
    const list = all
      .map(q => ({ name: q.name, lvl: q.lvl, done: log[q.name] === true }))
      .filter(q => !isQuestHiddenForMember(q, userLevel, q.done));
    return { done: list.filter(x => x.done).length, total: list.length, list };
  }, [questData, userClass, questLog, uid, userLevel]);

  const phase = LU4_PHASES.find(p => p.id === getActivePhaseId(userLevel, true));

  return (
    <div className="fade-in">
      <h2 className="page-title"><User size={22} /> {t('profile.pageTitle')}</h2>

      <div className="glass-panel prof-head">
        <div className="prof-avatar">
          {userAvatar ? <img src={userAvatar} alt="" /> : cls.type !== 'unknown' ? <ClassIcon className={userClass} type={cls.type} size={64} /> : <div className="prof-avatar-fb">{(userNickname || '?')[0]?.toUpperCase()}</div>}
        </div>
        <div className="prof-info">
          <div className="prof-name" style={{ color: cls.color !== '#888' ? cls.color : undefined }}>{userNickname}</div>
          <div className="prof-sub">
            {userClass && <span>{userClass}</span>}
            <span className="prof-lvl">{t('profile.lvlShort')} {userLevel}</span>
            <span className={`role-badge role-badge-${userRole.toLowerCase()}`}>{t(`role.${userRole.toLowerCase()}`)}</span>
          </div>
        </div>
      </div>

      <div className="stat-cards prof-stats">
        <div className="stat-card stat-card--gold">
          <div className="stat-card-icon stat-card-icon--gold"><Coins size={20} /></div>
          <div className="stat-card-label">{t('profile.contribution')}</div>
          <div className="stat-card-value">{totalContrib ? fmt(totalContrib) : '—'}</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card-icon stat-card-icon--green"><Medal size={20} /></div>
          <div className="stat-card-label">{t('profile.quests')}</div>
          <div className="stat-card-value">{quests.total ? `${quests.done}/${quests.total}` : '—'}</div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-card-icon stat-card-icon--blue"><Flame size={20} /></div>
          <div className="stat-card-label">{t('profile.streak')}</div>
          <div className="stat-card-value">{streak != null ? t('profile.days', { n: streak }) : '—'}</div>
        </div>
      </div>

      {phase && (
        <div className="glass-panel mb-4">
          <h3 className="section-header"><MapIcon size={16} /> {t('profile.roadmapPhase')}</h3>
          <div className="prof-phase">{phase.title} <span className="text-muted">· {phase.levels}</span></div>
          <div className="prof-phase-goal">{phase.goal}</div>
        </div>
      )}

      {quests.list.length > 0 && (
        <div className="glass-panel">
          <h3 className="section-header"><Medal size={16} /> {t('profile.myQuests')}</h3>
          <div className="prof-quests">
            {quests.list.map((q, i) => (
              <div key={i} className={`prof-quest ${q.done ? 'prof-quest--done' : ''}`}>
                {q.done ? <CheckCircle2 size={15} color="var(--success)" /> : <Circle size={15} color="var(--text-muted)" />}
                <span className="prof-quest-name">{q.name}</span>
                <span className="prof-quest-lvl">LVL {q.lvl}</span>
                <button className="prof-quest-wiki" onClick={() => openExternal(questWikiUrl(q.name))} title={t('quest.walkthrough')}><ExternalLink size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
