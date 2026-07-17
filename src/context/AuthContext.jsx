import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { startPresence, stopPresence } from "../services/presenceService";
import { AlertTriangle, RefreshCw } from 'lucide-react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState("GUEST");
  const [userNickname, setUserNickname] = useState('');
  const [userClass, setUserClass] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const presenceUidRef = useRef(null);

  const refreshUserDoc = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      setUserRole(data.role || "GUEST");
      setUserClass(data.className || '');
      setUserAvatar(data.avatar || '');
      setUserLevel(data.level || 1);
      setUserNickname(data.nickname || data.displayName || userSnap.data().email);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserRole(data.role || "GUEST");
            setUserClass(data.className || '');
            setUserAvatar(data.avatar || '');
            setUserLevel(data.level || 1);
            const nickname = data.nickname || data.displayName || user.displayName || user.email;
            setUserNickname(nickname);
            if ((data.role || "GUEST") !== "GUEST") {
              presenceUidRef.current = user.uid;
              startPresence(user.uid, nickname);
            }
            const isEmailFallback = data.nickname && data.nickname === user.email;
            if ((!data.nickname || isEmailFallback) && (data.displayName || user.displayName)) {
              const newNickname = data.displayName || user.displayName;
              await updateDoc(userRef, { nickname: newNickname });
              setUserNickname(newNickname);
            }
          } else {
            const pendingNickname = sessionStorage.getItem('pendingNickname') || '';
            sessionStorage.removeItem('pendingNickname');
            const fallbackName = pendingNickname || (user.email || '').split('@')[0] || user.email || 'user';
            if (!user.displayName) {
              await updateProfile(user, { displayName: fallbackName });
            }
            await setDoc(userRef, {
              email: user.email,
              displayName: fallbackName,
              nickname: fallbackName,
              role: "GUEST",
              createdAt: new Date()
            });
            setUserRole("GUEST");
            setUserNickname(fallbackName);
            setUserClass('');
          }
          setCurrentUser(user);
          setAuthError(null);
        } else {
          if (presenceUidRef.current) {
            stopPresence(presenceUidRef.current);
            presenceUidRef.current = null;
          }
          setCurrentUser(null);
          setUserRole("GUEST");
          setAuthError(null);
        }
      } catch (err) {
        console.error("AuthProvider error:", err);
        setAuthError(err.message || 'Ошибка авторизации');
        setCurrentUser(user);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      if (presenceUidRef.current) stopPresence(presenceUidRef.current);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  if (authError && !currentUser) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', padding: '2rem',
        textAlign: 'center', background: 'var(--bg)',
      }}>
        <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Ошибка подключения
        </h2>
        <p style={{ marginBottom: '1.5rem', maxWidth: '400px', color: 'var(--text-secondary)' }}>
          {authError}
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          <RefreshCw size={16} /> Перезагрузить
        </button>
      </div>
    );
  }

  const value = {
    currentUser,
    userRole,
    userNickname,
    userClass,
    userAvatar,
    userLevel,
    isPL: userRole === "PL",
    isOfficer: userRole === "OFFICER" || userRole === "PL",
    isGuest: userRole === "GUEST",
    refreshUserDoc,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
