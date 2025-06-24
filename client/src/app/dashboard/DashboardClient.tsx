"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface DashboardData {
  stats?: {
    totalLogins: number;
    lastLogin: string;
    profileCompleteness: number;
  };
  recentActivity?: Array<{
    id: string;
    action: string;
    timestamp: string;
  }>;
}

interface DashboardClientProps {
  user: any;
  dashboardData: DashboardData;
}

export default function DashboardClient({
  user,
  dashboardData,
}: DashboardClientProps) {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Hi, {user?.name || "User"}!
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Welcome to your dashboard. Here's what's happening with your account.
        </p>
      </div>

      {/* Stats Grid */}
      {dashboardData.stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Logins
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {dashboardData.stats.totalLogins}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Last Login</h3>
            <p className="text-lg text-gray-600">
              {new Date(dashboardData.stats.lastLogin).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Profile Complete
            </h3>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${dashboardData.stats.profileCompleteness}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">
                {dashboardData.stats.profileCompleteness}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {dashboardData.recentActivity && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            {dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => (window.location.href = "/profile")}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View Profile
        </button>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
