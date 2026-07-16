import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { subscribeToUsers, updateUserRole, updateUserNickname, initializeRoster } from '../services/adminService';
import { Users, ShieldAlert, Shield, RotateCcw, Edit2, Check, X } from 'lucide-react';

const ROLE_BADGE = {
  PL: 'role-badge role-badge-pl',
  OFFICER: 'role-badge role-badge-officer',
  MEMBER: 'role-badge role-badge-member',
  GUEST: 'role-badge role-badge-guest',
};

export const Admin = () => {
  const { isPL, isOfficer } = useAuth();
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [editingNickname, setEditingNickname] = useState(null);
  const [nicknameValue, setNicknameValue] = useState('');

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
          <h2>{t('admin.accessDenied')}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{t('admin.accessDeniedMessage')}</p>
        </div>
      </div>
    );
  }

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
    } catch (e) {
      console.error(e);
      alert(t('admin.error'));
    }
  };

  const handleInitRoster = async () => {
    if (window.confirm(t('admin.resetConfirm'))) {
      try {
        await initializeRoster();
        alert(t('admin.resetDone'));
      } catch (e) {
        console.error(e);
        alert(t('admin.error'));
      }
    }
  };

  const startEditNickname = (user) => {
    setEditingNickname(user.id);
    setNicknameValue(user.nickname || user.displayName || user.email);
  };

  const saveNickname = async (userId) => {
    if (!nicknameValue.trim()) return;
    try {
      await updateUserNickname(userId, nicknameValue.trim());
      setEditingNickname(null);
    } catch (e) {
      console.error(e);
      alert(t('admin.nicknameError'));
    }
  };

  const cancelEditNickname = () => {
    setEditingNickname(null);
    setNicknameValue('');
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          <Shield size={22} /> {t('admin.title')}
        </h2>
        {isPL && (
          <button className="btn btn-danger" onClick={handleInitRoster}>
            <RotateCcw size={15} /> {t('admin.resetRoster')}
          </button>
        )}
      </div>

      <div className="glass-panel">
        <h3 className="section-header"><Users size={16} /> {t('admin.users', { count: users.length })}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>{t('admin.nickname')}</th>
                <th>{t('admin.email')}</th>
                <th>{t('admin.role')}</th>
                {isPL && <th>{t('admin.actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>
                      {editingNickname === u.id ? (
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="input-field"
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', width: '130px' }}
                            value={nicknameValue}
                            onChange={e => setNicknameValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveNickname(u.id); if (e.key === 'Escape') cancelEditNickname(); }}
                            autoFocus
                          />
                          <button className="btn btn-sm" style={{ padding: '0.2rem 0.35rem' }} onClick={() => saveNickname(u.id)}>
                            <Check size={13} />
                          </button>
                          <button className="btn btn-sm" style={{ padding: '0.2rem 0.35rem' }} onClick={cancelEditNickname}>
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {u.nickname || u.displayName || u.email}
                          {isPL && (
                            <button
                              onClick={() => startEditNickname(u)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                              <Edit2 size={11} />
                            </button>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="text-secondary">{u.email}</td>
                    <td>
                      <span className={ROLE_BADGE[u.role] || ROLE_BADGE.GUEST}>{t(`role.${u.role.toLowerCase()}`)}</span>
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
                          <option value="GUEST">{t('role.guest')}</option>
                          <option value="MEMBER">{t('role.member')}</option>
                          <option value="OFFICER">{t('role.officer')}</option>
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
                    {t('admin.noUsers')}
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
