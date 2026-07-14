import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithEmail, registerWithEmail, logOut } from '../firebase';
import { LayoutDashboard, Users, Wallet, LogIn, LogOut, ShieldAlert, UserPlus } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Дашборд', end: true },
  { to: '/roster', icon: Users, label: 'Ростер' },
  { to: '/treasury', icon: Wallet, label: 'Казна' },
];

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'PL': return 'role-badge role-badge-pl';
    case 'OFFICER': return 'role-badge role-badge-officer';
    case 'MEMBER': return 'role-badge role-badge-member';
    default: return 'role-badge role-badge-guest';
  }
};

export const Layout = () => {
  const { currentUser, userRole, isGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message?.replace('Firebase:', '').trim() || 'Ошибка авторизации');
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
          <p className="login-card-subtitle">CP-Helper • UaSqud</p>
          <p className="login-card-clan">lu4.org • MasterWork</p>

          <form onSubmit={handleAuth} className="login-form">
            {error && <div className="login-form-error">{error}</div>}

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span style={{ opacity: 0.7 }}>Загрузка...</span>
              ) : isRegistering ? (
                <><UserPlus size={18} /> Зарегистрироваться</>
              ) : (
                <><LogIn size={18} /> Войти</>
              )}
            </button>
          </form>

          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="login-switch-btn"
          >
            {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
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
          <h2>Ожидание одобрения</h2>
          <p>Вы авторизованы как <strong style={{ color: 'var(--text-primary)' }}>{currentUser.email}</strong></p>
          <p style={{ marginTop: '0.5rem' }}>Обратитесь к ПЛ для выдачи роли <strong style={{ color: 'var(--gold)' }}>MEMBER</strong> или выше.</p>
          <button onClick={logOut} className="btn btn-danger" style={{ marginTop: '2rem' }}>
            <LogOut size={16} /> Выйти
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
                Управление
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {currentUser.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name">{currentUser.email}</div>
              <span className={getRoleBadgeClass(userRole)}>{userRole}</span>
            </div>
          </div>
          <button onClick={logOut} className="btn btn-sm btn-block">
            <LogOut size={13} /> Выйти
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
