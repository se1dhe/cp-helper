import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { searchItems, itemIcon } from '../utils/recipeCalc';
import { subscribeToCraftStash, setCraftStash } from '../services/craftStashService';

const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);
const gradeClass = (g) => `grade-badge grade-${(g || 'NG').toLowerCase()}`;
const Ic = ({ id, size = 18 }) => {
  const s = itemIcon(id);
  return s
    ? <img className="item-icon" src={s} alt="" width={size} height={size} loading="lazy" onError={e => { e.target.style.visibility = 'hidden'; }} />
    : <span className="item-icon item-icon--none" style={{ width: size, height: size }} />;
};

// Личные закладки ресурсов: цель + накопление, показывает «сколько ещё надо». Хранится в аккаунте.
export const CraftStash = () => {
  const { t } = useLang();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(1);
  const [picked, setPicked] = useState(null);
  const [adds, setAdds] = useState({});

  useEffect(() => {
    if (!uid) return;
    const u = subscribeToCraftStash(uid, setItems);
    return () => u();
  }, [uid]);

  const results = useMemo(() => (q.trim().length >= 2 ? searchItems(q, 20) : []), [q]);

  const persist = (next) => { setItems(next); if (uid) setCraftStash(uid, next).catch(() => {}); };

  const addItem = () => {
    if (!picked) return;
    if (items.some(x => String(x.id) === String(picked.id))) { setPicked(null); setQ(''); return; }
    persist([...items, { id: String(picked.id), name: picked.name, grade: picked.grade, target: Math.max(1, Number(target) || 1), have: 0 }]);
    setPicked(null); setQ(''); setTarget(1);
  };
  const bump = (id, delta) => persist(items.map(x => String(x.id) === String(id) ? { ...x, have: Math.max(0, (Number(x.have) || 0) + delta) } : x));
  const setTargetOf = (id, v) => persist(items.map(x => String(x.id) === String(id) ? { ...x, target: Math.max(1, Number(v) || 1) } : x));
  const remove = (id) => persist(items.filter(x => String(x.id) !== String(id)));
  const applyAdd = (id, sign) => { const d = (Number(adds[id]) || 0) * sign; if (d) bump(id, d); setAdds(a => ({ ...a, [id]: '' })); };

  if (!uid) return null;

  return (
    <>
      <div className="glass-panel mb-4">
        <h3 className="section-header">{t('stash.add')}</h3>
        {!picked ? (
          <>
            <div className="rc-search"><Search size={14} /><input className="input-field" placeholder={t('stash.search')} value={q} onChange={e => setQ(e.target.value)} /></div>
            {results.length > 0 && (
              <div className="cq-results">
                {results.map(p => (
                  <button key={p.id} className="rc-item" onClick={() => setPicked(p)}>
                    <Ic id={p.id} size={20} /><span className={gradeClass(p.grade)}>{p.grade}</span><span className="rc-item-name">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="cq-form">
            <span className="cq-picked"><Ic id={picked.id} size={22} /> <span className={gradeClass(picked.grade)}>{picked.grade}</span> {picked.name}</span>
            <label>{t('stash.target')}<input type="number" min="1" className="input-field" value={target} onChange={e => setTarget(Math.max(1, Number(e.target.value) || 1))} style={{ width: '90px' }} /></label>
            <button className="btn btn-sm" onClick={() => setPicked(null)}>{t('cq.change')}</button>
            <button className="btn btn-primary btn-sm" onClick={addItem}><Plus size={14} /> {t('stash.addBtn')}</button>
          </div>
        )}
        <p className="craft-hint" style={{ marginTop: '0.5rem' }}>{t('stash.hint')}</p>
      </div>

      {items.length === 0 ? (
        <div className="glass-panel"><p className="text-center text-muted" style={{ padding: '2rem' }}>{t('stash.empty')}</p></div>
      ) : (
        <div className="stash-list">
          {items.map(it => {
            const have = Number(it.have) || 0;
            const tgt = Math.max(1, Number(it.target) || 1);
            const left = Math.max(0, tgt - have);
            const pct = Math.min(100, Math.round(have / tgt * 100));
            const done = left === 0;
            return (
              <div key={it.id} className={`glass-panel stash-row ${done ? 'stash-row--done' : ''}`}>
                <div className="stash-row-head">
                  <Ic id={it.id} size={22} />
                  <span className={gradeClass(it.grade)}>{it.grade}</span>
                  <span className="stash-name">{it.name}</span>
                  {done
                    ? <span className="stash-left stash-left--done"><Check size={13} /> {t('stash.done')}</span>
                    : <span className="stash-left">{t('stash.left')}: <b>{fmt(left)}</b></span>}
                  <button className="rb-del" onClick={() => remove(it.id)} title={t('stash.remove')}><Trash2 size={14} /></button>
                </div>
                <div className="stash-bar"><div className="stash-bar-fill" style={{ width: `${pct}%` }} /></div>
                <div className="stash-row-ctl">
                  <span className="stash-have">{fmt(have)} / <input type="number" min="1" className="input-field stash-tgt" value={tgt} onChange={e => setTargetOf(it.id, e.target.value)} /></span>
                  <div className="stash-add">
                    <input type="number" className="input-field" placeholder="+N" value={adds[it.id] ?? ''} onChange={e => setAdds(a => ({ ...a, [it.id]: e.target.value }))} style={{ width: '90px' }} />
                    <button className="btn btn-sm" onClick={() => applyAdd(it.id, 1)}><Plus size={13} /> {t('stash.gathered')}</button>
                    <button className="btn btn-sm" onClick={() => applyAdd(it.id, -1)} title={t('stash.spent')}>−</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
