"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { user, logout, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log("Navbar render - user:", user, "isLoading:", isLoading);

  const getInitials = (name: string | undefined | null) => {
    console.log("getInitials called with:", name, "type:", typeof name);

    if (!name || typeof name !== "string") {
      console.log("Returning default initial: U");
      return "U"; // Default initial for unknown user
    }

    const names = name.trim().split(" ");
    console.log("Split names:", names);
    const firstName = names[0] || "";
    const lastName = names.length > 1 ? names[names.length - 1] : "";
    const initials = `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();
    console.log(
      "Generated initials:",
      initials,
      "from firstName:",
      firstName,
      "lastName:",
      lastName
    );
    return initials;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Logo
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link href="/about" className="hover:text-gray-300">
            About
          </Link>
          <Link href="/contact" className="hover:text-gray-300">
            Contact
          </Link>
        </div>
        <div>
          {isLoading ? (
            <div></div> // Render nothing or a placeholder during auth state loading
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white focus:outline-none"
              >
                {getInitials(user?.name)}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-black z-10">
                  <div className="px-4 py-2 border-b">
                    <p className="font-bold">{user?.name || "User"}</p>
                    <p className="text-sm text-gray-500">{user?.email || ""}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
