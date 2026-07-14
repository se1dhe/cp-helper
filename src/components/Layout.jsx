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

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message || 'Ошибка авторизации. Проверьте данные.');
    }
  };

  if (!currentUser) {
    return (
      <div className="login-screen">
        <div className="login-card fade-in">
          <h1>0utLaw</h1>
          <p className="login-card-subtitle">CP-Helper</p>
          <p className="login-card-clan">UaSqud • lu4.org</p>
          
          <form onSubmit={handleAuth} style={{ textAlign: 'left', marginTop: '2rem' }}>
            {error && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            
            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Пароль</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-block mt-2">
              {isRegistering ? <><UserPlus size={18} /> Зарегистрироваться</> : <><LogIn size={18} /> Войти</>}
            </button>
          </form>
          
          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem', cursor: 'pointer' }}
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
          <h2>Доступ запрещён</h2>
          <p>Вы авторизованы как <strong>{currentUser.email}</strong>, но у вас нет прав на просмотр данных КП.</p>
          <p className="text-muted mt-2">Обратитесь к ПЛу для выдачи роли MEMBER или OFFICER.</p>
          <button onClick={logOut} className="btn btn-danger mt-4">
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
          <h1>0utLaw</h1>
          <div className="sidebar-brand-sub">CP-Helper • UaSqud</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {currentUser.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="sidebar-user-name">{currentUser.email}</div>
              <span className={getRoleBadgeClass(userRole)}>{userRole}</span>
            </div>
          </div>
          <button onClick={logOut} className="btn btn-sm btn-block">
            <LogOut size={14} /> Выйти
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
