"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface HomeClientProps {
  user: any;
  isAuthenticated: boolean;
  stats: {
    totalUsers: number;
    activeUsers: number;
    features: string[];
  };
}

export default function HomeClient({ user, isAuthenticated, stats }: HomeClientProps) {
  const { login } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      {/* Hero Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to Our Authentication System
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          A secure, full-stack authentication system built with Next.js, MongoDB, and Express.js. 
          Featuring email verification, password reset, and protected routes.
        </p>
        
        {isAuthenticated ? (
          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/profile"
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              View Profile
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-indigo-600 mb-2">
            {stats.totalUsers.toLocaleString()}
          </h3>
          <p className="text-gray-600">Total Users</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-green-600 mb-2">
            {stats.activeUsers.toLocaleString()}
          </h3>
          <p className="text-gray-600">Active Users</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-indigo-100 mb-6">
          Join thousands of users who trust our authentication system.
        </p>
        {!isAuthenticated && (
          <Link
            href="/register"
            className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Create Account
          </Link>
        )}
      </div>
    </div>
  );
} 