"use client";
import React from "react";
import Link from "next/link";

const VerifyPage = () => {
  const handleResend = () => {
    // Handle resend verification email logic here
    alert("Verification email sent!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
        <p className="text-gray-600">
          A verification link has been sent to your email address. Please check
          your inbox and click the link to verify your account.
        </p>
        <div className="mt-6">
          <button
            onClick={handleResend}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Resend Verification Email
          </button>
        </div>
        <p className="mt-4 text-sm text-center text-gray-600">
          <Link
            href="/auth/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;
