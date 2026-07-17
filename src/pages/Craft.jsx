import React, { useEffect, useMemo, useState } from 'react';
import { Hammer, RotateCcw, ChevronRight, ChevronDown, Search, Lightbulb, ShoppingCart, ExternalLink } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  listProducts, flattenBase, buildTree, itemName, itemGrade, itemIcon, hasRecipe,
  itemStats, wikiUrl, RECIPES, PRODUCT_TYPES,
} from '../utils/recipeCalc';
import { subscribeToPrices, setSharedPrice } from '../services/priceService';
import { openExternal } from '../utils/openExternal';
import { CraftQueue } from './CraftQueue';
import { LU4_CRAFT } from '../data/lu4Roadmap';

const fmt = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(n);
const gradeClass = (g) => `grade-badge grade-${(g || 'NG').toLowerCase()}`;

const Icon = ({ id, size = 20 }) => {
  const src = itemIcon(id);
  if (!src) return <span className="item-icon item-icon--none" style={{ width: size, height: size }} />;
  return <img className="item-icon" src={src} alt="" width={size} height={size} loading="lazy" onError={e => { e.target.style.visibility = 'hidden'; }} />;
};

// Инпут цены: у офицеров редактируемый (коммит по blur), у мемберов только чтение.
const PriceInput = ({ value, editable, onCommit }) => {
  const [v, setV] = useState(value ?? '');
  useEffect(() => { setV(value ?? ''); }, [value]);
  return (
    <input type="number" className="input-field craft-market" value={v} placeholder="0" readOnly={!editable}
      onChange={e => setV(e.target.value)} onBlur={() => editable && onCommit(v)} />
  );
};

// ---------- Полный калькулятор рецептов ----------
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
  const { isOfficer } = useAuth();
  const [grade, setGrade] = useState('all');
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [count, setCount] = useState(1);
  const [prices, setPrices] = useState({}); // общий прайс-лист (config/prices)
  const [buyArr, setBuyArr] = useState(() => loadJSON(BUY_KEY, '[]'));
  const [showTree, setShowTree] = useState(false);

  const buy = useMemo(() => new Set(buyArr.map(String)), [buyArr]);
  useEffect(() => { const unsub = subscribeToPrices(setPrices); return () => unsub(); }, []);
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
  const setPrice = (id, v) => { if (isOfficer) setSharedPrice(id, v).catch(() => {}); };
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
                      </td>
                      <td>{fmt(r.qty)}</td>
                      <td><PriceInput value={prices[r.id]} editable={isOfficer} onCommit={(v) => setPrice(r.id, v)} /></td>
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

// ---------- Расчёт сосок по 4 грейдам (Д/Ц/Б/А) + рекомендация КП Дикей ----------
const SHOT_TYPES = [
  { id: 'soul', name: 'Soulshot (физ)', ore: 'soul', out: { D: 200, C: 600, B: 450, A: 300 } },
  { id: 'spirit', name: 'Spiritshot (маг)', ore: 'spirit', out: { D: 140, C: 270, B: 150, A: 200 } },
  { id: 'bspirit', name: 'Blessed Spiritshot (маг)', ore: 'spirit', out: { D: 120, C: 240, B: 100, A: 200 } },
];
const SHOT_GRADES = ['D', 'C', 'B', 'A'];
// дефолтные кол-ва материалов на 1 крафт (редактируемые — точные значения зависят от сервера)
const DEF_RECIPE = {
  soul: { D: { c: 1, o: 3 }, C: { c: 1, o: 6 }, B: { c: 2, o: 12 }, A: { c: 2, o: 25 } },
  spirit: { D: { c: 1, o: 5 }, C: { c: 1, o: 10 }, B: { c: 2, o: 20 }, A: { c: 2, o: 40 } },
  bspirit: { D: { c: 1, o: 6 }, C: { c: 1, o: 15 }, B: { c: 2, o: 35 }, A: { c: 2, o: 70 } },
};
const DEF_MARKET = { soul: { D: 7, C: 14, B: 28, A: 55 }, spirit: { D: 20, C: 40, B: 80, A: 160 }, bspirit: { D: 43, C: 90, B: 180, A: 360 } };
const SHOT_STORE = 'shotsCalc2';

