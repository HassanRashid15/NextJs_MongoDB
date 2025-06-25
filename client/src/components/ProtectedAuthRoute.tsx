"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedAuthRouteProps {
  children: React.ReactNode;
}

const ProtectedAuthRoute = ({ children }: ProtectedAuthRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect once and only when we're sure the user is authenticated
    if (!isLoading && user && !hasRedirected) {
      setHasRedirected(true);
      router.push("/dashboard");
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

  // If user is authenticated and we haven't redirected yet, show loading
  if (user && !hasRedirected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If user is authenticated and we have redirected, don't render anything
  if (user && hasRedirected) {
    return null;
  }

  // If user is not authenticated, render the auth page content
  return <>{children}</>;
};

export default ProtectedAuthRoute;
