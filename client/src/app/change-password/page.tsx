"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PasswordInput from "@/components/ui/PasswordInput";

const ChangePasswordPage = () => {
  const { token } = useAuth();
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingPage(true);
    setMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New passwords do not match");
      setIsLoadingPage(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long");
      setIsLoadingPage(false);
      return;
    }

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Password updated successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage("An error occurred while updating password");
    } finally {
      setIsLoadingPage(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Change Password
            </h1>
            <p className="text-gray-600 mt-2">Update your account password</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                label="Current Password"
                placeholder="Enter your current password"
                required
              />

              {/* New Password */}
              <PasswordInput
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                label="New Password"
                placeholder="Enter your new password"
                required
              />

              {/* Confirm New Password */}
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                label="Confirm New Password"
                placeholder="Confirm your new password"
                required
              />

              {/* Message */}
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.includes("successfully")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoadingPage}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoadingPage ? "Updating..." : "Update Password"}
              </button>
            </form>

            {/* Back to Profile Link */}
            <div className="mt-6 text-center">
              <Link
                href="/profile"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                ← Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ChangePasswordPage;
