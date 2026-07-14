import React, { useEffect, useState } from 'react';
import { Shield, Edit2, Check, X } from 'lucide-react';
import { subscribeToRoster, updateRosterSlot } from '../services/rosterService';
import { subscribeToUsers } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { L2_CLASSES } from '../utils/classes';

export const Roster = () => {
  const { isPL } = useAuth();
  const [roster, setRoster] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const unsubRoster = subscribeToRoster(setRoster);
    let unsubUsers;
    if (isPL) {
      unsubUsers = subscribeToUsers(setUsers);
    }
    return () => {
      unsubRoster();
      if (unsubUsers) unsubUsers();
    };
  }, [isPL]);

  const handleEdit = (slot) => {
    setEditingId(slot.id);
    setEditForm({ ...slot });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async (slotId) => {
    try {
      await updateRosterSlot(slotId, editForm);
      setEditingId(null);
    } catch (e) {
      alert('Ошибка при сохранении');
    }
  };

  const handleClassChange = (e) => {
    const cls = L2_CLASSES.find(c => c.name === e.target.value);
    if (cls) {
      setEditForm(prev => ({
        ...prev,
        className: cls.name,
        type: cls.type
      }));
    }
  };

  // Ищем класс для цвета
  const getClassColor = (className) => {
    const cls = L2_CLASSES.find(c => c.name === className);
    return cls ? cls.color : '#ccc';
  };
  
  const getClassAbbr = (className) => {
    const cls = L2_CLASSES.find(c => c.name === className);
    return cls ? cls.abbr : '?';
  };

  return (
    <div className="fade-in">
      <h2 className="page-title"><Shield size={22} /> Ростер пати (0utLaw)</h2>

      <div className="members-grid">
        {roster.map((m) => {
          const isEditing = editingId === m.id;
          const classColor = getClassColor(m.className);
          const classAbbr = getClassAbbr(m.className);

          return (
            <div key={m.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              {isPL && !isEditing && (
                <button 
                  onClick={() => handleEdit(m)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Edit2 size={16} />
                </button>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div
                  className={`member-card-icon member-card-icon--${m.type}`}
                  style={{ width: '56px', height: '56px', fontSize: '1rem', flexShrink: 0 }}
                >
                  {classAbbr}
                </div>
                
                <div style={{ flexGrow: 1 }}>
                  {isEditing ? (
                    <select 
                      className="input-field"
                      style={{ padding: '0.25rem', marginBottom: '0.5rem', width: '100%' }}
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    >
                      <option value="—">Не назначен (—)</option>
                      {users.map(u => (
                        <option key={u.id} value={u.displayName || u.email}>{u.displayName || u.email}</option>
                      ))}
                    </select>
                  ) : (
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {m.name === '—' ? 'Не назначен' : m.name}
                    </h3>
                  )}

                  {isEditing ? (
                    <select 
                      className="input-field"
                      style={{ padding: '0.25rem', width: '100%' }}
                      value={editForm.className}
                      onChange={handleClassChange}
                    >
                      {L2_CLASSES.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: classColor, fontWeight: 600, marginTop: '0.15rem' }}>
                      {m.className}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Уровень
                  </div>
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="input-field"
                      style={{ padding: '0.1rem', width: '3rem', textAlign: 'center', margin: '0 auto' }}
                      value={editForm.lvl}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lvl: Number(e.target.value) }))}
                    />
                  ) : (
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {m.lvl}
                    </div>
                  )}
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Роль
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: classColor, marginTop: isEditing ? '0.2rem' : '0' }}>
                    {m.type === 'mage' ? 'ДД' : m.type === 'fighter' ? 'ДД' : m.type === 'support' ? 'Хил' : 'Баф'}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                  <button onClick={handleCancel} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <X size={14} /> Отмена
                  </button>
                  <button onClick={() => handleSave(m.id)} className="btn btn-sm" style={{ background: 'var(--primary)' }}>
                    <Check size={14} /> Сохранить
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
