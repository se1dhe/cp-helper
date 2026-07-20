import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { QuestModalProvider } from './context/QuestModalContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DesktopIntegration } from './components/DesktopIntegration';
import { Titlebar } from './components/Titlebar';
import { Dashboard } from './pages/Dashboard';
import { Treasury } from './pages/Treasury';
import { Roster } from './pages/Roster';
import { Admin } from './pages/Admin';
import { MemberProgress } from './pages/MemberProgress';
import { News } from './pages/News';
import { Roadmap } from './pages/Roadmap';
import { Schedule } from './pages/Schedule';
import { Links } from './pages/Links';
import { Craft } from './pages/Craft';
import { RaidBosses } from './pages/RaidBosses';
import { Profile } from './pages/Profile';

function App() {
  return (
    <ErrorBoundary>
    <LanguageProvider>
      <AuthProvider>
        <QuestModalProvider>
        <DesktopIntegration />
        <div className="app-shell">
          <Titlebar />
          <div className="app-body">
            <HashRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="roadmap" element={<Roadmap />} />
                  <Route path="schedule" element={<Schedule />} />
                  <Route path="raidbosses" element={<RaidBosses />} />
                  <Route path="me" element={<Profile />} />
                  <Route path="craft" element={<Craft />} />
                  <Route path="links" element={<Links />} />
                  <Route path="news" element={<News />} />
                  <Route path="treasury" element={<Treasury />} />
                  <Route path="roster" element={<Roster />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="members" element={<MemberProgress />} />
                </Route>
              </Routes>
            </HashRouter>
          </div>
        </div>
        </QuestModalProvider>
      </AuthProvider>
    </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
