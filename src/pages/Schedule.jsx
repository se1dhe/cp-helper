import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Plus, Trash2, Check, Clock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import {
  subscribeToSchedule, addEvent, deleteEvent,
  subscribeToAttendance, setAttendance,
} from '../services/scheduleService';

const TYPES = ['farm', 'rb', 'epic', 'siege', 'oly', 'event', 'other'];
const TYPE_COLOR = {
  farm: 'var(--success)',
  rb: 'var(--gold-light)',
  epic: 'var(--purple)',
  siege: 'var(--primary-light)',
  oly: 'var(--info)',
  event: 'var(--gold)',
  other: 'var(--text-secondary)',
};

export const Schedule = () => {
  const { currentUser, userNickname, isOfficer, isGuest } = useAuth();
  const { t } = useLang();
  const [events, setEvents] = useState([]);
  const [attendance, setAttendanceMap] = useState({});
  const [day, setDay] = useState(0);
  const [time, setTime] = useState('20:00');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('farm');
  const [note, setNote] = useState('');

  useEffect(() => {
    const unsub = subscribeToSchedule(setEvents);
    const unsubAtt = subscribeToAttendance(setAttendanceMap);
    return () => { unsub(); unsubAtt(); };
  }, []);

  const eventsByDay = useMemo(() => {
    const days = [[], [], [], [], [], [], []];
    for (const ev of events) {
      const d = Number.isInteger(ev.day) && ev.day >= 0 && ev.day <= 6 ? ev.day : 0;
      days[d].push(ev);
    }
    days.forEach(list => list.sort((a, b) => (a.time || '').localeCompare(b.time || '')));
    return days;
  }, [events]);

  const attendeesFor = (eventId) =>
    Object.values(attendance)
      .filter(a => a?.events?.[eventId])
      .map(a => a.nickname || '—');

  const isGoing = (eventId) => attendance[currentUser?.uid]?.events?.[eventId] === true;

  const handleToggleGo = async (eventId) => {
    if (isGuest || !currentUser) return;
    try {
      await setAttendance(currentUser.uid, userNickname || currentUser.email, eventId, !isGoing(eventId));
    } catch { alert(t('sched.saveError')); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await addEvent(day, time, title.trim(), type, note.trim());
      setTitle('');
      setNote('');
    } catch { alert(t('sched.saveError')); }
  };

  const handleDelete = async (id) => {
    try { await deleteEvent(id); } catch { alert(t('sched.deleteError')); }
  };

  return (
    <div className="fade-in">
      <h2 className="page-title"><CalendarClock size={22} /> {t('sched.title')}</h2>

      {isOfficer && (
        <form onSubmit={handleAdd} className="sched-add glass-panel">
          <select className="input-field" value={day} onChange={e => setDay(Number(e.target.value))} style={{ width: 'auto' }}>
            {[0, 1, 2, 3, 4, 5, 6].map(i => <option key={i} value={i}>{t(`sched.day.${i}`)}</option>)}
          </select>
          <input type="time" className="input-field" value={time} onChange={e => setTime(e.target.value)} style={{ width: 'auto' }} />
          <select className="input-field" value={type} onChange={e => setType(e.target.value)} style={{ width: 'auto' }}>
            {TYPES.map(tp => <option key={tp} value={tp}>{t(`sched.type.${tp}`)}</option>)}
          </select>
          <input className="input-field" style={{ flexGrow: 1, minWidth: '140px' }} placeholder={t('sched.titlePlaceholder')} value={title} onChange={e => setTitle(e.target.value)} />
          <input className="input-field" style={{ flexGrow: 1, minWidth: '120px' }} placeholder={t('sched.notePlaceholder')} value={note} onChange={e => setNote(e.target.value)} />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', flexShrink: 0 }}><Plus size={18} /></button>
        </form>
      )}

      <div className="sched-grid">
        {eventsByDay.map((list, d) => (
          <div key={d} className="sched-day">
            <div className="sched-day-head">{t(`sched.day.${d}`)}</div>
            {list.length === 0 ? (
              <div className="sched-day-empty">—</div>
            ) : list.map(ev => {
              const attendees = attendeesFor(ev.id);
              const going = isGoing(ev.id);
              return (
                <div key={ev.id} className="sched-event" style={{ borderLeftColor: TYPE_COLOR[ev.type] || 'var(--border)' }}>
                  <div className="sched-event-top">
                    <span className="sched-event-time"><Clock size={11} /> {ev.time || '—'}</span>
                    <span className="sched-event-type" style={{ color: TYPE_COLOR[ev.type] }}>{t(`sched.type.${ev.type || 'other'}`)}</span>
                    {isOfficer && (
                      <button className="sched-event-del" onClick={() => handleDelete(ev.id)} title={t('sched.delete')}><Trash2 size={12} /></button>
                    )}
                  </div>
                  <div className="sched-event-title">{ev.title}</div>
                  {ev.note && <div className="sched-event-note">{ev.note}</div>}
                  <div className="sched-event-att">
                    <Users size={11} />
                    <span className="sched-event-att-count">{attendees.length}</span>
                    {attendees.length > 0 && (
                      <span className="sched-event-att-names">{attendees.join(', ')}</span>
                    )}
                  </div>
                  {!isGuest && (
                    <button className={`sched-go-btn ${going ? 'sched-go-btn--on' : ''}`} onClick={() => handleToggleGo(ev.id)}>
                      {going ? <><Check size={13} /> {t('sched.going')}</> : t('sched.go')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
