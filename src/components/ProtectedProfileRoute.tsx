"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedProfileRouteProps {
  children: React.ReactNode;
}

const ProtectedProfileRoute = ({ children }: ProtectedProfileRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !hasRedirected) {
      setHasRedirected(true);
      router.push("/login");
    }
  }, [user, isLoading, router, hasRedirected]);

  if (isLoading || (!user && !hasRedirected)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (hasRedirected) {
    return null;
  }

  // Allow access if logged in (regardless of verification)
  return <>{children}</>;
};

export default ProtectedProfileRoute;
