import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { signInWithEmail, registerWithEmail, logOut } from '../firebase';
import { subscribeToRoster } from '../services/rosterService';
import { isRegistrationAllowed } from '../services/registrationService';
import { LayoutDashboard, Users, Wallet, LogIn, LogOut, ShieldAlert, UserPlus, Languages, UserCheck, Newspaper, Map as MapIcon, CalendarClock, Pencil, Settings, Hammer, Link2, Skull, User, Search } from 'lucide-react';
import { L2_CLASSES } from '../utils/classes';
import { ClassIcon } from './ClassIcon';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './SettingsModal';
import { SearchPalette } from './SearchPalette';

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
  const { currentUser, userRole, userNickname, userClass, userAvatar, userLevel, isGuest } = useAuth();
  const { t, toggleLang, langLabel } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard'), end: true },
    { to: '/me', icon: User, label: t('nav.profile') },
    { to: '/roadmap', icon: MapIcon, label: t('nav.roadmap') },
    { to: '/schedule', icon: CalendarClock, label: t('nav.schedule') },
    { to: '/raidbosses', icon: Skull, label: t('nav.raidbosses') },
    { to: '/craft', icon: Hammer, label: t('nav.craft') },
    { to: '/links', icon: Link2, label: t('nav.links') },
    { to: '/news', icon: Newspaper, label: t('nav.news') },
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
        const allowed = await isRegistrationAllowed(email);
        if (!allowed) {
          setError(t('auth.registrationClosed'));
          setLoading(false);
          return;
        }
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

  if (!currentUser) {
    return (
      <div className="login-screen">
        <div className="login-card fade-in-scale">
          <div className="login-card-icon">
            <img src="/icons/icon.png" alt="OutLaw" onError={e => { e.target.style.display='none'; }} />
          </div>

          <h1>0utLaw</h1>
          <p className="login-card-subtitle">CP-Helper • UASQUAD</p>
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
              <div className="sidebar-brand-sub">UASQUAD • lu4</div>
            </div>
          </div>
        </div>

        <button className="sidebar-search-btn" onClick={() => setSearchOpen(true)}>
          <Search size={15} /> <span>{t('search.open')}</span> <kbd>Ctrl K</kbd>
        </button>

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

          {userRole === 'PL' && (
            <>
              <div className="sidebar-sep" />
              <NavLink
                to="/roster"
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <Users size={17} />
                {t('nav.roster')}
              </NavLink>
            </>
          )}
          {(userRole === 'PL' || userRole === 'OFFICER') && (
            <>
              <div className="sidebar-sep" />
              <NavLink
                to="/members"
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <UserCheck size={17} />
                {t('nav.members')}
              </NavLink>
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
          <button onClick={() => setSettingsOpen(true)} className="sidebar-link" style={{ width: '100%', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left' }}>
            <Settings size={17} />
            {t('settings.title')}
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-top">
            <button className="sidebar-user-icon sidebar-user-icon--btn" onClick={() => setProfileOpen(true)} title={t('profile.title')}>
              {userAvatar ? (
                <img src={userAvatar} alt="" className="sidebar-user-photo" />
              ) : classDetails ? (
                <ClassIcon className={effectiveClass} type={classDetails.type} size={38} />
              ) : (
                <div className="sidebar-user-avatar">
                  {(userNickname || currentUser.email)?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </button>
            <div className="sidebar-user-meta">
              <div
                className="sidebar-user-name"
                style={{ color: classDetails?.color || undefined }}
                onClick={() => setProfileOpen(true)}
                title={t('profile.edit')}
              >
                <span className="sidebar-user-name-text">{userNickname || currentUser.email}</span>
                <Pencil size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
              </div>
              <div className="sidebar-user-sub">
                <span className={getRoleBadgeClass(userRole)}>{t(`role.${userRole.toLowerCase()}`)}</span>
                {userLevel > 1 && <span className="sidebar-user-lvl">{t('profile.lvlShort')} {userLevel}</span>}
              </div>
            </div>
          </div>
          <button onClick={logOut} className="btn btn-sm btn-block">
            <LogOut size={13} /> {t('sidebar.logout')}
          </button>
        </div>
      </aside>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />


      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
