import { describe, it, expect } from "vitest";

// Ownership check helpers mirroring the API route logic

function checkOwnership(ownerId: string, currentUserId: string): boolean {
  return ownerId === currentUserId;
}

describe("Project and generation ownership", () => {
  it("allows access to own projects", () => {
    expect(checkOwnership("user1", "user1")).toBe(true);
  });

  it("blocks access to other users' projects", () => {
    expect(checkOwnership("user1", "user2")).toBe(false);
  });

  it("blocks empty owner id", () => {
    expect(checkOwnership("", "user1")).toBe(false);
  });

  it("blocks when requester id is missing", () => {
    expect(checkOwnership("user1", "")).toBe(false);
  });
});
