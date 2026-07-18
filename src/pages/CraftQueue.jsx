import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search, ChevronRight, ChevronDown, User, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { listProducts, flattenBase, itemName, itemGrade, itemIcon } from '../utils/recipeCalc';
import { subscribeToPrices } from '../services/priceService';
import { subscribeToCraftRequests, addCraftRequest, setRequestStatus, deleteCraftRequest, addContribution, removeContribution } from '../services/craftRequestService';

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
  const [contrib, setContrib] = useState({}); // reqId -> { resourceId, qty }

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

  // Заявки, сгруппированные по мемберу (свои — сверху).
  const groups = useMemo(() => {
    const map = new Map();
    for (const r of requests) {
      const key = r.requesterId || r.requesterName || '—';
      if (!map.has(key)) map.set(key, { id: key, name: r.requesterName || '—', reqs: [] });
      map.get(key).reqs.push(r);
    }
    const arr = [...map.values()];
    arr.sort((a, b) => (a.id === currentUser?.uid ? -1 : b.id === currentUser?.uid ? 1 : a.name.localeCompare(b.name)));
    return arr;
  }, [requests, currentUser]);

  const contribSum = (req, resId) => (req.contributions || [])
    .filter(c => String(c.resourceId) === String(resId))
    .reduce((s, c) => s + (Number(c.qty) || 0), 0);

  const sendContribution = async (req) => {
    const cur = contrib[req.id];
    const qty = Number(cur?.qty) || 0;
    if (!cur?.resourceId || qty <= 0) return;
    try {
      await addContribution(req.id, {
        uid: currentUser.uid, name: userNickname || currentUser.email,
        resourceId: String(cur.resourceId), resourceName: itemName(cur.resourceId), qty, at: Date.now(),
      });
      setContrib(s => ({ ...s, [req.id]: { resourceId: '', qty: '' } }));
    } catch { alert(t('cq.error')); }
  };

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
        <div className="cq-groups">
          {groups.map(g => (
            <div key={g.id} className="cq-group">
              <div className="cq-group-head"><User size={13} /> {g.name} <span className="cq-group-count">{g.reqs.length}</span></div>
              <div className="cq-list">
                {g.reqs.map(req => {
                  const rows = baseFor(req);
                  const isOpen = expanded[req.id];
                  const mine = req.requesterId === currentUser?.uid;
                  const done = req.status === 'done';
                  const contribs = req.contributions || [];
                  return (
                    <div key={req.id} className={`glass-panel cq-req ${done ? 'cq-req--done' : ''}`}>
                      <div className="cq-req-head">
                        <button className="rc-node-toggle" onClick={() => setExpanded(p => ({ ...p, [req.id]: !p[req.id] }))}>{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>
                        <Ic id={req.productId} size={22} />
                        <span className="cq-req-name">{req.productName} <span className="cq-req-count">×{req.count}</span></span>
                        {req.note && <span className="cq-req-note">{req.note}</span>}
                        {contribs.length > 0 && <span className="cq-req-coop" title={t('cq.coop')}>🤝 {contribs.length}</span>}
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
                          {rows.map(r => {
                            const got = contribSum(req, r.id);
                            return (
                              <div key={r.id} className="cq-res-row">
                                <Ic id={r.id} size={16} /><span className={gradeClass(r.grade)}>{r.grade}</span>
                                <span className="cq-res-name">{r.name}</span>
                                <span className="cq-res-qty">×{fmt(r.qty)}</span>
                                {got > 0 && <span className={`cq-res-got ${got >= r.qty ? 'cq-res-got--full' : ''}`}>{t('cq.gathered')}: {fmt(got)}</span>}
                                <span className="cq-res-sub">{prices[r.id] ? fmt(r.qty * Number(prices[r.id])) : '—'}</span>
                              </div>
                            );
                          })}
                          <div className="cq-coop">
                            <div className="cq-res-h">{t('cq.coop')}</div>
                            {contribs.map((c, i) => (
                              <div key={i} className="cq-coop-row">
                                <User size={11} /> <span className="cq-coop-name">{c.name}</span>
                                <span className="cq-coop-item">{c.resourceName} ×{fmt(c.qty)}</span>
                                {c.uid === currentUser?.uid && <button className="rb-del" onClick={() => removeContribution(req.id, c)} title={t('cq.removeContrib')}><Trash2 size={12} /></button>}
                              </div>
                            ))}
                            <div className="cq-coop-add">
                              <select className="input-field" value={contrib[req.id]?.resourceId ?? ''} onChange={e => setContrib(s => ({ ...s, [req.id]: { ...s[req.id], resourceId: e.target.value } }))}>
                                <option value="">{t('cq.pickRes')}</option>
                                {rows.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                              </select>
                              <input type="number" min="1" className="input-field" placeholder={t('cq.qty')} value={contrib[req.id]?.qty ?? ''} onChange={e => setContrib(s => ({ ...s, [req.id]: { ...s[req.id], qty: e.target.value } }))} style={{ width: '90px' }} />
                              <button className="btn btn-sm btn-primary" onClick={() => sendContribution(req)}><Plus size={13} /> {t('cq.iSent')}</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