const ShotsCalc = () => {
  const { t } = useLang();
  const [type, setType] = useState('soul');
  const [grade, setGrade] = useState('D');
  const [st, setSt] = useState(() => ({
    crystal: { D: 274, C: 0, B: 0, A: 0 }, soulOre: 300, spiritOre: 0, fee: 0, crafts: 100, recipe: {}, market: {},
    ...(() => { try { return JSON.parse(localStorage.getItem(SHOT_STORE) || '{}'); } catch { return {}; } })(),
  }));
  useEffect(() => { localStorage.setItem(SHOT_STORE, JSON.stringify(st)); }, [st]);

  const tObj = SHOT_TYPES.find(x => x.id === type);
  const key = `${type}_${grade}`;
  const out = tObj.out[grade];
  const rc = st.recipe[key] || DEF_RECIPE[type][grade];
  const market = st.market[key] ?? DEF_MARKET[type][grade];
  const orePrice = tObj.ore === 'soul' ? st.soulOre : st.spiritOre;
  const oreName = tObj.ore === 'soul' ? 'Soul Ore' : 'Spirit Ore';

  const costCraft = rc.c * (st.crystal[grade] || 0) + rc.o * (orePrice || 0) + (st.fee || 0);
  const costShot = costCraft / out;
  const profitCraft = out * market - costCraft;
  const pct = costCraft ? profitCraft / costCraft * 100 : 0;
  const totalProfit = profitCraft * (st.crafts || 0);

  const setCrystal = (g, v) => setSt(s => ({ ...s, crystal: { ...s.crystal, [g]: Number(v) || 0 } }));
  const setField = (k, v) => setSt(s => ({ ...s, [k]: Number(v) || 0 }));
  const setRc = (f, v) => setSt(s => ({ ...s, recipe: { ...s.recipe, [key]: { ...rc, [f]: Number(v) || 0 } } }));
  const setMk = (v) => setSt(s => ({ ...s, market: { ...s.market, [key]: Number(v) || 0 } }));

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
        <div className="craft-inputs">
          <label>{t('craft.shotType')}
            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
              {SHOT_TYPES.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </label>
          <label>{t('craft.grade')}
            <select className="input-field" value={grade} onChange={e => setGrade(e.target.value)}>
              {SHOT_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>Crystal ({grade}) ×<input type="number" className="input-field" value={rc.c} onChange={e => setRc('c', e.target.value)} /></label>
          <label>{oreName} ×<input type="number" className="input-field" value={rc.o} onChange={e => setRc('o', e.target.value)} /></label>
          <label>{t('craft.output')}<input type="number" className="input-field" value={out} readOnly /></label>
          <label>{t('craft.market')}<input type="number" className="input-field" value={market} onChange={e => setMk(e.target.value)} /></label>
        </div>
        <p className="craft-hint">{t('craft.shotsHint')}</p>
      </div>

      <div className="glass-panel mb-4">
        <h3 className="section-header">{t('craft.prices')}</h3>
        <div className="craft-inputs">
          {SHOT_GRADES.map(g => (
            <label key={g}>Crystal ({g})<input type="number" className="input-field" value={st.crystal[g] ?? 0} onChange={e => setCrystal(g, e.target.value)} /></label>
          ))}
          <label>Soul Ore ({t('craft.shop')})<input type="number" className="input-field" value={st.soulOre} onChange={e => setField('soulOre', e.target.value)} /></label>
          <label>Spirit Ore ({t('craft.shop')})<input type="number" className="input-field" value={st.spiritOre} onChange={e => setField('spiritOre', e.target.value)} /></label>
          <label>{t('craft.fee')}<input type="number" className="input-field" value={st.fee} onChange={e => setField('fee', e.target.value)} /></label>
          <label>{t('craft.crafts')}<input type="number" className="input-field" value={st.crafts} onChange={e => setField('crafts', e.target.value)} /></label>
        </div>
      </div>

      <div className="glass-panel">
        <div className="shots-result">
          <div><span className="rc-total-label">{t('craft.costShot')}</span><span className="rc-total-val">{fmt(costShot)}</span></div>
          <div><span className="rc-total-label">{t('craft.profitCraft')}</span><span className={`rc-total-val ${profitCraft >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(profitCraft)}</span></div>
          <div><span className="rc-total-label">{t('craft.pct')}</span><span className={`rc-total-val ${pct >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(pct)}%</span></div>
          <div><span className="rc-total-label">{t('craft.totalProfit')}</span><span className={`rc-total-val ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(totalProfit)}</span></div>
        </div>
        <p className="craft-hint" style={{ marginTop: '0.75rem' }}>{t('craft.note')}</p>
      </div>
    </>
  );
};

export const Craft = () => {
  const { t } = useLang();
  const [tab, setTab] = useState('recipes');
  const clearPrices = () => { if (window.confirm(t('craft.resetConfirm'))) { localStorage.removeItem('matPrices'); localStorage.removeItem('craftBuy'); localStorage.removeItem('craftCalc'); localStorage.removeItem('shotsCalc2'); window.location.reload(); } };
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}><Hammer size={22} /> {t('craft.title')}</h2>
        <button className="btn btn-sm" onClick={clearPrices}><RotateCcw size={14} /> {t('craft.reset')}</button>
      </div>
      <div className="craft-tabs">
        <button className={tab === 'recipes' ? 'active' : ''} onClick={() => setTab('recipes')}>{t('craft.tabRecipes')}</button>
        <button className={tab === 'shots' ? 'active' : ''} onClick={() => setTab('shots')}>{t('craft.tabShots')}</button>
        <button className={tab === 'queue' ? 'active' : ''} onClick={() => setTab('queue')}>{t('craft.tabQueue')}</button>
      </div>
      {tab === 'recipes' ? <RecipeCalc /> : tab === 'shots' ? <ShotsCalc /> : <CraftQueue />}
    </div>
  );
};
