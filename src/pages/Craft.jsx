import React, { useEffect, useMemo, useState } from 'react';
import { Hammer, RotateCcw } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

// Рецепты сосок (данные из таблицы «Луч КП Дикей»).
// qty ингредиентов фиксированы рецептом; цены материалов/рынка — редактируемые.
const RECIPES = [
  { id: 'ssd', name: 'Soulshot D — физ', dc: 1, so: 3, output: 200, market: 7 },
  { id: 'ssnd', name: 'Spiritshot D — маг', dc: 1, so: 3, output: 140, market: 20 },
  { id: 'bssd', name: 'Blessed Spiritshot D — маг', dc: 2, so: 8, output: 120, market: 43 },
];

const DEFAULTS = { dc: 274, so: 300, fee: 0, crafts: 100 };
const STORE = 'craftCalc';

const load = () => {
  try { return { ...DEFAULTS, markets: {}, ...JSON.parse(localStorage.getItem(STORE) || '{}') }; }
  catch { return { ...DEFAULTS, markets: {} }; }
};

export const Craft = () => {
  const { t } = useLang();
  const [state, setState] = useState(load);

  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(state)); }, [state]);

  const marketOf = (r) => (state.markets?.[r.id] ?? r.market);
  const setMarket = (id, v) => setState(s => ({ ...s, markets: { ...s.markets, [id]: Number(v) || 0 } }));
  const setNum = (k, v) => setState(s => ({ ...s, [k]: Number(v) || 0 }));
  const reset = () => setState({ ...DEFAULTS, markets: {} });

  const fmt = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n);

  const rows = useMemo(() => RECIPES.map(r => {
    const costCraft = r.dc * state.dc + r.so * state.so + state.fee;
    const costShot = costCraft / r.output;
    const market = marketOf(r);
    const saleCraft = r.output * market;
    const profitCraft = saleCraft - costCraft;
    const pct = costCraft ? (profitCraft / costCraft) * 100 : 0;
    const totalProfit = profitCraft * state.crafts;
    return { r, costCraft, costShot, market, profitCraft, pct, totalProfit };
  }), [state]);

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}><Hammer size={22} /> {t('craft.title')}</h2>
        <button className="btn btn-sm" onClick={reset}><RotateCcw size={14} /> {t('craft.reset')}</button>
      </div>

      <div className="glass-panel mb-4">
        <h3 className="section-header">{t('craft.prices')}</h3>
        <div className="craft-inputs">
          <label>{t('craft.dc')}<input type="number" className="input-field" value={state.dc} onChange={e => setNum('dc', e.target.value)} /></label>
          <label>{t('craft.so')}<input type="number" className="input-field" value={state.so} onChange={e => setNum('so', e.target.value)} /></label>
          <label>{t('craft.fee')}<input type="number" className="input-field" value={state.fee} onChange={e => setNum('fee', e.target.value)} /></label>
          <label>{t('craft.crafts')}<input type="number" className="input-field" value={state.crafts} onChange={e => setNum('crafts', e.target.value)} /></label>
        </div>
        <p className="craft-hint">{t('craft.hint')}</p>
      </div>

      <div className="glass-panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="craft-table">
            <thead>
              <tr>
                <th>{t('craft.recipe')}</th>
                <th>{t('craft.ingredients')}</th>
                <th>{t('craft.output')}</th>
                <th>{t('craft.market')}</th>
                <th>{t('craft.costShot')}</th>
                <th>{t('craft.profitCraft')}</th>
                <th>{t('craft.pct')}</th>
                <th>{t('craft.totalProfit')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ r, costShot, market, profitCraft, pct, totalProfit }) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td className="text-secondary">{r.dc}× D-Crystal + {r.so}× Soul Ore</td>
                  <td>{r.output}</td>
                  <td>
                    <input type="number" className="input-field craft-market" value={market} onChange={e => setMarket(r.id, e.target.value)} />
                  </td>
                  <td className="text-secondary">{fmt(costShot)}</td>
                  <td className={profitCraft >= 0 ? 'text-success' : 'text-danger'}>{fmt(profitCraft)}</td>
                  <td className={pct >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>{fmt(pct)}%</td>
                  <td className={totalProfit >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>{fmt(totalProfit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="craft-hint" style={{ marginTop: '0.75rem' }}>{t('craft.note')}</p>
      </div>
    </div>
  );
};
