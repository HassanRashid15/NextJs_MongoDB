// Client-side auth utilities for SSR

export async function getUserFromToken(token: string) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "https://authintegration-production-c198.up.railway.app"
      }/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getDashboardData(token: string) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "https://authintegration-production-c198.up.railway.app"
      }/api/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}
