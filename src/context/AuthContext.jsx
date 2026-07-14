import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState("GUEST"); // PL, OFFICER, MEMBER, GUEST
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserRole(userSnap.data().role || "GUEST");
        } else {
          // Если юзера нет в базе, создаем его с ролью GUEST (без прав просмотра)
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            role: "GUEST",
            createdAt: new Date()
          });
          setUserRole("GUEST");
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserRole("GUEST");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    isPL: userRole === "PL",
    isOfficer: userRole === "OFFICER" || userRole === "PL",
    isGuest: userRole === "GUEST",
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
