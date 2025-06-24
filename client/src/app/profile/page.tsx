import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ProfileClient from "./ProfileClient";
import { getUserFromToken } from "@/lib/auth";

// Server Component with SSR
async function getProfileData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    // Get user data from token
    const user = await getUserFromToken(token);

    if (!user) {
      redirect("/login");
    }

    return { user };
  } catch (error) {
    console.error("Profile data fetch error:", error);
    redirect("/login");
  }
}

export default async function ProfilePage() {
  const { user } = await getProfileData();

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileClient user={user} />
    </Suspense>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-300 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
