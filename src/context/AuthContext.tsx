"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export interface User {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified?: boolean;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to set cookie
  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  // Function to get cookie
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  // Function to remove cookie
  const removeCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  // Check authentication status with server
  const checkAuth = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem("token") || getCookie("token");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "https://authintegration-production-c198.up.railway.app"
        }/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(storedToken ?? null);
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        removeCookie("token");
        setUser(null);
        setToken(null);
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      removeCookie("token");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If we have initial user from server, use it
    if (initialUser) {
      setUser(initialUser);
      const storedToken = localStorage.getItem("token") || getCookie("token");
      setToken(storedToken ?? null);
      setIsLoading(false);
    } else {
      // Check authentication status
      checkAuth();
    }
  }, [initialUser, checkAuth]);

  const login = (userData: User, userToken: string) => {
    let userObj = { ...userData };
    if ((!userObj.firstName || !userObj.lastName) && userObj.name) {
      const nameParts = userObj.name.split(" ");
      userObj = {
        ...userObj,
        firstName: nameParts[0] || "",
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(" ") : "",
      };
    }

    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("token", userToken);
    setCookie("token", userToken, 7);

    setUser(userObj);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    removeCookie("token");
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, checkAuth, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
