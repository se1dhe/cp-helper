import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToUsers, updateUserRole, initializeRoster } from '../services/adminService';
import { Users, ShieldAlert, Check, Shield } from 'lucide-react';

export const Admin = () => {
  const { isPL, isOfficer } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isPL && !isOfficer) return;
    const unsubscribe = subscribeToUsers(setUsers);
    return () => unsubscribe();
  }, [isPL, isOfficer]);

  if (!isPL && !isOfficer) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', marginTop: '3rem' }}>
        <ShieldAlert size={48} color="var(--primary)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
        <h3>Доступ запрещен</h3>
        <p style={{ color: 'var(--text-muted)' }}>Эта страница доступна только для ПЛ и Офицеров.</p>
      </div>
    );
  }

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
    } catch (e) {
      console.error(e);
      alert('Ошибка при обновлении роли');
    }
  };

  const handleInitRoster = async () => {
    if(window.confirm('Это сбросит ростер до стандартного состояния (9 пустых слотов). Вы уверены?')) {
      await initializeRoster();
      alert('Ростер инициализирован!');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="page-title"><Shield size={22} /> Управление КП</h2>
        {isPL && (
          <button 
            className="auth-btn" 
            style={{ padding: '0.5rem 1rem', width: 'auto' }}
            onClick={handleInitRoster}
          >
            Сбросить Ростер
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <h3 className="section-header" style={{ marginTop: 0 }}><Users size={16} /> Пользователи</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Имя</th>
                <th style={{ padding: '0.75rem' }}>Роль</th>
                <th style={{ padding: '0.75rem' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem' }}>{u.displayName || '—'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`task-item-tag ${u.role === 'PL' ? 'task-tag--prime' : u.role === 'OFFICER' ? 'task-tag--prime' : u.role === 'MEMBER' ? '' : 'task-tag--offprime'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {isPL && u.role !== 'PL' && (
                      <select 
                        value={u.role} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'var(--text-primary)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="GUEST">Guest (Ожидает)</option>
                        <option value="MEMBER">Member (В составе)</option>
                        <option value="OFFICER">Officer (Зам)</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
