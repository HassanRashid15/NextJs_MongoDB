"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialUser); // Don't load if we have initial user
  const router = useRouter();

  useEffect(() => {
    // Only check localStorage if we don't have initial user data
    if (!initialUser) {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedToken && storedUser) {
          let userObj = JSON.parse(storedUser);
          // Fallback: parse firstName and lastName from name if missing
          if ((!userObj.firstName || !userObj.lastName) && userObj.name) {
            const nameParts = userObj.name.split(" ");
            userObj.firstName = nameParts[0] || "";
            userObj.lastName =
              nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
          }
          setToken(storedToken);
          setUser(userObj);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, [initialUser]);

  const login = (userData: User, userToken: string) => {
    // Fallback: parse firstName and lastName from name if missing
    let userObj = { ...userData };
    if ((!userObj.firstName || !userObj.lastName) && userObj.name) {
      const nameParts = userObj.name.split(" ");
      userObj.firstName = nameParts[0] || "";
      userObj.lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    }
    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("token", userToken);
    setUser(userObj);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
