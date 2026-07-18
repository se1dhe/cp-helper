import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search, Check, Hammer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { listProducts, flattenBase, itemName, itemGrade, itemIcon } from '../utils/recipeCalc';
import { subscribeToCraftStash, setCraftStash } from '../services/craftStashService';

const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);
const gradeClass = (g) => `grade-badge grade-${(g || 'NG').toLowerCase()}`;
const Ic = ({ id, size = 18 }) => {
  const s = itemIcon(id);
  return s
    ? <img className="item-icon" src={s} alt="" title={itemName(id)} width={size} height={size} loading="lazy" onError={e => { e.target.style.visibility = 'hidden'; }} />
    : <span className="item-icon item-icon--none" style={{ width: size, height: size }} />;
};

// Личные закладки на КРАФТ-предмет: показывает нужные ресурсы, ты вписываешь сколько уже есть —
// видно, сколько добрать; когда всё собрано — «можно крафтить». Хранится в аккаунте.
export const CraftStash = () => {
  const { t } = useLang();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState(null);
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (!uid) return;
    const u = subscribeToCraftStash(uid, setItems);
    return () => u();
  }, [uid]);

  const results = useMemo(() => (q.trim().length >= 2 ? listProducts({ q }).slice(0, 25) : []), [q]);
  const persist = (next) => { setItems(next); if (uid) setCraftStash(uid, next).catch(() => {}); };

  const addItem = () => {
    if (!picked) return;
    if (items.some(x => String(x.productId) === String(picked.id))) { setPicked(null); setQ(''); return; }
    persist([...items, { productId: String(picked.id), name: picked.name, grade: picked.grade, count: Math.max(1, Number(count) || 1), have: {} }]);
    setPicked(null); setQ(''); setCount(1);
  };
  const setCountOf = (pid, v) => persist(items.map(x => String(x.productId) === String(pid) ? { ...x, count: Math.max(1, Number(v) || 1) } : x));
  const setHave = (pid, resId, v) => persist(items.map(x => String(x.productId) === String(pid) ? { ...x, have: { ...(x.have || {}), [resId]: Math.max(0, Number(v) || 0) } } : x));
  const remove = (pid) => persist(items.filter(x => String(x.productId) !== String(pid)));

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
            <label>{t('stash.count')}<input type="number" min="1" className="input-field" value={count} onChange={e => setCount(Math.max(1, Number(e.target.value) || 1))} style={{ width: '80px' }} /></label>
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
            const base = flattenBase(it.productId, it.count || 1);
            const rows = Object.keys(base).map(id => {
              const need = base[id];
              const have = Number(it.have?.[id]) || 0;
              return { id, name: itemName(id), grade: itemGrade(id), need, have, left: Math.max(0, need - have) };
            }).sort((a, b) => a.name.localeCompare(b.name));
            const totalNeed = rows.reduce((s, r) => s + r.need, 0);
            const totalHave = rows.reduce((s, r) => s + Math.min(r.have, r.need), 0);
            const pct = totalNeed ? Math.round(totalHave / totalNeed * 100) : 0;
            const ready = rows.length > 0 && rows.every(r => r.have >= r.need);
            return (
              <div key={it.productId} className={`glass-panel stash-row ${ready ? 'stash-row--done' : ''}`}>
                <div className="stash-row-head">
                  <Ic id={it.productId} size={24} />
                  <span className={gradeClass(it.grade)}>{it.grade}</span>
                  <span className="stash-name">{it.name}</span>
                  <label className="stash-craftcount">×<input type="number" min="1" value={it.count || 1} onChange={e => setCountOf(it.productId, e.target.value)} /></label>
                  {ready
                    ? <span className="stash-left stash-left--done"><Hammer size={13} /> {t('stash.canCraft')}</span>
                    : <span className="stash-left">{pct}%</span>}
                  <button className="rb-del" onClick={() => remove(it.productId)} title={t('stash.remove')}><Trash2 size={14} /></button>
                </div>
                <div className="stash-bar"><div className="stash-bar-fill" style={{ width: `${pct}%` }} /></div>
                <div className="stash-res">
                  {rows.map(r => (
                    <div key={r.id} className={`stash-res-row ${r.have >= r.need ? 'stash-res-row--ok' : ''}`}>
                      <Ic id={r.id} size={16} /><span className={gradeClass(r.grade)}>{r.grade}</span>
                      <span className="stash-res-name">{r.name}</span>
                      <span className="stash-res-need">{t('stash.need')} {fmt(r.need)}</span>
                      <input type="number" min="0" className="input-field stash-have-inp" placeholder="0" value={it.have?.[r.id] ?? ''} onChange={e => setHave(it.productId, r.id, e.target.value)} />
                      {r.have >= r.need
                        ? <span className="stash-ok"><Check size={14} /></span>
                        : <span className="stash-res-left">{t('stash.moreNeed', { n: fmt(r.left) })}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
