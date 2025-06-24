"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    let cooldownTimer: NodeJS.Timeout;
    if (cooldown > 0) {
      cooldownTimer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(cooldownTimer);
  }, [cooldown]);

  const handleResendCode = async () => {
    if (!email || cooldown > 0) return;

    setResending(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/resend-verification-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setCooldown(60);
        setTimer(60);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email not found. Please register again.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        router.push("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Verify Your Email
        </h2>
        <p className="mb-4 text-center text-gray-600">
          A 6-digit verification code has been sent to <strong>{email}</strong>.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700"
              >
                Verification Code
              </label>
              {timer > 0 ? (
                <span className="text-sm font-mono text-gray-500">
                  Expires in: {timer}s
                </span>
              ) : (
                <span className="text-sm text-red-500">Code expired</span>
              )}
            </div>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              required
              maxLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading || timer === 0}
            className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={handleResendCode}
            disabled={resending || cooldown > 0}
            className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
}
