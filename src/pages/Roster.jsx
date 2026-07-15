import React, { useEffect, useState } from 'react';
import { Shield, Edit2, Check, X, Plus, Trash2, Users } from 'lucide-react';
import { subscribeToRoster, updateRosterSlot, addRosterSlot, deleteRosterSlot } from '../services/rosterService';
import { subscribeToUsers, updateUserClass } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { L2_CLASSES } from '../utils/classes';
import { ClassIcon } from '../components/ClassIcon';

const getClassDetails = (name) => L2_CLASSES.find(c => c.name === name) || { type: 'unknown', color: '#888', abbr: '?' };

export const Roster = () => {
  const { isPL } = useAuth();
  const { t } = useLang();
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

  const OCCUPIED_MARKER = '__occupied__';

  const handleEdit = (slot) => {
    setEditingId(slot.id);
    setEditForm({ ...slot });
  };
  const handleCancel = () => setEditingId(null);

  const handleUserChange = (e) => {
    const val = e.target.value;
    if (val === OCCUPIED_MARKER) {
      setEditForm(prev => ({ ...prev, userId: OCCUPIED_MARKER, name: t('roster.occupied') }));
    } else if (val === '') {
      setEditForm(prev => ({ ...prev, userId: '', name: '—' }));
    } else {
      const user = users.find(u => u.id === val);
      if (user) {
        setEditForm(prev => ({
          ...prev,
          userId: user.id,
          name: user.nickname || user.displayName || user.email,
        }));
      }
    }
  };

  const handleSave = async (slotId) => {
    setSaving(true);
    try {
      await updateRosterSlot(slotId, editForm);
      if (editForm.userId && editForm.userId !== OCCUPIED_MARKER && editForm.className) {
        await updateUserClass(editForm.userId, editForm.className);
      }
      setEditingId(null);
    } catch { alert(t('roster.error')); }
    finally { setSaving(false); }
  };

  const handleAddSlot = async () => {
    try {
      await addRosterSlot(roster);
    } catch (e) {
      console.error(e);
      alert(t('roster.addError'));
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm(t('roster.deleteConfirm'))) return;
    try {
      await deleteRosterSlot(slotId);
    } catch (e) {
      console.error(e);
      alert(t('roster.deleteError'));
    }
  };

  const handleClassChange = (e) => {
    const cls = L2_CLASSES.find(c => c.name === e.target.value);
    if (cls) setEditForm(prev => ({ ...prev, className: cls.name, type: cls.type }));
  };

  const classesByType = {
    [t('roster.mages')]: L2_CLASSES.filter(c => c.type === 'mage'),
    [t('roster.fighters')]: L2_CLASSES.filter(c => c.type === 'fighter'),
    [t('roster.buffers')]: L2_CLASSES.filter(c => c.type === 'buffer'),
    [t('roster.supports')]: L2_CLASSES.filter(c => c.type === 'support'),
  };

  const mainSlots = roster.filter(s => s.position <= 9);
  const extraSlots = roster.filter(s => s.position > 9);

  const renderSlot = (m, isExtra) => {
    const isEditing = editingId === m.id;
    const cls = getClassDetails(m.className);
    const isVacant = !m.userId || m.userId === '' || m.userId === '—';
    const isOccupiedNoUser = m.userId === OCCUPIED_MARKER;
    const isEmpty = isVacant;

    return (
      <div
        key={m.id}
        className={`roster-card roster-card--${cls.type}${isExtra ? ' roster-card--extra' : ''}`}
        style={{ opacity: isEmpty ? 0.75 : 1 }}
      >
        {isExtra && <div className="roster-card-extra-badge">10-я</div>}

        {isPL && !isEditing && (
          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.3rem' }}>
            <button onClick={() => handleEdit(m)} className="roster-card-btn" title={t('roster.edit')}>
              <Edit2 size={12} />
            </button>
            <button onClick={() => handleDeleteSlot(m.id)} className="roster-card-btn roster-card-btn--danger" title={t('roster.delete')}>
              <Trash2 size={12} />
            </button>
          </div>
        )}

        <div className="roster-slot-top">
          <ClassIcon className={m.className} type={cls.type} size={52} />

          <div className="roster-slot-info">
            {isEditing ? (
              <select
                className="input-field"
                style={{ padding: '0.3rem 0.5rem', marginBottom: '0.35rem', fontSize: '0.78rem' }}
                value={editForm.userId || ''}
                onChange={handleUserChange}
              >
                <option value="">{t('roster.notAssigned')}</option>
                <option value={OCCUPIED_MARKER}>{t('roster.occupied')}</option>
                <option disabled>──────────</option>
                {users
                  .filter(u => u.role !== 'GUEST')
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nickname || u.displayName || u.email}
                    </option>
                  ))
                }
              </select>
            ) : (
              <div className="roster-slot-name">
                {isVacant ? (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>{t('roster.vacant')}</span>
                ) : isOccupiedNoUser ? (
                  <span className="occupied-label">{t('roster.occupied')}</span>
                ) : (
                  <>{m.name} <span className="occupied-badge">{t('roster.occupied')}</span></>
                )}
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

        <div className="roster-slot-stats">
          <div className="roster-stat-box">
            <div className="roster-stat-label">{t('roster.level')}</div>
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
            <div className="roster-stat-label">{t('roster.role')}</div>
            <div className="roster-stat-value" style={{
              fontSize: '0.9rem',
              fontFamily: 'Inter',
              color: cls.color,
              marginTop: '0.2rem',
            }}>
              {cls.type === 'mage' ? t('roster.dd') : cls.type === 'fighter' ? t('roster.dd') : cls.type === 'support' ? t('roster.heal') : t('roster.buff')}
            </div>
          </div>
        </div>

        {isEditing && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', justifyContent: 'flex-end' }}>
            <button onClick={handleCancel} className="btn btn-sm">
              <X size={13} /> {t('roster.cancel')}
            </button>
            <button
              onClick={() => handleSave(m.id)}
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              <Check size={13} /> {saving ? t('roster.saving') : t('roster.save')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}><Shield size={22} /> {t('roster.title')}</h2>
        {isPL && (
          <button className="btn btn-primary btn-sm" onClick={handleAddSlot}>
            <Plus size={15} /> {t('roster.addSlot')}
          </button>
        )}
      </div>

      <h3 className="section-header"><Users size={15} /> {t('roster.mainSquad')}</h3>
      <div className="members-grid mb-4">
        {mainSlots.map(m => renderSlot(m, false))}
      </div>

      {extraSlots.length > 0 && (
        <>
          <h3 className="section-header" style={{ marginTop: '1.5rem' }}><Users size={15} /> {t('roster.extraSlots')}</h3>
          <div className="members-grid">
            {extraSlots.map(m => renderSlot(m, true))}
          </div>
        </>
      )}
    </div>
  );
};
