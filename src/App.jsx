import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DesktopIntegration } from './components/DesktopIntegration';
import { Dashboard } from './pages/Dashboard';
import { Treasury } from './pages/Treasury';
import { Roster } from './pages/Roster';
import { Admin } from './pages/Admin';
import { MemberProgress } from './pages/MemberProgress';
import { News } from './pages/News';
import { Roadmap } from './pages/Roadmap';
import { Schedule } from './pages/Schedule';

function App() {
  return (
    <ErrorBoundary>
    <LanguageProvider>
      <AuthProvider>
        <DesktopIntegration />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="news" element={<News />} />
              <Route path="treasury" element={<Treasury />} />
              <Route path="roster" element={<Roster />} />
              <Route path="admin" element={<Admin />} />
              <Route path="members" element={<MemberProgress />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
