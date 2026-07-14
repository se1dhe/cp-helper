import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Treasury } from './pages/Treasury';
import { Roster } from './pages/Roster';

function App() {
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await check();
        if (update?.available) {
          const yes = await ask(
            `Доступна новая версия ${update.version}!\n\n${update.body || ''}\n\nХотите установить обновление сейчас?`, 
            { title: 'Доступно обновление', kind: 'info' }
          );
          if (yes) {
            await update.downloadAndInstall();
            // Need to restart the app, usually Tauri does this automatically
            // or we can call process.exit(0) if we import process
          }
        }
      } catch (e) {
        console.error('Failed to check for updates:', e);
      }
    };
    
    checkForUpdates();
  }, []);

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="treasury" element={<Treasury />} />
            <Route path="roster" element={<Roster />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
