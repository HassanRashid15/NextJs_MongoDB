"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/context/AuthContext";

// Extend Window interface to include debug property
declare global {
  interface Window {
    _debugAuth?: {
      user: User | null;
      isLoading: boolean;
      hasRedirected: boolean;
    };
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Debug: expose auth state to window for inspection
  if (typeof window !== "undefined") {
    window._debugAuth = { user, isLoading, hasRedirected };
  }

  useEffect(() => {
    if (!isLoading && !user && !hasRedirected) {
      setHasRedirected(true);
      router.push("/login");
    } else if (!isLoading && user && !user.isEmailVerified && !hasRedirected) {
      setHasRedirected(true);
      router.push("/verify-email");
    }
  }, [user, isLoading, router, hasRedirected]);

  // If we're still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If user is not authenticated and we haven't redirected yet, show loading
  if (!user && !hasRedirected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If user is not authenticated and we have redirected, don't render anything
  if ((!user || (user && !user.isEmailVerified)) && hasRedirected) {
    return null;
  }

  // If user is authenticated and verified, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
