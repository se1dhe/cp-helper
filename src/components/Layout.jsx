import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, logOut } from '../firebase';
import { LayoutDashboard, Users, Wallet, LogIn, LogOut, Shield, ShieldAlert } from 'lucide-react';

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

  if (!currentUser) {
    return (
      <div className="login-screen">
        <div className="login-card fade-in">
          <h1>0utLaw</h1>
          <p className="login-card-subtitle">CP-Helper</p>
          <p className="login-card-clan">UaSqud • lu4.org</p>
          <button onClick={signInWithGoogle} className="btn btn-primary">
            <LogIn size={18} /> Войти через Google
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
          <p>Вы авторизованы как <strong>{currentUser.displayName}</strong>, но у вас нет прав на просмотр данных КП.</p>
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
              {currentUser.displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="sidebar-user-name">{currentUser.displayName}</div>
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
