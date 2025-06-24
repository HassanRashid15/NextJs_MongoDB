import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js + MongoDB Auth System",
  description:
    "A full-stack authentication system with email verification and protected routes",
  keywords: ["authentication", "nextjs", "mongodb", "email verification"],
  authors: [{ name: "Your Name" }],
  viewport: "width=device-width, initial-scale=1",
};

// Server-side data fetching for layout
async function getLayoutData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { user: null };
  }

  try {
    const user = await getUserFromToken(token);
    return { user };
  } catch (error) {
    return { user: null };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getLayoutData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider initialUser={user}>
          <div className="flex flex-col min-h-screen">
            <Navbar initialUser={user} />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
