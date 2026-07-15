import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { signInWithEmail, registerWithEmail, logOut } from '../firebase';
import { updateUserNickname } from '../services/adminService';
import { subscribeToRoster, updateRosterNameByUserId } from '../services/rosterService';
import { LayoutDashboard, Users, Wallet, LogIn, LogOut, ShieldAlert, UserPlus, Check, X, Languages } from 'lucide-react';
import { L2_CLASSES } from '../utils/classes';
import { ClassIcon } from './ClassIcon';

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'PL': return 'role-badge role-badge-pl';
    case 'OFFICER': return 'role-badge role-badge-officer';
    case 'MEMBER': return 'role-badge role-badge-member';
    default: return 'role-badge role-badge-guest';
  }
};

const getClassDetails = (name) => L2_CLASSES.find(c => c.name === name) || null;

export const Layout = () => {
  const { currentUser, userRole, userNickname, userClass, isGuest, refreshUserDoc } = useAuth();
  const { t, toggleLang, langLabel } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);
  const [roster, setRoster] = useState([]);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard'), end: true },
    { to: '/roster', icon: Users, label: t('nav.roster') },
    { to: '/treasury', icon: Wallet, label: t('nav.treasury') },
  ];

  useEffect(() => {
    const unsub = subscribeToRoster(setRoster);
    return () => unsub();
  }, []);

  const mySlot = roster.find(s => s.userId === currentUser?.uid || s.name === userNickname);
  const effectiveClass = userClass || mySlot?.className || '';
  const classDetails = getClassDetails(effectiveClass);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        sessionStorage.setItem('pendingNickname', nickname);
        await registerWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message?.replace('Firebase:', '').trim() || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  const startEditNickname = () => {
    setNicknameInput(userNickname || currentUser.email);
    setEditingNickname(true);
  };

  const handleSaveNickname = async () => {
    if (!nicknameInput.trim() || nicknameInput.trim() === userNickname) {
      setEditingNickname(false);
      return;
    }
    setSavingNickname(true);
    try {
      await updateUserNickname(currentUser.uid, nicknameInput.trim());
      await updateRosterNameByUserId(currentUser.uid, nicknameInput.trim());
      await refreshUserDoc(currentUser.uid);
      setEditingNickname(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNickname(false);
    }
  };

  const handleCancelNickname = () => {
    setEditingNickname(false);
  };

  if (!currentUser) {
    return (
      <div className="login-screen">
        <div className="login-card fade-in-scale">
          <div className="login-card-icon">
            <img src="/icons/icon.png" alt="OutLaw" onError={e => { e.target.style.display='none'; }} />
          </div>

          <h1>0utLaw</h1>
          <p className="login-card-subtitle">CP-Helper • UaSqud</p>
          <p className="login-card-clan">lu4.org • MasterWork</p>

          <form onSubmit={handleAuth} className="login-form">
            {error && <div className="login-form-error">{error}</div>}

            <div className="input-group">
              <label>{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder={t('auth.emailPlaceholder')}
                required
                autoComplete="email"
              />
            </div>

            {isRegistering && (
              <div className="input-group">
                <label>{t('auth.nickname')}</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="input-field"
                  placeholder={t('auth.nicknamePlaceholder')}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label>{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder={t('auth.passwordPlaceholder')}
                required
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span style={{ opacity: 0.7 }}>{t('auth.loading')}</span>
              ) : isRegistering ? (
                <><UserPlus size={18} /> {t('auth.register')}</>
              ) : (
                <><LogIn size={18} /> {t('auth.login')}</>
              )}
            </button>
          </form>

          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="login-switch-btn"
          >
            {isRegistering ? t('auth.switchToLogin') : t('auth.switchToRegister')}
          </button>
        </div>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="access-denied">
        <div className="access-denied-card fade-in">
          <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h2>{t('guest.title')}</h2>
          <p>{t('guest.message')} <strong style={{ color: 'var(--text-primary)' }}>{userNickname || currentUser.email}</strong></p>
          <p style={{ marginTop: '0.5rem' }}>{t('guest.contact', { role: t('role.member') })}</p>
          <button onClick={logOut} className="btn btn-danger" style={{ marginTop: '2rem' }}>
            <LogOut size={16} /> {t('guest.logout')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <div className="sidebar-logo-img">
              <img src="/icons/icon.png" alt="OutLaw" onError={e => { e.target.style.display='none'; }} />
            </div>
            <div>
              <h1>0utLaw</h1>
              <div className="sidebar-brand-sub">UaSqud • lu4</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          {(userRole === 'PL' || userRole === 'OFFICER') && (
            <>
              <div className="sidebar-sep" />
              <NavLink
                to="/admin"
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <ShieldAlert size={17} />
                {t('nav.admin')}
              </NavLink>
            </>
          )}

          <div className="sidebar-sep" />

          <button onClick={toggleLang} className="sidebar-link" style={{ width: '100%', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left' }}>
            <Languages size={17} />
            {langLabel}
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-top">
            <div className="sidebar-user-icon">
              {classDetails ? (
                <ClassIcon className={effectiveClass} type={classDetails.type} size={38} />
              ) : (
                <div className="sidebar-user-avatar">
                  {(userNickname || currentUser.email)?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="sidebar-user-meta">
              {editingNickname ? (
                <div className="sidebar-edit-name">
                  <input
                    type="text"
                    className="input-field"
                    value={nicknameInput}
                    onChange={e => setNicknameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveNickname(); if (e.key === 'Escape') handleCancelNickname(); }}
                    autoFocus
                    style={{ padding: '0.2rem 0.35rem', fontSize: '0.78rem', width: '100px' }}
                  />
                  <button className="btn btn-sm" onClick={handleSaveNickname} disabled={savingNickname} style={{ padding: '0.15rem 0.25rem' }}>
                    <Check size={11} />
                  </button>
                  <button className="btn btn-sm" onClick={handleCancelNickname} style={{ padding: '0.15rem 0.25rem' }}>
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <div
                  className="sidebar-user-name"
                  style={{ color: classDetails?.color || undefined }}
                  onClick={startEditNickname}
                  title={t('sidebar.editNickname')}
                >
                  {userNickname || currentUser.email}
                </div>
              )}
              <span className={getRoleBadgeClass(userRole)}>{t(`role.${userRole.toLowerCase()}`)}</span>
            </div>
          </div>
          <button onClick={logOut} className="btn btn-sm btn-block">
            <LogOut size={13} /> {t('sidebar.logout')}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
