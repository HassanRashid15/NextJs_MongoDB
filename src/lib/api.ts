// API service layer for centralized API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://authintegration-production.up.railway.app";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || "An error occurred",
        };
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch {
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  }

  // Auth endpoints
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async verifyEmail(data: {
    email: string;
    code: string;
  }): Promise<ApiResponse> {
    return this.request("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resendVerificationCode(data: { email: string }): Promise<ApiResponse> {
    return this.request("/api/auth/resend-verification-code", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: { email: string }): Promise<ApiResponse> {
    return this.request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resetPassword(
    token: string,
    data: {
      password: string;
      passwordConfirm: string;
    }
  ): Promise<ApiResponse> {
    return this.request(`/api/auth/reset-password/${token}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Protected endpoints
  async changePassword(
    data: {
      currentPassword: string;
      newPassword: string;
    },
    token: string
  ): Promise<ApiResponse> {
    return this.request("/api/auth/change-password", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async updateProfile(
    data: {
      firstName: string;
      lastName: string;
      email: string;
    },
    token: string
  ): Promise<ApiResponse> {
    return this.request("/api/auth/update-profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async uploadProfileImage(
    formData: FormData,
    token: string
  ): Promise<ApiResponse> {
    return this.request("/api/auth/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  }

  async deleteProfileImage(token: string): Promise<ApiResponse> {
    return this.request("/api/auth/profile/image", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService(API_BASE_URL);

// Export the class for testing
export { ApiService };
