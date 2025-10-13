"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ActivityDetailsModal from "@/components/ui/ActivityDetailsModal";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  systemHealth: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stats] = useState<DashboardStats>({
    totalUsers: 1250,
    activeUsers: 892,
    newUsers: 45,
    systemHealth: "Excellent",
  });

  // Modal state for activity details
  const [selectedActivity, setSelectedActivity] = useState<{
    id: number;
    action: string;
    time: string;
    type: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentActivity] = useState([
    { id: 1, action: "Profile updated", time: "2 hours ago", type: "profile" },
    { id: 2, action: "Password changed", time: "1 day ago", type: "security" },
    {
      id: 3,
      action: "Email verified",
      time: "3 days ago",
      type: "verification",
    },
    { id: 4, action: "Account created", time: "1 week ago", type: "account" },
  ]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityClick = (activity: {
    id: number;
    action: string;
    time: string;
    type: string;
  }) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const convertRelativeTimeToTimestamp = (relativeTime: string): string => {
    const now = new Date();

    if (relativeTime.includes("hour")) {
      const hours = parseInt(relativeTime.match(/(\d+)/)?.[1] || "0");
      now.setHours(now.getHours() - hours);
    } else if (relativeTime.includes("day")) {
      const days = parseInt(relativeTime.match(/(\d+)/)?.[1] || "0");
      now.setDate(now.getDate() - days);
    } else if (relativeTime.includes("week")) {
      const weeks = parseInt(relativeTime.match(/(\d+)/)?.[1] || "0");
      now.setDate(now.getDate() - weeks * 7);
    } else if (relativeTime.includes("month")) {
      const months = parseInt(relativeTime.match(/(\d+)/)?.[1] || "0");
      now.setMonth(now.getMonth() - months);
    }

    return now.toISOString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "profile":
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
            <svg
              className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        );
      case "security":
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
            <svg
              className="w-4 h-4 text-green-600 group-hover:text-green-700 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        );
      case "verification":
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
            <svg
              className="w-4 h-4 text-purple-600 group-hover:text-purple-700 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
            <svg
              className="w-4 h-4 text-gray-600 group-hover:text-gray-700 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user.firstName || user.name || "User"}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>{isLoading ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  +{stats.newUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  System Health
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.systemHealth}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Quick Actions
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your account and settings
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/profile" className="group">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                          <svg
                            className="w-5 h-5 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-indigo-700">
                            View Profile
                          </h3>
                          <p className="text-sm text-gray-600">
                            Manage your account information
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/change-password" className="group">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-green-700">
                            Change Password
                          </h3>
                          <p className="text-sm text-gray-600">
                            Update your security settings
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/profile" className="group">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-purple-700">
                            Account Settings
                          </h3>
                          <p className="text-sm text-gray-600">
                            Customize your preferences
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/" className="group">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-700">
                            Go Home
                          </h3>
                          <p className="text-sm text-gray-600">
                            Return to main page
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <p className="text-gray-600 mt-1">
                  Your latest account actions
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                      onClick={() => handleActivityClick(activity)}
                    >
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-900 transition-colors duration-200">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    View all activity →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Account Information
              </h2>
              <p className="text-gray-600 mt-1">Your current account details</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Personal Information
                  </h3>
                  <div className="mt-3 space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.name || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="text-sm font-medium text-gray-900">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        Account Status:
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Account Details
                  </h3>
                  <div className="mt-3 space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">
                        Member Since:
                      </span>
                      <p className="text-sm font-medium text-gray-900">
                        Unknown
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Last Login:</span>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        Email Verified:
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                          user.isEmailVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.isEmailVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Details Modal */}
        <ActivityDetailsModal
          activity={
            selectedActivity
              ? {
                  id: selectedActivity.id.toString(),
                  action: selectedActivity.action,
                  timestamp: convertRelativeTimeToTimestamp(
                    selectedActivity.time
                  ),
                  type: selectedActivity.type,
                }
              : null
          }
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      </div>
    </div>
  );
}
