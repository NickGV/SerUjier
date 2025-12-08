"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  nombre: string;
  rol: "admin" | "directiva" | "ujier";
  email?: string;
  activo?: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoading(true);

      try {
        // Verificar si hay una sesión activa
        const response = await fetch("/api/auth/check-session");

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            const userInfo: User = {
              id: data.user.id,
              nombre: data.user.nombre,
              rol: data.user.rol,
              email: data.user.email,
              activo: data.user.activo,
            };

            setUser(userInfo);
            localStorage.setItem("currentUser", JSON.stringify(userInfo));
          } else {
            setUser(null);
            localStorage.removeItem("currentUser");
          }
        } else {
          // No hay sesión válida
          setUser(null);
          localStorage.removeItem("currentUser");
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        setUser(null);
        localStorage.removeItem("currentUser");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const logout = async () => {
    try {
      // Llamar al endpoint de logout para limpiar cookies del servidor
      await fetch("/api/auth/session", {
        method: "DELETE",
      });

      setUser(null);
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error durante el logout:", error);
      // Incluso si hay error, limpiar el estado local
      setUser(null);
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
  };

  const value = {
    user,
    setUser: (newUser: User | null) => {
      setUser(newUser);
      if (newUser) {
        localStorage.setItem("currentUser", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("currentUser");
      }
    },
    logout,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
