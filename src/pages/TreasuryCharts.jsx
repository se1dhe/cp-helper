import React, { useMemo, useState } from 'react';
import { BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const fmt = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
const dayKey = (d) => d.toISOString().slice(0, 10);

export const TreasuryCharts = ({ transactions }) => {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const { points, contributors } = useMemo(() => {
    const byDay = {};
    const contrib = {};
    for (const tx of transactions) {
      const d = tx.timestamp?.toDate?.();
      if (!d) continue;
      if (tx.currency === 'adena') {
        const amt = (tx.type === 'income' ? 1 : -1) * (Number(tx.amount) || 0);
        byDay[dayKey(d)] = (byDay[dayKey(d)] || 0) + amt;
        if (tx.type === 'income') contrib[tx.member || '—'] = (contrib[tx.member || '—'] || 0) + (Number(tx.amount) || 0);
      }
    }
    const days = Object.keys(byDay).sort();
    let run = 0;
    const pts = days.map(k => { run += byDay[k]; return { day: k, val: run }; });
    const top = Object.entries(contrib).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return { points: pts, contributors: top };
  }, [transactions]);

  if (transactions.length === 0) return null;

  // Линейный график баланса
  const W = 640, H = 150, PAD = 8;
  const vals = points.map(p => p.val);
  const maxV = Math.max(0, ...vals), minV = Math.min(0, ...vals);
  const range = (maxV - minV) || 1;
  const x = (i) => PAD + (points.length <= 1 ? 0 : (i / (points.length - 1)) * (W - 2 * PAD));
  const y = (v) => H - PAD - ((v - minV) / range) * (H - 2 * PAD);
  const line = points.map((p, i) => `${x(i)},${y(p.val)}`).join(' ');
  const area = points.length ? `${x(0)},${H - PAD} ${line} ${x(points.length - 1)},${H - PAD}` : '';
  const zeroY = y(0);

  const maxContrib = Math.max(1, ...contributors.map(c => c[1]));

  return (
    <div className="tc-wrap">
      <button className="section-header section-header--clickable" onClick={() => setOpen(o => !o)}>
        <BarChart3 size={15} /> {t('charts.title')}
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="tc-body">
          <div className="tc-block">
            <h4 className="tc-h">{t('charts.balance')}</h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="tc-svg" preserveAspectRatio="none">
              <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
              {area && <polygon points={area} fill="var(--gold-glow)" />}
              <polyline points={line} fill="none" stroke="var(--gold-light)" strokeWidth="2" />
            </svg>
            <div className="tc-axis"><span>{points[0]?.day}</span><span>{fmt(vals[vals.length - 1] || 0)}</span><span>{points[points.length - 1]?.day}</span></div>
          </div>

          <div className="tc-block">
            <h4 className="tc-h">{t('charts.contrib')}</h4>
            <div className="tc-bars">
              {contributors.map(([name, val]) => (
                <div key={name} className="tc-bar-row">
                  <span className="tc-bar-name">{name}</span>
                  <div className="tc-bar-track"><div className="tc-bar-fill" style={{ width: `${(val / maxContrib) * 100}%` }} /></div>
                  <span className="tc-bar-val">{fmt(val)}</span>
                </div>
              ))}
              {contributors.length === 0 && <span className="text-muted">{t('charts.noData')}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
