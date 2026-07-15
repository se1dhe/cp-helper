import React, { useEffect, useState } from 'react';
import { Coins, Gem, Users, Swords, Target, Circle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { subscribeToRoster } from '../services/rosterService';
import { subscribeToTasks, addTask, toggleTask, deleteTask } from '../services/taskService';
import { subscribeToTransactions } from '../services/treasuryService';
import { subscribeToUsers } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { L2_CLASSES } from '../utils/classes';
import { ClassIcon } from '../components/ClassIcon';

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'PL': return 'role-badge role-badge-pl';
    case 'OFFICER': return 'role-badge role-badge-officer';
    case 'MEMBER': return 'role-badge role-badge-member';
    default: return 'role-badge role-badge-guest';
  }
};

const getClassDetails = (name) => L2_CLASSES.find(c => c.name === name) || { type: 'unknown', color: '#888' };

export const Dashboard = () => {
  const { isPL, isOfficer } = useAuth();
  const { t } = useLang();
  const [roster, setRoster] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('prime');
  const [treasury, setTreasury] = useState({ totalAdena: 0, totalMC: 0 });

  useEffect(() => {
    const unsubRoster = subscribeToRoster(setRoster);
    const unsubUsers = subscribeToUsers(setUsers);
    const unsubTasks = subscribeToTasks(setTasks);
    const unsubTreasury = subscribeToTransactions((data) => {
      setTreasury({ totalAdena: data.totalAdena, totalMC: data.totalMC });
    });
    return () => { unsubRoster(); unsubUsers(); unsubTasks(); unsubTreasury(); };
  }, []);

  const userMap = {};
  users.forEach(u => { userMap[u.id] = u; });

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await addTask(newTask, newTaskTag);
      setNewTask('');
    } catch { alert(t('alert.addTaskError')); }
  };

  const filledSlots = roster.filter(m => m.name && m.name !== '—').length;
  const doneTasks = tasks.filter(t => t.done).length;
  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);

  const renderMemberCard = (m) => {
    const cls = getClassDetails(m.className);
    const slotUser = m.userId ? userMap[m.userId] : null;
    const slotRole = slotUser?.role;
    return (
      <div key={m.id} className={`member-card member-card--${cls.type}`} style={m.position > 9 ? { borderStyle: 'dashed' } : {}}>
        <ClassIcon className={m.className} type={cls.type} size={44} />
        <div className="member-card-info">
          <h4>{m.name === '—' || !m.name ? t('dashboard.notAssigned') : m.name}</h4>
          <div className="member-card-class" style={{ color: cls.color }}>{m.className}</div>
          <div className="member-card-lvl">{t('dashboard.lvl')} {m.lvl}</div>
        </div>
        {slotRole && (
          <span className={getRoleBadgeClass(slotRole)}>{t(`role.${slotRole.toLowerCase()}`)}</span>
        )}
      </div>
    );
  };

  const mainSlots = roster.filter(s => s.position <= 9);
  const extraSlots = roster.filter(s => s.position > 9);

  return (
    <div className="fade-in">
      <h2 className="page-title"><Swords size={22} /> {t('dashboard.title')}</h2>

      <div className="stat-cards">
        <div className="stat-card stat-card--gold">
          <div className="stat-card-icon stat-card-icon--gold"><Coins size={20} /></div>
          <div className="stat-card-label">{t('dashboard.balanceAdena')}</div>
          <div className="stat-card-value">{treasury.totalAdena ? fmt(treasury.totalAdena) : '—'}</div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-card-icon stat-card-icon--blue"><Gem size={20} /></div>
          <div className="stat-card-label">{t('dashboard.masterCoins')}</div>
          <div className="stat-card-value">{treasury.totalMC ? fmt(treasury.totalMC) : '—'}</div>
        </div>
        <div className="stat-card stat-card--red">
          <div className="stat-card-icon stat-card-icon--red"><Users size={20} /></div>
          <div className="stat-card-label">{t('dashboard.partyComposition')}</div>
          <div className="stat-card-value">{filledSlots} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'Inter' }}>/ {roster.length}</span></div>
        </div>
      </div>

      <h3 className="section-header"><Users size={15} /> {t('dashboard.partyRoster')}</h3>

      <div className="members-grid mb-2">
        {mainSlots.map(renderMemberCard)}
      </div>

      {extraSlots.length > 0 && (
        <>
          <div className="section-header" style={{ fontSize: '0.75rem', marginTop: '0.75rem' }}>
            <Users size={13} /> {t('dashboard.extraSlots')}
          </div>
          <div className="members-grid mb-4">
            {extraSlots.map(renderMemberCard)}
          </div>
        </>
      )}

      <div className="tasks-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <h3 className="section-header" style={{ margin: 0 }}><Target size={15} /> {t('dashboard.tasks')}</h3>
          {tasks.length > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('dashboard.completed', { done: doneTasks, total: tasks.length })}
            </span>
          )}
        </div>

        {(isPL || isOfficer) && (
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <input
              type="text"
              className="input-field"
              style={{ flexGrow: 1 }}
              placeholder={t('dashboard.newTask')}
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
            />
            <select
              className="input-field"
              style={{ width: 'auto', minWidth: '115px' }}
              value={newTaskTag}
              onChange={e => setNewTaskTag(e.target.value)}
            >
              <option value="prime">{t('dashboard.prime')}</option>
              <option value="offprime">{t('dashboard.offprime')}</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', flexShrink: 0 }}>
              <Plus size={18} />
            </button>
          </form>
        )}

        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className={`task-item ${task.done ? 'task-item--done' : ''}`}>
              <button
                onClick={() => toggleTask(task.id, task.done)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                {task.done
                  ? <CheckCircle2 size={18} color="var(--success)" />
                  : <Circle size={18} color="var(--text-muted)" />
                }
              </button>
              <span className="task-item-text">{task.text}</span>
              <span className={`task-item-tag ${task.tag === 'prime' ? 'task-tag--prime' : 'task-tag--offprime'}`}>
                {task.tag === 'prime' ? t('dashboard.prime') : t('dashboard.offprime')}
              </span>
              {(isPL || isOfficer) && (
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>
              {t('dashboard.noTasks', { extra: (isPL || isOfficer) ? t('dashboard.noTasksExtra') : '' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
