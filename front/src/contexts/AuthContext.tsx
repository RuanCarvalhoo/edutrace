"use client";

import { clearSession } from "@/services/auth/session";
import { fetchSessionUser, SessionUser } from "@/services/auth/sessionUser";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<SessionUser | null>>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearSession();

    let ativo = true;
    fetchSessionUser().then((sessionUser) => {
      if (!ativo) return;
      setUser(sessionUser);
      setLoading(false);
    });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
