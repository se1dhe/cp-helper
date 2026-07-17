import React, { useEffect, useMemo, useState } from 'react';
import { Hammer, RotateCcw, ChevronRight, ChevronDown, Search, Lightbulb, ShoppingCart, MapPin, ExternalLink } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import {
  listProducts, flattenBase, buildTree, itemName, itemGrade, itemIcon, hasRecipe,
  itemStats, wikiUrl, RECIPES, PRODUCT_TYPES,
} from '../utils/recipeCalc';
import { SPOIL_HINTS } from '../data/spoilHints';
import { openExternal } from '../utils/openExternal';
import { LU4_CRAFT } from '../data/lu4Roadmap';

const fmt = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(n);
const gradeClass = (g) => `grade-badge grade-${(g || 'NG').toLowerCase()}`;

const Icon = ({ id, size = 20 }) => {
  const src = itemIcon(id);
  if (!src) return <span className="item-icon item-icon--none" style={{ width: size, height: size }} />;
  return <img className="item-icon" src={src} alt="" width={size} height={size} loading="lazy" onError={e => { e.target.style.visibility = 'hidden'; }} />;
};

// ---------- Полный калькулятор рецептов ----------
const PRICES_KEY = 'matPrices';
const BUY_KEY = 'craftBuy';
const loadJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || d); } catch { return JSON.parse(d); } };

