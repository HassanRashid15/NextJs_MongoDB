"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">Hi, {user?.name || "User"}!</h1>
        <p className="mt-4 text-lg">Welcome to your dashboard.</p>
      </div>
    </ProtectedRoute>
  );
}
