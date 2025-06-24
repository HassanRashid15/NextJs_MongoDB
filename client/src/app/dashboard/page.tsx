import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardClient from "./DashboardClient";
import { getUserFromToken } from "../../lib/auth";

// Server Component with SSR
async function getDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.log("No token found, redirecting to login");
    redirect("/login");
  }

  try {
    // Get user data from token
    const user = await getUserFromToken(token);
    console.log("User data fetched:", user ? "success" : "failed");

    if (!user) {
      console.log("No user data, redirecting to login");
      redirect("/login");
    }

    // Fetch additional dashboard data
    const dashboardData = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      }/api/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store", // or "force-cache" for static data
      }
    );

    if (!dashboardData.ok) {
      console.log("Dashboard API failed, using fallback data");
      // If dashboard data fails, still show basic dashboard
      return {
        user,
        dashboardData: {
          stats: {
            totalLogins: 1,
            lastLogin: new Date().toISOString(),
            profileCompleteness: 80,
          },
          recentActivity: [],
        },
      };
    }

    const data = await dashboardData.json();
    console.log("Dashboard data fetched successfully");

    return {
      user,
      dashboardData: data,
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    redirect("/login");
  }
}

export default async function DashboardPage() {
  const { user, dashboardData } = await getDashboardData();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient user={user} dashboardData={dashboardData} />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
}
