import React from "react";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../ProtectedRoute";
import { AuthProvider } from "../../context/AuthContext";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

const TestComponent = () => <div>Protected Content</div>;

describe("ProtectedRoute", () => {
  it("should render children when user is authenticated", () => {
    // Mock localStorage to return authenticated user
    const mockUser = { name: "Test User", email: "test@example.com" };
    const mockToken = "mock-token";

    localStorage.getItem.mockImplementation((key) => {
      if (key === "user") return JSON.stringify(mockUser);
      if (key === "token") return mockToken;
      return null;
    });

    render(
      <AuthProvider>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should show loading spinner when checking authentication", () => {
    // Mock localStorage to return null (no user)
    localStorage.getItem.mockReturnValue(null);

    render(
      <AuthProvider>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </AuthProvider>
    );

    // Should show loading spinner initially
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
