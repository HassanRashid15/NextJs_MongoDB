import { Suspense } from "react";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import HomeClient from "./HomeClient";

// Server Component with SSR
async function getHomeData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let user = null;
  let isAuthenticated = false;

  if (token) {
    try {
      user = await getUserFromToken(token);
      isAuthenticated = !!user;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  // Fetch any additional home page data
  const stats = {
    totalUsers: 1234,
    activeUsers: 567,
    features: [
      "Email Verification",
      "Password Reset",
      "Protected Routes",
      "Profile Management",
    ],
  };

  return {
    user,
    isAuthenticated,
    stats,
  };
}

export default async function HomePage() {
  const { user, isAuthenticated, stats } = await getHomeData();

  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeClient 
        user={user} 
        isAuthenticated={isAuthenticated} 
        stats={stats} 
      />
    </Suspense>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-300 rounded w-96 mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-80 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
