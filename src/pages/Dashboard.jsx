import React, { useEffect, useState } from 'react';
import { Coins, Gem, Users, Swords, Target, Circle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { subscribeToRoster } from '../services/rosterService';
import { subscribeToTasks, addTask, toggleTask, deleteTask } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { L2_CLASSES } from '../utils/classes';

export const Dashboard = () => {
  const { isPL, isOfficer } = useAuth();
  const [roster, setRoster] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('prime');
  
  useEffect(() => {
    const unsubRoster = subscribeToRoster(setRoster);
    const unsubTasks = subscribeToTasks(setTasks);
    return () => {
      unsubRoster();
      unsubTasks();
    };
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await addTask(newTask, newTaskTag);
      setNewTask('');
    } catch (e) {
      alert('Ошибка при добавлении задачи');
    }
  };

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
          <div className="stat-card-value">{roster.filter(m => m.name !== '—').length} / 9</div>
        </div>
      </div>

      <h3 className="section-header"><Users size={16} /> Состав пати</h3>
      <div className="members-grid mb-4">
        {roster.map((m) => {
          const cls = L2_CLASSES.find(c => c.name === m.className);
          const abbr = cls ? cls.abbr : '?';
          return (
            <div key={m.id} className="member-card">
              <div className={`member-card-icon member-card-icon--${m.type}`}>
                {abbr}
              </div>
              <div className="member-card-info">
                <h4>{m.name === '—' ? 'Не назначен' : m.name}</h4>
                <div className="member-card-class">{m.className}</div>
                <div className="member-card-lvl">Lvl {m.lvl}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="tasks-section">
        <h3 className="section-header"><Target size={16} /> Задачи</h3>
        
        {(isPL || isOfficer) && (
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              className="input-field" 
              style={{ flexGrow: 1 }} 
              placeholder="Новая задача..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
            />
            <select 
              className="input-field" 
              style={{ width: 'auto' }}
              value={newTaskTag}
              onChange={e => setNewTaskTag(e.target.value)}
            >
              <option value="prime">Прайм</option>
              <option value="offprime">Оффпрайм</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
              <Plus size={18} />
            </button>
          </form>
        )}

        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className={`task-item ${task.done ? 'task-item--done' : ''}`}>
              <button 
                onClick={() => toggleTask(task.id, task.done)} 
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
              >
                {task.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              
              <span className="task-item-text">{task.text}</span>
              
              <span className={`task-item-tag ${task.tag === 'prime' ? 'task-tag--prime' : 'task-tag--offprime'}`}>
                {task.tag === 'prime' ? 'Прайм' : 'Оффпрайм'}
              </span>

              {(isPL || isOfficer) && (
                <button 
                  onClick={() => deleteTask(task.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
              Нет активных задач
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