const RecipeNode = ({ node, prices, buy, toggleBuy, t }) => {
  const [open, setOpen] = useState(false);
  const inBuy = buy.has(String(node.id));
  const expandable = node.crafted && !inBuy && node.children;
  return (
    <div className="rc-node">
      <div className="rc-node-row">
        {expandable ? (
          <button className="rc-node-toggle" onClick={() => setOpen(o => !o)}>{open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</button>
        ) : <span className="rc-node-dot" />}
        <Icon id={node.id} size={18} />
        <span className={gradeClass(node.grade)}>{node.grade}</span>
        <span className="rc-node-name">{node.name}</span>
        <span className="rc-node-qty">×{fmt(node.count)}</span>
        {node.crafted && (
          <button className="rc-buy-toggle" onClick={() => toggleBuy(node.id)} title={inBuy ? t('craft.doCraft') : t('craft.doBuy')}>
            {inBuy ? <><Hammer size={11} /> {t('craft.craftIt')}</> : <><ShoppingCart size={11} /> {t('craft.buyIt')}</>}
          </button>
        )}
      </div>
      {expandable && open && (
        <div className="rc-node-children">
          {node.children.map((c, i) => <RecipeNode key={i} node={c} prices={prices} buy={buy} toggleBuy={toggleBuy} t={t} />)}
        </div>
      )}
    </div>
  );
};

const RecipeCalc = () => {
  const { t } = useLang();
  const [grade, setGrade] = useState('all');
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [count, setCount] = useState(1);
  const [prices, setPrices] = useState(() => loadJSON(PRICES_KEY, '{}'));
  const [buyArr, setBuyArr] = useState(() => loadJSON(BUY_KEY, '[]'));
  const [showTree, setShowTree] = useState(false);

  const buy = useMemo(() => new Set(buyArr.map(String)), [buyArr]);
  useEffect(() => { localStorage.setItem(PRICES_KEY, JSON.stringify(prices)); }, [prices]);
  useEffect(() => { localStorage.setItem(BUY_KEY, JSON.stringify(buyArr)); }, [buyArr]);

  const products = useMemo(() => listProducts({ grade, type, q }), [grade, type, q]);
  const rec = selected ? RECIPES[selected] : null;
  const base = useMemo(() => (selected ? flattenBase(selected, count, buy) : {}), [selected, count, buy]);
  const tree = useMemo(() => (selected && showTree ? buildTree(selected, count, buy) : null), [selected, count, showTree, buy]);

  const baseRows = useMemo(() => Object.keys(base)
    .map(id => ({ id, name: itemName(id), grade: itemGrade(id), qty: base[id], craftable: hasRecipe(id) }))
    .sort((a, b) => a.name.localeCompare(b.name)), [base]);

  const total = baseRows.reduce((s, r) => s + r.qty * (Number(prices[r.id]) || 0), 0);
  const outCount = (rec ? rec.q : 1) * count;
  const setPrice = (id, v) => setPrices(p => ({ ...p, [id]: Number(v) || 0 }));
  const toggleBuy = (id) => setBuyArr(a => a.map(String).includes(String(id)) ? a.filter(x => String(x) !== String(id)) : [...a, String(id)]);

  return (
    <div className="rc-grid">
      <div className="rc-list-col glass-panel">
        <div className="rc-filters">
          <div className="rc-search">
            <Search size={14} />
            <input className="input-field" placeholder={t('craft.search')} value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <select className="input-field" value={grade} onChange={e => setGrade(e.target.value)}>
              <option value="all">{t('craft.allGrades')}</option>
              {['NG', 'D', 'C', 'B', 'A'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
              <option value="all">{t('craft.allTypes')}</option>
              {PRODUCT_TYPES.map(tp => <option key={tp} value={tp}>{t(`craft.type.${tp}`)}</option>)}
            </select>
          </div>
          <span className="rc-count-label">{t('craft.found', { n: products.length })}</span>
        </div>
        <div className="rc-list">
          {products.map(p => (
            <button key={p.id} className={`rc-item ${selected === p.id ? 'rc-item--active' : ''}`} onClick={() => setSelected(p.id)}>
              <Icon id={p.id} size={20} />
              <span className={gradeClass(p.grade)}>{p.grade}</span>
              <span className="rc-item-name">{p.name}</span>
            </button>
          ))}
          {products.length === 0 && <div className="rc-empty">{t('craft.nothing')}</div>}
        </div>
      </div>

      <div className="rc-detail-col glass-panel">
        {!selected ? (
          <div className="rc-empty" style={{ padding: '2rem' }}>{t('craft.pick')}</div>
        ) : (
          <>
            <div className="rc-detail-head">
              <Icon id={selected} size={28} />
              <span className={gradeClass(itemGrade(selected))}>{itemGrade(selected)}</span>
              <h3 className="rc-detail-title">{itemName(selected)}</h3>
            </div>
            <div className="rc-detail-meta">
              {t('craft.output')}: {rec.q} · {t('craft.success')}: {rec.s}%
              <label className="rc-count">{t('craft.craftCount')}
                <input type="number" min="1" className="input-field" value={count} onChange={e => setCount(Math.max(1, Number(e.target.value) || 1))} />
              </label>
              <button className="rc-wiki-btn" onClick={() => openExternal(wikiUrl(selected))}><ExternalLink size={12} /> {t('craft.onWiki')}</button>
            </div>

            {itemStats(selected) && (
              <div className="rc-stats">
                {Object.entries(itemStats(selected)).map(([k, v]) => <span key={k} className="rc-stat"><b>{k}:</b> {v}</span>)}
              </div>
            )}

            <h4 className="rc-section-h">{t('craft.baseRes')}</h4>
            <div style={{ overflowX: 'auto' }}>
              <table className="craft-table">
                <thead>
                  <tr><th>{t('craft.resource')}</th><th>{t('craft.qty')}</th><th>{t('craft.price')}</th><th>{t('craft.sum')}</th></tr>
                </thead>
                <tbody>
                  {baseRows.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="rc-res-line">
                          <span className="rc-res-name"><Icon id={r.id} size={18} /> <span className={gradeClass(r.grade)}>{r.grade}</span> {r.name}</span>
                          {r.craftable && (
                            <button className="rc-buy-toggle rc-buy-toggle--inline" onClick={() => toggleBuy(r.id)}>
                              <Hammer size={10} /> {t('craft.craftIt')}
                            </button>
                          )}
                          <button className="rc-wiki" onClick={() => openExternal(wikiUrl(r.id))} title={t('craft.whereGet')}><ExternalLink size={11} /></button>
                        </div>
                        {SPOIL_HINTS[r.id] && <span className="rc-spoil"><MapPin size={10} /> {SPOIL_HINTS[r.id]}</span>}
                      </td>
                      <td>{fmt(r.qty)}</td>
                      <td><input type="number" className="input-field craft-market" value={prices[r.id] ?? ''} placeholder="0" onChange={e => setPrice(r.id, e.target.value)} /></td>
                      <td className="text-secondary">{fmt(r.qty * (Number(prices[r.id]) || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rc-totals">
              <div><span className="rc-total-label">{t('craft.totalCost')}</span><span className="rc-total-val">{fmt(total)}</span></div>
              <div><span className="rc-total-label">{t('craft.perUnit')}</span><span className="rc-total-val text-gold">{fmt(total / (outCount || 1))}</span></div>
            </div>

            <button className="btn btn-sm mt-2" onClick={() => setShowTree(s => !s)}>
              {showTree ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {t('craft.tree')}
            </button>
            {showTree && tree && <div className="rc-tree">{tree.children?.map((c, i) => <RecipeNode key={i} node={c} prices={prices} buy={buy} toggleBuy={toggleBuy} t={t} />)}</div>}
            <p className="craft-hint" style={{ marginTop: '0.75rem' }}>{t('craft.baseNote')}</p>
          </>
        )}
      </div>
    </div>
  );
};

// ---------- Быстрый расчёт сосок + рекомендация КП Дикей ----------
const SHOT_RECIPES = [
  { id: 'ssd', name: 'Soulshot D — физ', dc: 1, so: 3, output: 200, market: 7 },
  { id: 'ssnd', name: 'Spiritshot D — маг', dc: 1, so: 3, output: 140, market: 20 },
  { id: 'bssd', name: 'Blessed Spiritshot D — маг', dc: 2, so: 8, output: 120, market: 43 },
];
const SHOT_DEFAULTS = { dc: 274, so: 300, fee: 0, crafts: 100 };
const SHOT_STORE = 'craftCalc';
const loadShots = () => { try { return { ...SHOT_DEFAULTS, markets: {}, ...JSON.parse(localStorage.getItem(SHOT_STORE) || '{}') }; } catch { return { ...SHOT_DEFAULTS, markets: {} }; } };

const ShotsCalc = () => {
  const { t } = useLang();
  const [state, setState] = useState(loadShots);
  useEffect(() => { localStorage.setItem(SHOT_STORE, JSON.stringify(state)); }, [state]);
  const marketOf = (r) => (state.markets?.[r.id] ?? r.market);
  const setMarket = (id, v) => setState(s => ({ ...s, markets: { ...s.markets, [id]: Number(v) || 0 } }));
  const setNum = (k, v) => setState(s => ({ ...s, [k]: Number(v) || 0 }));
  const rows = SHOT_RECIPES.map(r => {
    const costCraft = r.dc * state.dc + r.so * state.so + state.fee;
    const market = marketOf(r);
    const profitCraft = r.output * market - costCraft;
    const pct = costCraft ? (profitCraft / costCraft) * 100 : 0;
    return { r, costShot: costCraft / r.output, market, profitCraft, pct, total: profitCraft * state.crafts };
  });
  return (
    <>
      <div className="reco-card mb-4">
        <div className="reco-head"><Lightbulb size={15} /> {t('craft.recoTitle')}</div>
        <p className="reco-intro">{LU4_CRAFT.intro}</p>
        <ul className="reco-list">
          {LU4_CRAFT.nukeMath.map((x, i) => <li key={`n${i}`}>{x}</li>)}
          {LU4_CRAFT.tips.map((x, i) => <li key={`t${i}`}>{x}</li>)}
        </ul>
        <span className="reco-source">{t('craft.recoSource')}</span>
      </div>

      <div className="glass-panel mb-4">
        <h3 className="section-header">{t('craft.prices')}</h3>
        <div className="craft-inputs">
          <label>{t('craft.dc')}<input type="number" className="input-field" value={state.dc} onChange={e => setNum('dc', e.target.value)} /></label>
          <label>{t('craft.so')}<input type="number" className="input-field" value={state.so} onChange={e => setNum('so', e.target.value)} /></label>
          <label>{t('craft.fee')}<input type="number" className="input-field" value={state.fee} onChange={e => setNum('fee', e.target.value)} /></label>
          <label>{t('craft.crafts')}<input type="number" className="input-field" value={state.crafts} onChange={e => setNum('crafts', e.target.value)} /></label>
        </div>
      </div>
      <div className="glass-panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="craft-table">
            <thead><tr>
              <th>{t('craft.recipe')}</th><th>{t('craft.ingredients')}</th><th>{t('craft.output')}</th>
              <th>{t('craft.market')}</th><th>{t('craft.costShot')}</th><th>{t('craft.profitCraft')}</th><th>{t('craft.pct')}</th><th>{t('craft.totalProfit')}</th>
            </tr></thead>
            <tbody>
              {rows.map(({ r, costShot, market, profitCraft, pct, total }) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td className="text-secondary">{r.dc}× D-Crystal + {r.so}× Soul Ore</td>
                  <td>{r.output}</td>
                  <td><input type="number" className="input-field craft-market" value={market} onChange={e => setMarket(r.id, e.target.value)} /></td>
                  <td className="text-secondary">{fmt(costShot)}</td>
                  <td className={profitCraft >= 0 ? 'text-success' : 'text-danger'}>{fmt(profitCraft)}</td>
                  <td className={pct >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>{fmt(pct)}%</td>
                  <td className={total >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>{fmt(total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="craft-hint" style={{ marginTop: '0.75rem' }}>{t('craft.note')}</p>
      </div>
    </>
  );
};

export const Craft = () => {
  const { t } = useLang();
  const [tab, setTab] = useState('recipes');
  const clearPrices = () => { if (window.confirm(t('craft.resetConfirm'))) { localStorage.removeItem('matPrices'); localStorage.removeItem('craftBuy'); localStorage.removeItem('craftCalc'); window.location.reload(); } };
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}><Hammer size={22} /> {t('craft.title')}</h2>
        <button className="btn btn-sm" onClick={clearPrices}><RotateCcw size={14} /> {t('craft.reset')}</button>
      </div>
      <div className="craft-tabs">
        <button className={tab === 'recipes' ? 'active' : ''} onClick={() => setTab('recipes')}>{t('craft.tabRecipes')}</button>
        <button className={tab === 'shots' ? 'active' : ''} onClick={() => setTab('shots')}>{t('craft.tabShots')}</button>
      </div>
      {tab === 'recipes' ? <RecipeCalc /> : <ShotsCalc />}
    </div>
  );
};
