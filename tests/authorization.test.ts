import { describe, it, expect } from "vitest";

// Helper similar to requireAdmin/requireAuth logic without DB calls
function canAccessAdmin(role: string): boolean {
  return role === "admin";
}

function isAuthenticated(session: unknown): boolean {
  return session !== null && session !== undefined;
}

describe("Authorization", () => {
  it("allows admin access", () => {
    expect(canAccessAdmin("admin")).toBe(true);
  });

  it("denies normal user admin access", () => {
    expect(canAccessAdmin("user")).toBe(false);
  });

  it("denies disabled user access", () => {
    expect(canAccessAdmin("disabled")).toBe(false);
  });

  it("treats null session as unauthenticated", () => {
    expect(isAuthenticated(null)).toBe(false);
  });

  it("treats valid session as authenticated", () => {
    expect(isAuthenticated({ id: "1", email: "a@b.c" })).toBe(true);
  });
});
