"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import ActivityDetailsModal from "@/components/ui/ActivityDetailsModal";

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
    details?: string;
  }>;
}

interface ProfileStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  action?: string;
  actionLink?: string;
}

const ProfileClient = () => {
  const { user, token, setUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      totalLogins: 1,
      lastLogin: new Date().toISOString(),
      profileCompleteness: 80,
    },
    recentActivity: [],
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Modal state for activity details
  const [selectedActivity, setSelectedActivity] = useState<{
    id: string;
    action: string;
    timestamp: string;
    details?: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setDataLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          }/api/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.log("Dashboard API failed, using fallback data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Calculate profile completion steps
  const getProfileSteps = (): ProfileStep[] => {
    const hasName = !!(user?.firstName && user?.lastName);
    const hasEmail = !!user?.email;
    const isEmailVerified = !!user?.isEmailVerified;
    const hasProfileImage = !!user?.profileImage;

    return [
      {
        id: "name",
        title: "Add Your Name",
        description:
          "Fill in your first and last name for a personalized experience",
        icon: "👤",
        completed: hasName,
        action: hasName ? "Completed" : "Add Name",
        actionLink: hasName ? undefined : "#profile-details",
      },
      {
        id: "email",
        title: "Add Email Address",
        description: "Provide your email address for account communication",
        icon: "📧",
        completed: hasEmail,
        action: hasEmail ? "Completed" : "Add Email",
        actionLink: hasEmail ? undefined : "#profile-details",
      },
      {
        id: "verify-email",
        title: "Verify Your Email",
        description: "Confirm your email address to enhance account security",
        icon: "✅",
        completed: isEmailVerified,
        action: isEmailVerified ? "Verified" : "Verify Email",
        actionLink: isEmailVerified ? undefined : "/verify-email",
      },
      {
        id: "profile-image",
        title: "Upload Profile Picture",
        description: "Add a profile photo to make your account more personal",
        icon: "📸",
        completed: hasProfileImage,
        action: hasProfileImage ? "Uploaded" : "Upload Photo",
        actionLink: hasProfileImage ? undefined : "#profile-image",
      },
      {
        id: "password",
        title: "Set Strong Password",
        description: "Ensure your account security with a strong password",
        icon: "🔒",
        completed: true, // Assuming they have a password if they're logged in
        action: "Secure",
        actionLink: "/change-password",
      },
    ];
  };

  const profileSteps = getProfileSteps();
  const completedSteps = profileSteps.filter((step) => step.completed).length;
  const totalSteps = profileSteps.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsEditing(false);
        if (data.emailVerificationRequired) {
          toast.success(
            "Email updated! Please verify your new email address to continue."
          );
          logout();
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } else {
          setUser((prev) => (prev ? { ...prev, ...data } : prev));
          toast.success(
            "Profile updated successfully! Activity logged in recent activities."
          );
          // Refresh dashboard data to show new activities
          await refreshDashboardData();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const handleProfileImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveProfileImage = async () => {
    if (!selectedImage) return;
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("profileImage", selectedImage);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/auth/upload-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedImage(null);
        setPreviewUrl(null);
        setUser((prev) =>
          prev ? { ...prev, profileImage: data.profileImage } : prev
        );
        toast.success(
          "Profile picture uploaded successfully! Activity logged."
        );
        // Refresh dashboard data to show new activity
        await refreshDashboardData();
      } else {
        alert("Failed to upload image");
      }
    } catch {
      alert("Error uploading image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    setIsDeletingImage(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/auth/profile/image`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setSelectedImage(null);
        setPreviewUrl(null);
        setUser((prev) => (prev ? { ...prev, profileImage: undefined } : prev));
        toast.success("Profile picture deleted successfully! Activity logged.");
        // Refresh dashboard data to show new activity
        await refreshDashboardData();
      } else {
        alert("Failed to delete image");
      }
    } catch {
      alert("Error deleting image");
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleActivityClick = (activity: {
    id: string;
    action: string;
    timestamp: string;
    details?: string;
  }) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  // Helper function to refresh dashboard data
  const refreshDashboardData = async () => {
    try {
      const dashboardResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setDashboardData(dashboardData);
      }
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
          {/* Current Time Display */}
          <div className="mt-4">
            <DateTimeDisplay
              type="datetime"
              showIcon={true}
              live={true}
              className="text-sm text-gray-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Profile Picture Header */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Profile Picture
                </h3>
                <p className="text-sm text-gray-600">
                  Click to edit your photo
                </p>
              </div>

              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative" id="profile-image">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleProfileImageChange}
                    disabled={isUploadingImage}
                  />
                  {/* Delete icon - positioned outside the clickable area */}
                  {(user.profileImage || previewUrl) && !isUploadingImage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProfileImage();
                      }}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-600 hover:text-white transition-colors z-10"
                      title="Remove profile picture"
                      disabled={isDeletingImage}
                    >
                      {isDeletingImage ? (
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                  <div
                    className="cursor-pointer group"
                    onClick={handleProfileImageClick}
                    title="Edit profile picture"
                    style={{ opacity: isUploadingImage ? 0.5 : 1 }}
                  >
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : user.profileImage ? (
                      <Image
                        src={getImageUrl(user.profileImage)}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                        {getInitials(user.firstName || "", user.lastName || "")}
                      </div>
                    )}
                    {/* Edit icon */}
                    <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {isUploadingImage ? (
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  {/* Save button for new image */}
                  {previewUrl && !isUploadingImage && (
                    <button
                      type="button"
                      onClick={handleSaveProfileImage}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Save Profile Picture
                    </button>
                  )}
                </div>

                {/* Verification Badge */}
                <div className="mt-4 flex justify-center">
                  <div
                    className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                      user.isEmailVerified
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center">
                      {user.isEmailVerified ? (
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span>
                        {user.isEmailVerified
                          ? "Verified Account"
                          : "Unverified Account"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Name Display */}
                <div className="mt-3 text-center">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.name || "User"}
                  </h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details and Dashboard Data */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Details */}
              <div
                className="bg-white rounded-2xl shadow-lg p-6"
                id="profile-details"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Profile Details
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={isLoadingProfile}
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                      >
                        {isLoadingProfile ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-900">
                        {user.firstName || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-900">
                        {user.lastName || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dashboard Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Account Statistics
                </h3>

                {dataLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Logins
                          </p>
                          <p className="text-2xl font-bold text-indigo-600">
                            {dashboardData.stats?.totalLogins || 0}
                          </p>
                        </div>
                        <div className="text-indigo-600">
                          <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Last Login
                          </p>
                          <p className="text-lg font-semibold text-green-600">
                            {dashboardData.stats?.lastLogin
                              ? new Date(
                                  dashboardData.stats.lastLogin
                                ).toLocaleDateString()
                              : "Never"}
                          </p>
                        </div>
                        <div className="text-green-600">
                          <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Profile Complete
                          </p>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${completionPercentage}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-blue-600">
                              {completionPercentage}%
                            </span>
                          </div>
                        </div>
                        <div className="text-blue-600 ml-4">
                          <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Section */}
            {dashboardData.recentActivity &&
              dashboardData.recentActivity.length > 0 && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 h-[250px] overflow-y-auto">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {dashboardData.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3 group-hover:bg-indigo-700 transition-colors duration-200"></div>
                          <div>
                            <p className="text-gray-900 font-medium group-hover:text-indigo-900 transition-colors duration-200">
                              {activity.action}
                            </p>
                            {activity.details && (
                              <p className="text-sm text-gray-600">
                                {activity.details}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Modern Profile Completion Guide */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Complete Your Profile
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Progress:</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {completedSteps}/{totalSteps}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {profileSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      step.completed
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Step Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                          step.completed
                            ? "bg-green-500 text-white shadow-lg"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {step.completed ? (
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span>{step.icon}</span>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4
                            className={`font-semibold text-lg ${
                              step.completed
                                ? "text-green-800"
                                : "text-gray-900"
                            }`}
                          >
                            {step.title}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              step.completed
                                ? "bg-green-100 text-green-800"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {step.action}
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            step.completed ? "text-green-700" : "text-gray-600"
                          }`}
                        >
                          {step.description}
                        </p>

                        {/* Action Button */}
                        {step.actionLink && !step.completed && (
                          <div className="mt-3">
                            {step.actionLink.startsWith("#") ? (
                              <button
                                onClick={() => {
                                  const element = document.querySelector(
                                    step.actionLink!
                                  );
                                  element?.scrollIntoView({
                                    behavior: "smooth",
                                  });
                                }}
                                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                {step.action}
                                <svg
                                  className="w-4 h-4 ml-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </button>
                            ) : (
                              <Link
                                href={step.actionLink}
                                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                {step.action}
                                <svg
                                  className="w-4 h-4 ml-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Completion Badge */}
                    {step.completed && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Completion Message */}
              {completionPercentage === 100 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">
                        Profile Complete!
                      </h4>
                      <p className="text-sm text-green-700">
                        Congratulations! Your profile is 100% complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Tip */}
              {completionPercentage < 100 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-blue-700">
                      <strong>Tip:</strong> Complete all steps to unlock the
                      full potential of your account and enhance your security.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Details Modal */}
        <ActivityDetailsModal
          activity={selectedActivity}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      </div>
    </div>
  );
};

export default ProfileClient;
