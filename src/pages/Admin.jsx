import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToUsers, updateUserRole, initializeRoster } from '../services/adminService';
import { Users, ShieldAlert, Shield, RotateCcw } from 'lucide-react';

const ROLE_BADGE = {
  PL: 'role-badge role-badge-pl',
  OFFICER: 'role-badge role-badge-officer',
  MEMBER: 'role-badge role-badge-member',
  GUEST: 'role-badge role-badge-guest',
};

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
      <div className="access-denied">
        <div className="access-denied-card fade-in">
          <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h2>Доступ запрещен</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Эта страница доступна только для ПЛ и Офицеров.</p>
        </div>
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
    if (window.confirm('Это сбросит ростер до стандартного состояния (9 пустых слотов). Вы уверены?')) {
      await initializeRoster();
      alert('Ростер инициализирован!');
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          <Shield size={22} /> Управление КП
        </h2>
        {isPL && (
          <button className="btn btn-danger" onClick={handleInitRoster}>
            <RotateCcw size={15} /> Сбросить Ростер
          </button>
        )}
      </div>

      <div className="glass-panel">
        <h3 className="section-header"><Users size={16} /> Пользователи ({users.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Имя</th>
                <th>Роль</th>
                {isPL && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td className="text-secondary">{u.displayName || '—'}</td>
                  <td>
                    <span className={ROLE_BADGE[u.role] || ROLE_BADGE.GUEST}>{u.role}</span>
                  </td>
                  {isPL && (
                    <td>
                      {u.role !== 'PL' ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="input-field"
                          style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          <option value="GUEST">Guest</option>
                          <option value="MEMBER">Member</option>
                          <option value="OFFICER">Officer</option>
                        </select>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={isPL ? 4 : 3} className="text-center text-muted" style={{ padding: '2rem' }}>
                    Нет пользователей
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
