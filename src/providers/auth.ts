import type { AuthProvider } from "@refinedev/core";
import { API_URL } from "./constants";

// Session lives in an httpOnly cookie set by admin-api -- never read or
// stored in JS here, so every call needs `credentials: "include"` to send
// it cross-site (admin-client on Vercel, admin-api on Render).
export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: { name: "LoginError", message: body.detail ?? "Invalid email or password" },
      };
    }
    return { success: true, redirectTo: "/" };
  },

  logout: async () => {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
    if (!response.ok) return { authenticated: false, redirectTo: "/login" };
    return { authenticated: true };
  },

  getIdentity: async () => {
    const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
    if (!response.ok) return null;
    const admin = await response.json();
    return { id: admin.id, name: admin.full_name, email: admin.email };
  },

  onError: async (error) => {
    if (error?.statusCode === 401) {
      return { logout: true, redirectTo: "/login" };
    }
    return {};
  },
};
