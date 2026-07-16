import React, { useEffect, useMemo, useState } from 'react';
import { Map as MapIcon, Flag, Plus, Trash2, CheckCircle2, Circle, Rocket, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import {
  subscribeToRoadmap, addRoadmapItem, toggleRoadmapItem, deleteRoadmapItem,
  subscribeToServerInfo, setLaunchDate,
} from '../services/roadmapService';
import { getCountdown } from '../utils/countdown';

// Детальный шаблон под Lu4 (MasterWork), 1→40 с подзадачами.
// ПЛ грузит одним кликом и правит под себя. Подробности — в ROADMAP_LU4_1-40.md.
const STARTER = [
  { phase: '0. Подготовка (до старта)', items: [
    'Финализировать ростер и роли (3 Сорка, Биш, ТК, БД, СвС, ШЕ, ЕЕ, Овер)',
    'Определить расы и стартовые деревни каждого',
    'Каждый заранее выписал свои расовые квесты 1-6',
    'Забить прайм/оффпрайм и RB в Расписание (мега-квесты — в оффпрайм)',
    'У каждого личный запас Blessed Scroll of Resurrection',
    'Правило вслух: bulk turn-in, один радиус, AoE-бёрст толпы',
  ] },
  { phase: '1. Расовый старт 1-6', items: [
    'Люди: Letters of Love, Deliver Goods, Sacrifice to the Sea',
    'Эльфы: What Women Want, Fruit of the Mother Tree',
    'Т.Эльфы: Mass of Darkness, Deliver Supplies',
    'Овер: Long live the Pa\'agrio Lord (NG оружие)',
    'Люди на 3: Find Sir Windawood (зелья скорости)',
    'Все дошли до 5-6 lvl',
  ] },
  { phase: '2. Оружие/заряды/сбор 6-12', items: [
    'Люди: Sword of Solidarity; маги-люди: Spirit of Mirrors (Wand of Adept)',
    'Т.Эльфы: Forgotten Truth; эльфы-маги: Skirmish with the Orcs',
    'Прогнать 1-раз зарядные квесты (Bonds of Slavery / Hidden Veins / The Guard is Busy)',
    'Овер начинает марш к Глудио на 12-15',
    'Сбор всей пачки в Gludin к 12-15',
    'Стэк-фарм: The Guard is Busy + Orc Subjugation у всех',
  ] },
  { phase: '3. Броня и разгон 12-19', items: [
    'Cure for Fever Disease (Bone Shield + 20k EXP)',
    'Offspring of Nightmares (20k EXP + 15k ад)',
    'Will the Seal be Broken? (NG броня + D-Enchant Scrolls — СОХРАНИТЬ)',
    'Фоном: Grim Collector / Crystals of Fire and Ice',
    'Собрать первый NG-сет брони',
    'Все дошли до 19 lvl',
  ] },
  { phase: '4. Мега-квесты + 1-я профа 19-26', items: [
    'На 19: Dragon Fangs (Luis, Gludin) — 350k EXP + D-броня',
    'На 20: 1-я профа ВСЕЙ пачкой одновременно (250k EXP + Weapon Coupon)',
    'Обмен оружия NG→D по купону (город без налога) + D-скроллы',
    'На 20: Red-Eyed Invaders (Babenco) — ~300k EXP + 3 Blessed Res',
    'Blood Fiend / Dangerous Seduction / Seed of Evil (по расам, +250k)',
    'Цикл Magnificent Feast (D-бижа) + Adept of Taste (53k EXP)',
    'Дойти до 26 lvl',
  ] },
  { phase: '5. D-грейд и донор 26-35', items: [
    'На 27: Acts of Evil (200k EXP + D-броня Turek)',
    'Клан до 4 ур. → Proof of Clan Alliance (200k EXP)',
    'Донор в прайм: Arrow of Vengeance / Fairy Breath (150+ = 50k EXP)',
    'Aiding the Floran Village — закрыть слоты D-брони',
    'Song of the Hunter: копить C-Blessed SpS и краски +3/-3',
    'Полный D-сет на 3 Сорках, танке, хиле',
    'Дойти до 35 lvl',
  ] },
  { phase: '6. Цепочка Temple + 2-я профа 35-40', items: [
    'Temple: Missionary → Executor → Champion 1 → Champion 2 (Дион)',
    'Shadow Fox 1-3 (Heine) → Fallen Angel Dawn (592k!) → Dusk',
    'Донор: Trespassing (Restina, 600+ = 228k ад)',
    'Донор: Аллигаторы (Kluck, 600+ = 96.7k ад + Pirate Map)',
    'Копить Pirate\'s Treasure Map / Mystic Map Parts',
    'На 40: 2-я профа ВСЕЙ пачкой одновременно',
  ] },
  { phase: '7. После 40 (C-грейд)', items: [
    'Kail\'s Magic Coin (C-броня), Seductive Whispers (рецепты оружия)',
    'Treasure Hunt (42, Пиратская карта), Relic Exploration',
    'Регулярные RB по расписанию, ноблесс/сабкласс по готовности',
    'Стабильный доход казны на Trespassing 600+',
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
