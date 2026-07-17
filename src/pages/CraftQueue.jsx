import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search, ChevronRight, ChevronDown, User, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { listProducts, flattenBase, itemName, itemGrade, itemIcon } from '../utils/recipeCalc';
import { subscribeToPrices } from '../services/priceService';
import { subscribeToCraftRequests, addCraftRequest, setRequestStatus, deleteCraftRequest } from '../services/craftRequestService';

const fmt = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(n);
const gradeClass = (g) => `grade-badge grade-${(g || 'NG').toLowerCase()}`;
const Ic = ({ id, size = 18 }) => { const s = itemIcon(id); return s ? <img className="item-icon" src={s} alt="" title={itemName(id)} width={size} height={size} loading="lazy" onError={e => { e.target.style.visibility = 'hidden'; }} /> : <span className="item-icon item-icon--none" style={{ width: size, height: size }} />; };

export const CraftQueue = () => {
  const { currentUser, userNickname, isOfficer } = useAuth();
  const { t } = useLang();
  const [requests, setRequests] = useState([]);
  const [prices, setPrices] = useState({});
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState(null);
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const u1 = subscribeToCraftRequests(setRequests);
    const u2 = subscribeToPrices(setPrices);
    return () => { u1(); u2(); };
  }, []);

  const results = useMemo(() => (q.trim().length >= 2 ? listProducts({ q }).slice(0, 25) : []), [q]);

  const submit = async () => {
    if (!picked) return;
    try {
      await addCraftRequest(picked.id, picked.name, count, note.trim(), currentUser.uid, userNickname || currentUser.email);
      setPicked(null); setQ(''); setCount(1); setNote('');
    } catch { alert(t('cq.error')); }
  };

  const baseFor = (req) => Object.entries(flattenBase(req.productId, req.count || 1))
    .map(([id, qty]) => ({ id, name: itemName(id), grade: itemGrade(id), qty }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const costOf = (rows) => rows.reduce((s, r) => s + r.qty * (Number(prices[r.id]) || 0), 0);

  return (
    <>
      <div className="glass-panel mb-4">
        <h3 className="section-header">{t('cq.new')}</h3>
        {!picked ? (
          <>
            <div className="rc-search">
              <Search size={14} />
              <input className="input-field" placeholder={t('cq.searchItem')} value={q} onChange={e => setQ(e.target.value)} />
            </div>
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
            <label>{t('cq.count')}<input type="number" min="1" className="input-field" value={count} onChange={e => setCount(Math.max(1, Number(e.target.value) || 1))} style={{ width: '80px' }} /></label>
            <input className="input-field" placeholder={t('cq.note')} value={note} onChange={e => setNote(e.target.value)} style={{ flex: 1, minWidth: '140px' }} />
            <button className="btn btn-sm" onClick={() => setPicked(null)}>{t('cq.change')}</button>
            <button className="btn btn-primary btn-sm" onClick={submit}><Plus size={14} /> {t('cq.submit')}</button>
          </div>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="glass-panel"><p className="text-center text-muted" style={{ padding: '2rem' }}>{t('cq.empty')}</p></div>
      ) : (
        <div className="cq-list">
          {requests.map(req => {
            const rows = baseFor(req);
            const isOpen = expanded[req.id];
            const mine = req.requesterId === currentUser?.uid;
            const done = req.status === 'done';
            return (
              <div key={req.id} className={`glass-panel cq-req ${done ? 'cq-req--done' : ''}`}>
                <div className="cq-req-head">
                  <button className="rc-node-toggle" onClick={() => setExpanded(p => ({ ...p, [req.id]: !p[req.id] }))}>{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>
                  <Ic id={req.productId} size={22} />
                  <span className="cq-req-name">{req.productName} <span className="cq-req-count">×{req.count}</span></span>
                  <span className="cq-req-by"><User size={11} /> {req.requesterName}</span>
                  {req.note && <span className="cq-req-note">{req.note}</span>}
                  <span className="cq-req-cost">{fmt(costOf(rows))}</span>
                  <div className="cq-req-actions">
                    {(isOfficer || mine) && (
                      <button className="btn btn-sm" onClick={() => setRequestStatus(req.id, done ? 'open' : 'done')} title={t('cq.toggleDone')}>
                        {done ? <CheckCircle2 size={14} color="var(--success)" /> : <Circle size={14} />}
                      </button>
                    )}
                    {(isOfficer || mine) && <button className="rb-del" onClick={() => { if (window.confirm(t('cq.deleteConfirm'))) deleteCraftRequest(req.id); }}><Trash2 size={14} /></button>}
                  </div>
                </div>
                {isOpen && (
                  <div className="cq-res">
                    <div className="cq-res-h">{t('cq.needRes')}</div>
                    {rows.map(r => (
                      <div key={r.id} className="cq-res-row">
                        <Ic id={r.id} size={16} /><span className={gradeClass(r.grade)}>{r.grade}</span>
                        <span className="cq-res-name">{r.name}</span>
                        <span className="cq-res-qty">×{fmt(r.qty)}</span>
                        <span className="cq-res-sub">{prices[r.id] ? fmt(r.qty * Number(prices[r.id])) : '—'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
