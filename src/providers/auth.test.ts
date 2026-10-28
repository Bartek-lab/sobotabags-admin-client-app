import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authProvider } from "./auth";
import { API_URL } from "./constants";

function jsonResponse(body: unknown, init?: Partial<ResponseInit>) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("authProvider", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  describe("login", () => {
    it("sends credentials:include and stores no token on success", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ admin: { id: "1" } }, { status: 200 }));

      const result = await authProvider.login({ email: "a@a.com", password: "pw" });

      expect(result).toEqual({ success: true, redirectTo: "/" });
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/auth/login`,
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "a@a.com", password: "pw" }),
        }),
      );
      // Never written to localStorage -- session lives only in the httpOnly cookie.
      expect(localStorage.length).toBe(0);
    });

    it("surfaces the server's detail message and returns success:false on failure", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ detail: "Invalid email or password" }, { status: 401 }),
      );

      const result = await authProvider.login({ email: "a@a.com", password: "wrong" });

      expect(result).toEqual({
        success: false,
        error: { name: "LoginError", message: "Invalid email or password" },
      });
    });

    it("falls back to a generic message when the error body has no detail", async () => {
      fetchMock.mockResolvedValueOnce(new Response("not json", { status: 500 }));

      const result = await authProvider.login({ email: "a@a.com", password: "wrong" });

      expect(result).toEqual({
        success: false,
        error: { name: "LoginError", message: "Invalid email or password" },
      });
    });
  });

  describe("logout", () => {
    it("posts to /auth/logout with credentials:include and always reports success", async () => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

      const result = await authProvider.logout({});

      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      expect(result).toEqual({ success: true, redirectTo: "/login" });
    });

    it("still reports success even if the logout request itself rejects", async () => {
      fetchMock.mockRejectedValueOnce(new Error("network down"));

      const result = await authProvider.logout({});

      expect(result).toEqual({ success: true, redirectTo: "/login" });
    });
  });

  describe("check", () => {
    it("reports authenticated:true when /auth/me responds ok", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ id: "1" }));

      const result = await authProvider.check?.();

      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/auth/me`, { credentials: "include" });
      expect(result).toEqual({ authenticated: true });
    });

    it("reports authenticated:false and redirects to /login on a non-ok response", async () => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

      const result = await authProvider.check?.();

      expect(result).toEqual({ authenticated: false, redirectTo: "/login" });
    });
  });

  describe("getIdentity", () => {
    it("maps the /auth/me response to an identity object", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ id: "1", full_name: "Jan Kowalski", email: "jan@sobotabags.pl" }),
      );

      const identity = await authProvider.getIdentity?.();

      expect(identity).toEqual({ id: "1", name: "Jan Kowalski", email: "jan@sobotabags.pl" });
    });

    it("returns null on a non-ok response", async () => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

      const identity = await authProvider.getIdentity?.();

      expect(identity).toBeNull();
    });
  });

  describe("onError", () => {
    it("triggers logout only for a 401 status code", async () => {
      await expect(authProvider.onError?.({ statusCode: 401 })).resolves.toEqual({
        logout: true,
        redirectTo: "/login",
      });
    });

    it("does nothing for other status codes", async () => {
      await expect(authProvider.onError?.({ statusCode: 500 })).resolves.toEqual({});
      await expect(authProvider.onError?.({})).resolves.toEqual({});
    });
  });
});
