import React from 'react';
import { Users, Shield } from 'lucide-react';

const ROSTER = [
  { className: 'Sorcerer', abbr: 'S', type: 'mage', color: '#60a5fa', name: '—', lvl: 1 },
  { className: 'Sorcerer', abbr: 'S', type: 'mage', color: '#60a5fa', name: '—', lvl: 1 },
  { className: 'Sorcerer', abbr: 'S', type: 'mage', color: '#60a5fa', name: '—', lvl: 1 },
  { className: 'Terramancer', abbr: 'T', type: 'mage', color: '#a78bfa', name: '—', lvl: 1 },
  { className: 'Blade Dancer', abbr: 'BD', type: 'fighter', color: '#ef4444', name: '—', lvl: 1 },
  { className: 'Sword Singer', abbr: 'SS', type: 'buffer', color: '#fbbf24', name: '—', lvl: 1 },
  { className: 'Shillien Elder', abbr: 'ShE', type: 'support', color: '#34d399', name: '—', lvl: 1 },
  { className: 'Elven Elder', abbr: 'EE', type: 'support', color: '#34d399', name: '—', lvl: 1 },
  { className: 'Overlord', abbr: 'OL', type: 'buffer', color: '#fbbf24', name: '—', lvl: 1 },
];

export const Roster = () => {
  return (
    <div className="fade-in">
      <h2 className="page-title"><Shield size={22} /> Ростер пати (0utLaw)</h2>

      <div className="members-grid">
        {ROSTER.map((m, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div
                className={`member-card-icon member-card-icon--${m.type}`}
                style={{ width: '56px', height: '56px', fontSize: '1rem' }}
              >
                {m.abbr}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {m.name === '—' ? 'Не назначен' : m.name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: m.color, fontWeight: 600, marginTop: '0.15rem' }}>
                  {m.className}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Уровень
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {m.lvl}
                </div>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Роль
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: m.color }}>
                  {m.type === 'mage' ? 'ДД' : m.type === 'fighter' ? 'ДД' : m.type === 'support' ? 'Хил' : 'Баф'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
