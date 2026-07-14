import React from 'react';
import { Coins, Gem, Users, Swords, Target, Circle, CheckCircle2 } from 'lucide-react';

const PARTY_MEMBERS = [
  { className: 'Sorcerer', abbr: 'S', type: 'mage', name: '—' },
  { className: 'Sorcerer', abbr: 'S', type: 'mage', name: '—' },
  { className: 'Sorcerer', abbr: 'S', type: 'mage', name: '—' },
  { className: 'Terramancer', abbr: 'T', type: 'mage', name: '—' },
  { className: 'Blade Dancer', abbr: 'BD', type: 'fighter', name: '—' },
  { className: 'Sword Singer', abbr: 'SS', type: 'buffer', name: '—' },
  { className: 'Shillien Elder', abbr: 'ShE', type: 'support', name: '—' },
  { className: 'Elven Elder', abbr: 'EE', type: 'support', name: '—' },
  { className: 'Overlord', abbr: 'OL', type: 'buffer', name: '—' },
];

const TASKS = [
  { text: 'Кач в ТОИ', tag: 'prime', done: false },
  { text: 'Фарм спойла', tag: 'offprime', done: false },
  { text: 'Квесты на сабкласс', tag: 'prime', done: false },
  { text: 'Закупка расходников (BSPS, SoE)', tag: 'offprime', done: false },
  { text: 'Крафт сета Тёмного Кристалла', tag: 'prime', done: false },
];

export const Dashboard = () => {
  return (
    <div className="fade-in">
      <h2 className="page-title"><Swords size={22} /> Дашборд</h2>

      <div className="stat-cards">
        <div className="stat-card stat-card--gold">
          <div className="stat-card-icon stat-card-icon--gold"><Coins size={20} /></div>
          <div className="stat-card-label">Баланс адены</div>
          <div className="stat-card-value">0</div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-card-icon stat-card-icon--blue"><Gem size={20} /></div>
          <div className="stat-card-label">Master Coins</div>
          <div className="stat-card-value">0</div>
        </div>
        <div className="stat-card stat-card--red">
          <div className="stat-card-icon stat-card-icon--red"><Users size={20} /></div>
          <div className="stat-card-label">Мемберов в пати</div>
          <div className="stat-card-value">9</div>
        </div>
      </div>

      <h3 className="section-header"><Users size={16} /> Состав пати</h3>
      <div className="members-grid mb-4">
        {PARTY_MEMBERS.map((m, i) => (
          <div key={i} className="member-card">
            <div className={`member-card-icon member-card-icon--${m.type}`}>
              {m.abbr}
            </div>
            <div className="member-card-info">
              <h4>{m.name === '—' ? 'Не назначен' : m.name}</h4>
              <div className="member-card-class">{m.className}</div>
              <div className="member-card-lvl">Lvl 1</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tasks-section">
        <h3 className="section-header"><Target size={16} /> Задачи</h3>
        <div className="task-list">
          {TASKS.map((task, i) => (
            <div key={i} className={`task-item ${task.done ? 'task-item--done' : ''}`}>
              {task.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              <span className="task-item-text">{task.text}</span>
              <span className={`task-item-tag ${task.tag === 'prime' ? 'task-tag--prime' : 'task-tag--offprime'}`}>
                {task.tag === 'prime' ? 'Прайм' : 'Оффпрайм'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
