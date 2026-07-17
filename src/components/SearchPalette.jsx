import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, LayoutDashboard, Users, Hammer, Skull, Map as MapIcon, ScrollText } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { subscribeToRoster } from '../services/rosterService';
import { subscribeToRB } from '../services/rbService';
import { listProducts, itemIcon } from '../utils/recipeCalc';

const PAGES = [
  { key: 'nav.dashboard', path: '/', icon: LayoutDashboard },
  { key: 'nav.roadmap', path: '/roadmap', icon: MapIcon },
  { key: 'nav.schedule', path: '/schedule', icon: ScrollText },
  { key: 'nav.raidbosses', path: '/raidbosses', icon: Skull },
  { key: 'nav.craft', path: '/craft', icon: Hammer },
  { key: 'nav.members', path: '/members', icon: Users },
  { key: 'nav.treasury', path: '/treasury', icon: LayoutDashboard },
  { key: 'nav.roster', path: '/roster', icon: Users },
];

export const SearchPalette = ({ open, onClose }) => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [roster, setRoster] = useState([]);
  const [bosses, setBosses] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQ('');
    const u1 = subscribeToRoster(setRoster);
    const u2 = subscribeToRB(setBosses);
    setTimeout(() => inputRef.current?.focus(), 30);
    return () => { u1(); u2(); };
  }, [open]);

  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!query) return { pages: PAGES.slice(0, 6).map(p => ({ ...p, label: t(p.key) })), members: [], recipes: [], bosses: [] };
    const pages = PAGES.map(p => ({ ...p, label: t(p.key) })).filter(p => p.label.toLowerCase().includes(query));
    const members = roster.filter(m => m.name && m.name !== '—' && m.name.toLowerCase().includes(query)).slice(0, 6);
    const recipes = listProducts({ q: query }).slice(0, 6);
    const bs = bosses.filter(b => (b.name || '').toLowerCase().includes(query)).slice(0, 6);
    return { pages, members, recipes, bosses: bs };
  }, [query, roster, bosses, t]);

  if (!open) return null;

  const go = (path) => { navigate(path); onClose(); };
  const flat = [
    ...results.pages.map(p => ({ label: p.label, path: p.path, group: 'page' })),
    ...results.members.map(m => ({ label: m.name, path: '/members', group: 'member' })),
    ...results.recipes.map(r => ({ label: r.name, path: '/craft', group: 'recipe', id: r.id })),
    ...results.bosses.map(b => ({ label: b.name, path: '/raidbosses', group: 'boss' })),
  ];

  const onKey = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && flat[0]) go(flat[0].path); };

  return (
    <div className="modal-overlay search-overlay" onClick={onClose}>
      <div className="search-card fade-in-scale" onClick={e => e.stopPropagation()}>
        <div className="search-input">
          <Search size={16} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} placeholder={t('search.placeholder')} />
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="search-results">
          {results.pages.length > 0 && (
            <div className="search-group"><div className="search-group-h">{t('search.pages')}</div>
              {results.pages.map(p => <button key={p.path} className="search-item" onClick={() => go(p.path)}><p.icon size={15} /> {p.label}</button>)}
            </div>
          )}
          {results.members.length > 0 && (
            <div className="search-group"><div className="search-group-h">{t('search.members')}</div>
              {results.members.map(m => <button key={m.id} className="search-item" onClick={() => go('/members')}><Users size={15} /> {m.name} <span className="search-meta">{m.className}</span></button>)}
            </div>
          )}
          {results.recipes.length > 0 && (
            <div className="search-group"><div className="search-group-h">{t('search.recipes')}</div>
              {results.recipes.map(r => <button key={r.id} className="search-item" onClick={() => go('/craft')}>{itemIcon(r.id) ? <img src={itemIcon(r.id)} alt="" width={18} height={18} className="item-icon" /> : <Hammer size={15} />} {r.name} <span className="search-meta">{r.grade}</span></button>)}
            </div>
          )}
          {results.bosses.length > 0 && (
            <div className="search-group"><div className="search-group-h">{t('search.bosses')}</div>
              {results.bosses.map(b => <button key={b.id} className="search-item" onClick={() => go('/raidbosses')}><Skull size={15} /> {b.name} {b.level ? <span className="search-meta">Ур. {b.level}</span> : null}</button>)}
            </div>
          )}
          {query && flat.length === 0 && <div className="search-empty">{t('search.nothing')}</div>}
        </div>
        <div className="search-hint">{t('search.hint')}</div>
      </div>
    </div>
  );
};
