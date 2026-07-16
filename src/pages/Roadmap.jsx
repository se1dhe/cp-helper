import React, { useEffect, useMemo, useState } from 'react';
import { Map as MapIcon, Flag, Plus, Trash2, CheckCircle2, Circle, Rocket, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import {
  subscribeToRoadmap, addRoadmapItem, toggleRoadmapItem, deleteRoadmapItem,
  subscribeToServerInfo, setLaunchDate,
} from '../services/roadmapService';
import { getCountdown } from '../utils/countdown';

// Стартовый шаблон под Lu4 (MasterWork) — ПЛ грузит одним кликом и правит под себя.
const STARTER = [
  { phase: '0. Подготовка', items: [
    'Финализировать ростер и роли (3 Сорка, Биш, ТК, БД, ШЕ, ЕЕ, Овер)',
    'Забить прайм-тайм и RB в Расписание',
    'У каждого личный запас Blessed Scroll of Resurrection',
    'Договориться о дисциплине: bulk turn-in 100+, один радиус фарма',
  ] },
  { phase: '1. Сепарация 1-15', items: [
    'Расовые старты: оружие/бижа/заряды по расам',
    'Люди: Sword of Solidarity + Spirit of Mirrors',
    'Т.Эльфы: Forgotten Truth; Овер: Long live the Pa\'agrio Lord',
    'Заряды: The Guard is Busy (Gilbert)',
    'Сбор всей группы в Gludin на 12-15 lvl',
  ] },
  { phase: '2. Концентрация 15-19', items: [
    'Cure for Fever Disease (Bone Shield)',
    'Will the Seal be Broken? (NG броня + D-скроллы)',
    'Dragon Fangs (доспехи)',
    'Стэк-фарм Lizardmen/Orcs: The Guard is Busy + Orc Subjugation',
  ] },
  { phase: '3. Первая профа (20)', items: [
    'Все выходят на 20 и сдают профу ОДНОВРЕМЕННО',
    'Забрать Weapon Upgrade Coupon (NG→D) → D-оружие',
    'Проверить: 250k EXP, соски, Blessed Res у каждого',
  ] },
  { phase: '4. D-грейд 20-36', items: [
    'Броня D: Acts of Evil (27-32), Aiding the Floran Village (30-42)',
    'Бижа D: Magnificent Feast',
    'Опыт: Red-Eyed Invaders, Dangerous Seduction, Seed of Evil',
    'Форсировать до 36-39 lvl',
  ] },
  { phase: '5. Донорский цикл 36-40', items: [
    'Аллигаторы (Heine, 600+ → 96700 аден)',
    'Вторжение на Святую Землю (Heine, 600+ → 228000 аден)',
    'Честь семьи (Oren, Timak) + статуи Патрину',
    'Испытание магии (50k EXP) + призывателя (41k EXP)',
    'Копить Mystic Map Parts; 2-я профа на 40',
  ] },
  { phase: '6. C-грейд 40-52', items: [
    'Цепочка Coins of Removal → Kail\'s Magic Coin (C-броня)',
    'Seductive Whispers (50+, рецепты оружия)',
    'Bulk-квесты 40+: Trespassing, Alligator Hunter (пороги 300/600)',
    'Treasure Hunt (42, Пиратская карта), Relic Exploration',
  ] },
  { phase: '7. Стабилизация', items: [
    'Полный C-грейд на ядро пака',
    'Ноблесс / сабкласс по готовности',
    'Регулярные RB по расписанию',
    'Стабильный доход казны',
  ] },
];

export const Roadmap = () => {
  const { isPL, isOfficer, isGuest } = useAuth();
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [launchDate, setLaunchDateState] = useState('');
  const [newPhase, setNewPhase] = useState('');
  const [newText, setNewText] = useState('');

  useEffect(() => {
    const unsub = subscribeToRoadmap(setItems);
    const unsubServer = subscribeToServerInfo((info) => setLaunchDateState(info.launchDate || ''));
    return () => { unsub(); unsubServer(); };
  }, []);

  const phases = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.phase)) map.set(it.phase, { name: it.phase, phaseOrder: it.phaseOrder ?? 0, items: [] });
      map.get(it.phase).items.push(it);
    }
    const arr = [...map.values()].sort((a, b) => (a.phaseOrder - b.phaseOrder) || a.name.localeCompare(b.name));
    arr.forEach(p => p.items.sort((a, b) => (a.order || 0) - (b.order || 0)));
    return arr;
  }, [items]);

  const totalDone = items.filter(i => i.done).length;
  const cd = getCountdown(launchDate);

  const handleToggle = async (item) => {
    if (isGuest) return;
    try { await toggleRoadmapItem(item.id, item.done); } catch { alert(t('roadmap.saveError')); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const phase = newPhase.trim();
    const text = newText.trim();
    if (!phase || !text) return;
    const existing = phases.find(p => p.name === phase);
    const phaseOrder = existing ? existing.phaseOrder : (phases.reduce((m, p) => Math.max(m, p.phaseOrder), 0) + 1);
    const order = existing ? existing.items.length : 0;
    try {
      await addRoadmapItem(phase, phaseOrder, text, order);
      setNewText('');
    } catch { alert(t('roadmap.saveError')); }
  };

  const handleDelete = async (id) => {
    try { await deleteRoadmapItem(id); } catch { alert(t('roadmap.deleteError')); }
  };

  const handleSeed = async () => {
    try {
      let po = 0;
      for (const ph of STARTER) {
        po += 1;
        let ord = 0;
        for (const text of ph.items) {
          await addRoadmapItem(ph.phase, po, text, ord);
          ord += 1;
        }
      }
    } catch { alert(t('roadmap.saveError')); }
  };

  const handleDate = async (e) => {
    const val = e.target.value;
    setLaunchDateState(val);
    try { await setLaunchDate(val); } catch { alert(t('roadmap.saveError')); }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          <MapIcon size={22} /> {t('roadmap.title')}
        </h2>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          {cd && (
            <span className={`launch-chip ${cd.started ? 'launch-chip--live' : ''}`}>
              <Rocket size={14} />
              {cd.started
                ? t('roadmap.dayN', { n: cd.dayNumber })
                : t('roadmap.daysLeft', { n: cd.days })}
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

      {items.length > 0 && (
        <div className="roadmap-overall">
          <div className="roadmap-overall-bar">
            <div className="roadmap-overall-fill" style={{ width: `${Math.round((totalDone / items.length) * 100)}%` }} />
          </div>
          <span className="roadmap-overall-label">{totalDone}/{items.length}</span>
        </div>
      )}

      {isOfficer && (
        <form onSubmit={handleAdd} className="roadmap-add">
          <input
            list="roadmap-phases"
            className="input-field"
            style={{ width: '170px' }}
            placeholder={t('roadmap.phasePlaceholder')}
            value={newPhase}
            onChange={e => setNewPhase(e.target.value)}
          />
          <datalist id="roadmap-phases">
            {phases.map(p => <option key={p.name} value={p.name} />)}
          </datalist>
          <input
            className="input-field"
            style={{ flexGrow: 1, minWidth: '160px' }}
            placeholder={t('roadmap.itemPlaceholder')}
            value={newText}
            onChange={e => setNewText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', flexShrink: 0 }}>
            <Plus size={18} />
          </button>
        </form>
      )}

      {phases.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="text-muted" style={{ marginBottom: isPL ? '1rem' : 0 }}>{t('roadmap.empty')}</p>
          {isPL && (
            <button className="btn btn-primary" onClick={handleSeed}>
              <Rocket size={16} /> {t('roadmap.loadTemplate')}
            </button>
          )}
        </div>
      ) : (
        <div className="roadmap-phases">
          {phases.map(phase => {
            const done = phase.items.filter(i => i.done).length;
            const pct = Math.round((done / phase.items.length) * 100);
            const complete = done === phase.items.length;
            return (
              <div key={phase.name} className={`roadmap-phase ${complete ? 'roadmap-phase--done' : ''}`}>
                <div className="roadmap-phase-head">
                  <Flag size={15} className="roadmap-phase-icon" />
                  <span className="roadmap-phase-title">{phase.name}</span>
                  <span className="roadmap-phase-count">{done}/{phase.items.length}</span>
                </div>
                <div className="roadmap-phase-bar">
                  <div className="roadmap-phase-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="roadmap-items">
                  {phase.items.map(item => (
                    <div key={item.id} className={`roadmap-item ${item.done ? 'roadmap-item--done' : ''}`}>
                      <button className="roadmap-item-check" onClick={() => handleToggle(item)} disabled={isGuest}>
                        {item.done
                          ? <CheckCircle2 size={17} color="var(--success)" />
                          : <Circle size={17} color="var(--text-muted)" />}
                      </button>
                      <span className="roadmap-item-text">{item.text}</span>
                      {isOfficer && (
                        <button className="roadmap-item-del" onClick={() => handleDelete(item.id)} title={t('roadmap.delete')}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
