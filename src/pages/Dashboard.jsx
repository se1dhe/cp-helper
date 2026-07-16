import React, { useEffect, useState } from 'react';
import { Coins, Gem, Swords, Target, Circle, CheckCircle2, Plus, Trash2, ChevronDown, ChevronRight, MapPin, Medal, Pin, Users, User } from 'lucide-react';
import { subscribeToRoster } from '../services/rosterService';
import { subscribeToTasks, addTask, toggleTask, deleteTask } from '../services/taskService';
import { subscribeToTransactions } from '../services/treasuryService';
import { subscribeToQuestData } from '../services/questService';
import { subscribeToQuestLog, toggleQuestCompletion } from '../services/questLogService';
import { subscribeToNotes, addNote, deleteNote } from '../services/notesService';
import { subscribeToPresence, isUserOnline } from '../services/presenceService';
import { subscribeToServerInfo } from '../services/roadmapService';
import { getCountdown } from '../utils/countdown';
import { Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { L2_CLASSES } from '../utils/classes';
import { ClassIcon } from '../components/ClassIcon';
import { getUniversalQuests, getRaceQuestsForClass, getRaceLabel, getRaceForClass } from '../data/quests';

const getClassDetails = (name) => L2_CLASSES.find(c => c.name === name) || { type: 'unknown', color: '#888' };

export const Dashboard = () => {
  const { currentUser, userNickname, isPL, isOfficer } = useAuth();
  const { t } = useLang();
  const [roster, setRoster] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('prime');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [treasury, setTreasury] = useState({ totalAdena: 0, totalMC: 0 });
  const [presence, setPresence] = useState({});
  const [questsCollapsed, setQuestsCollapsed] = useState(() => sessionStorage.getItem('questsCollapsed') === 'true');
  useEffect(() => { sessionStorage.setItem('questsCollapsed', questsCollapsed); }, [questsCollapsed]);
  const [expandedQuests, setExpandedQuests] = useState({});
  const [questData, setQuestData] = useState(null);
  const [questLog, setQuestLog] = useState({});
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [notesCollapsed, setNotesCollapsed] = useState(() => localStorage.getItem('notesCollapsed') === 'true');
  useEffect(() => { localStorage.setItem('notesCollapsed', notesCollapsed); }, [notesCollapsed]);
  const [launchDate, setLaunchDate] = useState('');

  useEffect(() => {
    const unsubRoster = subscribeToRoster(setRoster);
    const unsubTasks = subscribeToTasks(setTasks);
    const unsubTreasury = subscribeToTransactions((data) => {
      setTreasury({ totalAdena: data.totalAdena, totalMC: data.totalMC });
    });
    const unsubQuests = subscribeToQuestData(setQuestData);
    const unsubLog = subscribeToQuestLog(setQuestLog);
    const unsubNotes = subscribeToNotes(setNotes);
    const unsubPresence = subscribeToPresence(setPresence);
    const unsubServer = subscribeToServerInfo((info) => setLaunchDate(info.launchDate || ''));
    return () => { unsubRoster(); unsubTasks(); unsubTreasury(); unsubQuests(); unsubLog(); unsubNotes(); unsubPresence(); unsubServer(); };
  }, []);

  const countdown = getCountdown(launchDate);

  const assignableMembers = roster.filter(
    m => m.name && m.name !== '—' && m.userId && m.userId !== '__occupied__'
  );
  const onlineCount = assignableMembers.filter(m => isUserOnline(presence[m.userId])).length;

  // Мемберы видят общие задачи и свои личные; офицеры/ПЛ — все.
  const visibleTasks = tasks.filter(
    task => !task.assignedTo || task.assignedTo === currentUser?.uid || isOfficer
  );
  const doneTasks = visibleTasks.filter(task => task.done).length;

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const assignee = assignableMembers.find(m => m.userId === newTaskAssignee);
      await addTask(newTask, newTaskTag, newTaskAssignee, assignee?.name || '');
      setNewTask('');
      setNewTaskAssignee('');
    } catch { alert(t('alert.addTaskError')); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await addNote(newNote.trim(), userNickname || currentUser?.email, currentUser?.uid);
      setNewNote('');
    } catch { alert(t('notes.addError')); }
  };

  const handleDeleteNote = async (id) => {
    try { await deleteNote(id); } catch { alert(t('notes.deleteError')); }
  };

  const toggleQuest = (questId) => {
    setExpandedQuests(prev => ({ ...prev, [questId]: !prev[questId] }));
  };

  const handleToggleQuestDone = async (userId, questName, currentDone) => {
    if (!userId) return;
    try {
      await toggleQuestCompletion(userId, questName, !currentDone);
    } catch { alert(t('dashboard.questSaveError')); }
  };

  const fmtDate = (ts) => ts?.toDate?.().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) || '';

  const questMembers = questData ? roster.filter(m =>
    m.name && m.name !== '—' && m.userId && m.userId !== '__occupied__' && getRaceForClass(questData, m.className)
    && m.userId === currentUser?.uid
  ) : [];

  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);

  return (
    <div className="fade-in">
      <h2 className="page-title"><Swords size={22} /> {t('dashboard.title')}</h2>

      {countdown && (
        <div className={`launch-banner ${countdown.started ? 'launch-banner--live' : ''}`}>
          <Rocket size={20} />
          {countdown.started ? (
            <span><strong>lu4.org</strong> — {t('dashboard.serverDay', { n: countdown.dayNumber })}</span>
          ) : (
            <span>{t('dashboard.launchCountdown')}: <strong>{countdown.days}</strong> {t('dashboard.daysShort')}</span>
          )}
        </div>
      )}

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
        <div className="stat-card stat-card--green">
          <div className="stat-card-icon stat-card-icon--green"><Users size={20} /></div>
          <div className="stat-card-label">{t('dashboard.online')}</div>
          <div className="stat-card-value">
            <span style={{ color: onlineCount > 0 ? 'var(--success)' : undefined }}>{onlineCount}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.6em', fontWeight: 600 }}> / {assignableMembers.length}</span>
          </div>
          <div className="stat-card-online-list">
            {assignableMembers.filter(m => isUserOnline(presence[m.userId])).slice(0, 6).map(m => (
              <span key={m.id} className="stat-online-chip">
                {m.avatar
                  ? <img src={m.avatar} alt="" className="chip-avatar" />
                  : <span className="online-dot online-dot--on" />}
                {m.name}
              </span>
            ))}
            {onlineCount === 0 && <span className="stat-online-none">{t('dashboard.nobodyOnline')}</span>}
          </div>
        </div>
      </div>

      {(notes.length > 0 || isOfficer) && (
        <div className="notes-section">
          <button className="section-header section-header--clickable" onClick={() => setNotesCollapsed(prev => !prev)}>
            <Pin size={15} /> {t('notes.title')}
            {notes.length > 0 && <span className="notes-count">{notes.length}</span>}
            {notesCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
          {!notesCollapsed && (
            <>
              {isOfficer && (
                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0 0.875rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ flexGrow: 1 }}
                    placeholder={t('notes.placeholder')}
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', flexShrink: 0 }}>
                    <Plus size={18} />
                  </button>
                </form>
              )}
              <div className="notes-grid">
                {notes.map(note => (
                  <div key={note.id} className="note-card">
                    <div className="note-card-top">
                      <Pin size={13} className="note-card-icon" />
                      {isOfficer && (
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="note-card-del"
                          title={t('notes.delete')}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <p className="note-card-text">{note.text}</p>
                    <span className="note-card-meta">{note.author}{note.createdAt ? ` · ${fmtDate(note.createdAt)}` : ''}</span>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem', fontSize: '0.85rem', gridColumn: '1 / -1' }}>
                    {t('notes.empty')}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="tasks-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <h3 className="section-header" style={{ margin: 0 }}><Target size={15} /> {t('dashboard.tasks')}</h3>
          {visibleTasks.length > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('dashboard.completed', { done: doneTasks, total: visibleTasks.length })}
            </span>
          )}
        </div>

        {(isPL || isOfficer) && (
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input-field"
              style={{ flexGrow: 1, minWidth: '160px' }}
              placeholder={t('dashboard.newTask')}
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
            />
            <select
              className="input-field"
              style={{ width: 'auto', minWidth: '110px' }}
              value={newTaskTag}
              onChange={e => setNewTaskTag(e.target.value)}
            >
              <option value="prime">{t('dashboard.prime')}</option>
              <option value="offprime">{t('dashboard.offprime')}</option>
            </select>
            {isPL && (
              <select
                className="input-field"
                style={{ width: 'auto', minWidth: '130px' }}
                value={newTaskAssignee}
                onChange={e => setNewTaskAssignee(e.target.value)}
                title={t('dashboard.assignTo')}
              >
                <option value="">{t('dashboard.forEveryone')}</option>
                {assignableMembers.map(m => (
                  <option key={m.id} value={m.userId}>{m.name}</option>
                ))}
              </select>
            )}
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', flexShrink: 0 }}>
              <Plus size={18} />
            </button>
          </form>
        )}

        <div className="task-list">
          {visibleTasks.map((task) => (
            <div key={task.id} className={`task-item ${task.done ? 'task-item--done' : ''} ${task.assignedTo ? 'task-item--personal' : ''}`}>
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
              {task.assignedTo && (
                <span className="task-item-assignee" title={t('dashboard.assignedTo', { name: task.assignedToName || '' })}>
                  <User size={11} /> {task.assignedToName || t('dashboard.personal')}
                </span>
              )}
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
          {visibleTasks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>
              {t('dashboard.noTasks', { extra: (isPL || isOfficer) ? t('dashboard.noTasksExtra') : '' })}
            </div>
          )}
        </div>
      </div>

      <div className="quests-section">
        <button className="section-header section-header--clickable" onClick={() => setQuestsCollapsed(prev => !prev)}>
          <Medal size={15} /> {t('dashboard.quests')}
          {questsCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
        {!questsCollapsed && (!questData ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>
            {t('dashboard.loading')}
          </div>
        ) : questMembers.length > 0 ? (
          <div className="quest-members">
            {questMembers.map(m => {
              const cls = getClassDetails(m.className);
              const universalQuests = getUniversalQuests(questData);
              const raceQuests = getRaceQuestsForClass(questData, m.className);
              const raceLabel = getRaceLabel(questData, m.className);
              let idx = 0;
              const renderQuest = (q) => {
                const questId = `${m.id}-${idx}`;
                const isExpanded = expandedQuests[questId];
                const isDone = questLog?.[m.userId]?.[q.name] === true;
                idx++;
                return (
                  <div key={questId} className={`quest-card ${isExpanded ? 'quest-card--expanded' : ''} ${isDone ? 'quest-card--done' : ''}`}>
                    <div className="quest-card-top">
                      <button
                        className="quest-card-done-btn"
                        onClick={(e) => { e.stopPropagation(); handleToggleQuestDone(m.userId, q.name, isDone); }}
                      >
                        {isDone
                          ? <CheckCircle2 size={16} color="var(--success)" />
                          : <Circle size={16} color="var(--text-muted)" />
                        }
                      </button>
                      <button
                        className="quest-card-header"
                        onClick={() => toggleQuest(questId)}
                      >
                        <span className="quest-card-name">{q.name}</span>
                        <span className="quest-card-lvl">LVL {q.lvl}</span>
                        {isExpanded
                          ? <ChevronDown size={14} className="quest-card-chevron" />
                          : <ChevronRight size={14} className="quest-card-chevron" />
                        }
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="quest-card-body">
                        <div className="quest-card-row">
                          <MapPin size={12} />
                          <span>{q.npc}</span>
                        </div>
                        <div className="quest-card-row">
                          <Medal size={12} />
                          <span>{q.reward}</span>
                        </div>
                        <p className="quest-card-desc">{q.description}</p>
                        {q.notes && <p className="quest-card-notes">{q.notes}</p>}
                      </div>
                    )}
                  </div>
                );
              };
              return (
                <div key={m.id} className="quest-member-block">
                  <div className="quest-member-header">
                    <ClassIcon className={m.className} type={cls.type} size={28} />
                    <div className="quest-member-info">
                      <span className="quest-member-name">{m.name}</span>
                      <span className="quest-member-class" style={{ color: cls.color }}>{m.className}</span>
                      {raceLabel && <span className="quest-member-race">{raceLabel}</span>}
                    </div>
                  </div>
                  <div className="quest-list">
                    <div className="quest-subsection">
                      <span className="quest-subsection-label">{raceLabel || 'Расовые'}</span>
                    </div>
                    {raceQuests.map(renderQuest)}
                    <div className="quest-subsection">
                      <span className="quest-subsection-label">Общие</span>
                    </div>
                    {universalQuests.map(renderQuest)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>
            {t('dashboard.noQuests')}
          </div>
        ))}
      </div>
    </div>
  );
};
