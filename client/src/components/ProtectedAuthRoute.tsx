"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedAuthRouteProps {
  children: React.ReactNode;
}

const ProtectedAuthRoute = ({ children }: ProtectedAuthRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If user is authenticated, don't render the auth page content
  if (user) {
    return null;
  }

  // If user is not authenticated, render the auth page content
  return <>{children}</>;
};

export default ProtectedAuthRoute;
