import React, { useEffect, useState } from 'react';
import { Skull, Plus, Trash2, Check, Swords, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { subscribeToRB, addRB, updateRB, killNow, setNextAt, deleteRB, seedRB } from '../services/rbService';
import { logAction } from '../services/auditService';
import { subscribeToRoster } from '../services/rosterService';
import { packLevel } from '../data/lu4Roadmap';

// Стартовый набор RB (уровни 20-40) — офицер грузит одним кликом, дальше правит.
const DEFAULT_RB = [
  { name: 'Zombie Lord Ferkel', level: 20, respawnH: 12 }, { name: 'Madness Beast', level: 20, respawnH: 12 },
  { name: 'Serpent Demon Bifrons', level: 21, respawnH: 12 }, { name: 'Greyclaw Kutus', level: 23, respawnH: 12 },
  { name: 'Unrequited Kael', level: 24, respawnH: 12 }, { name: 'Pan Dryad', level: 25, respawnH: 12 },
  { name: 'Princess Molrang', level: 25, respawnH: 12 }, { name: 'Soul Scavenger', level: 25, respawnH: 12 },
  { name: 'Tiger Hornet', level: 26, respawnH: 12 }, { name: 'Tirak', level: 28, respawnH: 12 },
  { name: "Cat's Eye Bandit", level: 30, respawnH: 12 }, { name: 'Turek Mercenary Captain', level: 30, respawnH: 12 },
  { name: 'Skyla', level: 32, respawnH: 12 }, { name: 'Corsair Captain Kylon', level: 33, respawnH: 12 },
  { name: 'Stakato Queen Zyrnna', level: 34, respawnH: 12 }, { name: "Cronos's Servitor Mumu", level: 34, respawnH: 12 },
  { name: 'Flame Lord Shadar', level: 35, respawnH: 12 }, { name: 'Gargoyle Lord Sirocco', level: 35, respawnH: 12 },
  { name: "Beleth's Eye", level: 35, respawnH: 12 }, { name: 'Evil Spirit Tempest', level: 36, respawnH: 12 },
  { name: 'Sebek', level: 36, respawnH: 12 }, { name: 'Rayito the Looter', level: 37, respawnH: 12 },
  { name: 'Lizardmen Leader Hellion', level: 38, respawnH: 12 },
];

const dtLocal = (ms) => { if (!ms) return ''; const d = new Date(ms - new Date().getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); };

export const RaidBosses = () => {
  const { isOfficer, currentUser, userNickname } = useAuth();
  const { t } = useLang();
  const [list, setList] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [form, setForm] = useState({ name: '', level: '', respawnH: '12', note: '' });
  const [showForm, setShowForm] = useState(false);
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    const unsub = subscribeToRB(setList);
    const unsubR = subscribeToRoster(setRoster);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { unsub(); unsubR(); clearInterval(timer); };
  }, []);

  const pLvl = packLevel(roster.filter(m => m.name && m.name !== '—' && m.userId && m.userId !== '__occupied__'));
  const isCurrent = (rb) => rb.level && rb.level >= pLvl - 4 && rb.level <= pLvl + 3;

  const countdown = (rb) => {
    if (!rb.nextAt) return { label: '—', cls: 'rb-cd--none' };
    const diff = rb.nextAt - now;
    if (diff <= 0) return { label: t('rb.ready'), cls: 'rb-cd--ready' };
    const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    const label = h > 0 ? `${h}ч ${m}м` : m > 0 ? `${m}м ${s}с` : `${s}с`;
    return { label, cls: diff < 900000 ? 'rb-cd--soon' : 'rb-cd--wait' };
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await addRB(form.name.trim(), form.level, form.respawnH, form.note.trim());
      logAction(currentUser?.uid, userNickname, 'rb', `${t('audit.rbAdd')} ${form.name.trim()}`);
      setForm({ name: '', level: '', respawnH: '12', note: '' }); setShowForm(false);
    } catch { alert(t('rb.error')); }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}><Skull size={22} /> {t('rb.title')}</h2>
        {isOfficer && <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}><Plus size={15} /> {t('rb.add')}</button>}
      </div>

      {isOfficer && showForm && (
        <div className="glass-panel mb-4">
          <form onSubmit={handleAdd} className="rb-form">
            <input className="input-field" placeholder={t('rb.name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ flex: 2, minWidth: '140px' }} />
            <input className="input-field" type="number" placeholder={t('rb.level')} value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} style={{ width: '80px' }} />
            <input className="input-field" type="number" placeholder={t('rb.respawnH')} value={form.respawnH} onChange={e => setForm({ ...form, respawnH: e.target.value })} style={{ width: '110px' }} />
            <input className="input-field" placeholder={t('rb.note')} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={{ flex: 1, minWidth: '120px' }} />
            <button type="submit" className="btn btn-primary"><Check size={16} /></button>
          </form>
        </div>
      )}

      {list.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="text-muted" style={{ marginBottom: isOfficer ? '1rem' : 0 }}>{t('rb.empty')}</p>
          {isOfficer && <button className="btn btn-primary" onClick={() => seedRB(DEFAULT_RB).catch(() => alert(t('rb.error')))}><Plus size={16} /> {t('rb.loadDefaults')}</button>}
        </div>
      ) : (
        <div className="glass-panel">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr>
                <th>{t('rb.boss')}</th><th><Clock size={13} /> {t('rb.respawn')}</th>
                {isOfficer && <th>{t('rb.actions')}</th>}
              </tr></thead>
              <tbody>
                {list.map(rb => {
                  const cd = countdown(rb);
                  const cur = isCurrent(rb);
                  return (
                    <tr key={rb.id} className={cur ? 'rb-row--current' : ''}>
                      <td>
                        <span className="rb-name"><Swords size={13} /> {rb.name} {rb.level ? <span className="rb-lvl">Ур. {rb.level}</span> : null} {cur && <span className="rb-current-badge">{t('rb.byLevel')}</span>}</span>
                        {rb.note && <span className="rb-note">{rb.note}</span>}
                      </td>
                      <td><span className={`rb-cd ${cd.cls}`}>{cd.label}</span></td>
                      {isOfficer && (
                        <td>
                          <div className="rb-actions">
                            <button className="btn btn-sm" onClick={() => { killNow(rb.id, rb.respawnH); logAction(currentUser?.uid, userNickname, 'rb', `${t('audit.rbKill')} ${rb.name}`); }} title={t('rb.killHint')}>{t('rb.kill')}</button>
                            <input type="number" className="input-field rb-h" value={rb.respawnH || 0} onChange={e => updateRB(rb.id, { respawnH: Number(e.target.value) || 0 })} title={t('rb.respawnH')} />
                            <input type="datetime-local" className="input-field rb-dt" value={dtLocal(rb.nextAt)} onChange={e => setNextAt(rb.id, e.target.value ? new Date(e.target.value).getTime() : 0)} />
                            <button className="rb-del" onClick={() => { if (window.confirm(t('rb.deleteConfirm'))) deleteRB(rb.id); }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="craft-hint" style={{ marginTop: '0.75rem' }}>{t('rb.hint')}</p>
        </div>
      )}
    </div>
  );
};
