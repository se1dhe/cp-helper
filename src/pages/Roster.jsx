import React, { useEffect, useState } from 'react';
import { Shield, Edit2, Check, X } from 'lucide-react';
import { subscribeToRoster, updateRosterSlot } from '../services/rosterService';
import { subscribeToUsers } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { L2_CLASSES } from '../utils/classes';
import { ClassIcon } from '../components/ClassIcon';

const getClassDetails = (name) => L2_CLASSES.find(c => c.name === name) || { type: 'unknown', color: '#888', abbr: '?' };

export const Roster = () => {
  const { isPL } = useAuth();
  const [roster, setRoster] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubRoster = subscribeToRoster(setRoster);
    let unsubUsers;
    if (isPL) { unsubUsers = subscribeToUsers(setUsers); }
    return () => { unsubRoster(); if (unsubUsers) unsubUsers(); };
  }, [isPL]);

  const handleEdit = (slot) => {
    setEditingId(slot.id);
    setEditForm({ ...slot });
  };
  const handleCancel = () => setEditingId(null);

  const handleSave = async (slotId) => {
    setSaving(true);
    try {
      await updateRosterSlot(slotId, editForm);
      setEditingId(null);
    } catch { alert('Ошибка при сохранении'); }
    finally { setSaving(false); }
  };

  const handleClassChange = (e) => {
    const cls = L2_CLASSES.find(c => c.name === e.target.value);
    if (cls) setEditForm(prev => ({ ...prev, className: cls.name, type: cls.type }));
  };

  // Group classes by type for the select
  const classesByType = {
    'Маги': L2_CLASSES.filter(c => c.type === 'mage'),
    'Бойцы': L2_CLASSES.filter(c => c.type === 'fighter'),
    'Баферы': L2_CLASSES.filter(c => c.type === 'buffer'),
    'Хилеры': L2_CLASSES.filter(c => c.type === 'support'),
  };

  return (
    <div className="fade-in">
      <h2 className="page-title"><Shield size={22} /> Ростер пати (0utLaw)</h2>

      <div className="members-grid">
        {roster.map((m) => {
          const isEditing = editingId === m.id;
          const cls = getClassDetails(m.className);
          const isEmpty = !m.name || m.name === '—';

          return (
            <div
              key={m.id}
              className={`roster-card roster-card--${cls.type}`}
              style={{ opacity: isEmpty ? 0.75 : 1 }}
            >
              {/* Edit button */}
              {isPL && !isEditing && (
                <button
                  onClick={() => handleEdit(m)}
                  style={{
                    position: 'absolute', top: '0.875rem', right: '0.875rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: '7px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.3rem 0.4rem',
                    display: 'flex',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <Edit2 size={13} />
                </button>
              )}

              {/* Header */}
              <div className="roster-slot-top">
                <ClassIcon className={m.className} type={cls.type} size={52} />

                <div className="roster-slot-info">
                  {isEditing ? (
                    <select
                      className="input-field"
                      style={{ padding: '0.3rem 0.5rem', marginBottom: '0.35rem', fontSize: '0.78rem' }}
                      value={editForm.name || '—'}
                      onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    >
                      <option value="—">— Не назначен —</option>
                      {users
                        .filter(u => u.role !== 'GUEST')
                        .map(u => (
                          <option key={u.id} value={u.displayName || u.email}>
                            {u.displayName || u.email} [{u.role}]
                          </option>
                        ))
                      }
                    </select>
                  ) : (
                    <div className="roster-slot-name">
                      {isEmpty ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Вакантно</span> : m.name}
                    </div>
                  )}

                  {isEditing ? (
                    <select
                      className="input-field"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
                      value={editForm.className}
                      onChange={handleClassChange}
                    >
                      {Object.entries(classesByType).map(([group, classes]) => (
                        <optgroup label={group} key={group}>
                          {classes.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  ) : (
                    <div className="roster-slot-class" style={{ color: cls.color }}>{m.className}</div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="roster-slot-stats">
                <div className="roster-stat-box">
                  <div className="roster-stat-label">Уровень</div>
                  {isEditing ? (
                    <input
                      type="number"
                      min="1" max="85"
                      className="input-field"
                      style={{ padding: '0.15rem', width: '4rem', textAlign: 'center', margin: '0 auto', display: 'block', fontSize: '1rem' }}
                      value={editForm.lvl}
                      onChange={e => setEditForm(prev => ({ ...prev, lvl: Number(e.target.value) }))}
                    />
                  ) : (
                    <div className="roster-stat-value">{m.lvl}</div>
                  )}
                </div>
                <div className="roster-stat-box">
                  <div className="roster-stat-label">Роль</div>
                  <div className="roster-stat-value" style={{
                    fontSize: '0.9rem',
                    fontFamily: 'Inter',
                    color: cls.color,
                    marginTop: '0.2rem',
                  }}>
                    {cls.type === 'mage' ? 'ДД' : cls.type === 'fighter' ? 'ДД' : cls.type === 'support' ? 'Хил' : 'Баф'}
                  </div>
                </div>
              </div>

              {/* Edit actions */}
              {isEditing && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', justifyContent: 'flex-end' }}>
                  <button onClick={handleCancel} className="btn btn-sm">
                    <X size={13} /> Отмена
                  </button>
                  <button
                    onClick={() => handleSave(m.id)}
                    className="btn btn-primary btn-sm"
                    disabled={saving}
                  >
                    <Check size={13} /> {saving ? '...' : 'Сохранить'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
