import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Trash2, Check, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { updateUserProfile } from '../services/adminService';
import { updateRosterByUserId } from '../services/rosterService';

// Сжимает выбранную картинку в квадратный аватар 128×128 (data-URL JPEG).
const processImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

export const ProfileModal = ({ open, onClose }) => {
  const { currentUser, userNickname, userAvatar, userLevel, refreshUserDoc } = useAuth();
  const { t } = useLang();
  const fileRef = useRef(null);
  const [nickname, setNickname] = useState('');
  const [level, setLevel] = useState(1);
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setNickname(userNickname || currentUser?.email || '');
      setLevel(userLevel || 1);
      setAvatar(userAvatar || '');
    }
  }, [open, userNickname, userLevel, userAvatar, currentUser]);

  if (!open) return null;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert(t('profile.imageOnly')); return; }
    setBusy(true);
    try {
      setAvatar(await processImage(file));
    } catch {
      alert(t('profile.imageError'));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const name = nickname.trim();
    if (!name) return;
    const lvl = Math.max(1, Math.min(99, Number(level) || 1));
    setSaving(true);
    try {
      const uid = currentUser.uid;
      await updateUserProfile(uid, { nickname: name, displayName: name, avatar, level: lvl });
      await updateRosterByUserId(uid, { name, lvl, avatar });
      await refreshUserDoc(uid);
      onClose();
    } catch (err) {
      console.error(err);
      alert(t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card fade-in-scale" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{t('profile.title')}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="profile-avatar-block">
          <div className="profile-avatar">
            {avatar
              ? <img src={avatar} alt="" />
              : <div className="profile-avatar-fallback"><User size={40} /></div>}
          </div>
          <div className="profile-avatar-actions">
            <button className="btn btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Camera size={13} /> {busy ? t('profile.processing') : t('profile.changeAvatar')}
            </button>
            {avatar && (
              <button className="btn btn-sm" onClick={() => setAvatar('')}>
                <Trash2 size={13} /> {t('profile.removeAvatar')}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          </div>
        </div>

        <div className="input-group">
          <label>{t('profile.nickname')}</label>
          <input type="text" className="input-field" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={24} />
        </div>

        <div className="input-group">
          <label>{t('profile.level')}</label>
          <input type="number" min="1" max="99" className="input-field" value={level}
            onChange={e => setLevel(e.target.value)} style={{ width: '100px' }} />
        </div>

        <div className="modal-actions">
          <button className="btn btn-sm" onClick={onClose}>{t('profile.cancel')}</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || busy}>
            <Check size={14} /> {saving ? t('profile.saving') : t('profile.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
