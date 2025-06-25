"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedVerifyEmailRouteProps {
  children: React.ReactNode;
}

const ProtectedVerifyEmailRoute = ({
  children,
}: ProtectedVerifyEmailRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect if user is authenticated and email is verified
    if (!isLoading && user && user.isEmailVerified && !hasRedirected) {
      setHasRedirected(true);
      router.push("/profile");
    }
  }, [user, isLoading, router, hasRedirected]);

  if (isLoading || (user && user.isEmailVerified && !hasRedirected)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (hasRedirected) {
    return null;
  }

  // Allow access if:
  // 1. Not logged in (new registration)
  // 2. Logged in but not verified (email change)
  return <>{children}</>;
};

export default ProtectedVerifyEmailRoute;
