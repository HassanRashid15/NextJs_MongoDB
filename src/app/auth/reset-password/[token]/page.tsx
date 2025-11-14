"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import ProtectedAuthRoute from "@/components/ProtectedAuthRoute";
import PasswordInput from "@/components/ui/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://authintegration-production-c198.up.railway.app"}/api/auth/reset-password/${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, passwordConfirm }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Password has been reset successfully. Please log in.");
        router.push("/login");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedAuthRoute>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md w-96">
          <h2 className="mb-6 text-2xl font-bold text-center">
            Reset Your Password
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="New Password"
                required
              />
            </div>
            <div className="mb-6">
              <PasswordInput
                id="passwordConfirm"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                label="Confirm New Password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </ProtectedAuthRoute>
  );
}
