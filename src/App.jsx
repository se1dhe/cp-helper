import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { check } from '@tauri-apps/plugin-updater';
import { ask } from '@tauri-apps/plugin-dialog';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Treasury } from './pages/Treasury';
import { Roster } from './pages/Roster';
import { Admin } from './pages/Admin';

function App() {
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await check();
        if (update?.available) {
          const yes = await ask(
            `Доступна новая версия ${update.version}!`,
            { title: 'Доступно обновление', kind: 'info' }
          );
          if (yes) {
            await update.downloadAndInstall();
          }
        }
      } catch (e) {
        console.error('Failed to check for updates:', e);
      }
    };

    checkForUpdates();
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="treasury" element={<Treasury />} />
              <Route path="roster" element={<Roster />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
