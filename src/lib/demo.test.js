import { beforeEach, describe, expect, it, vi } from "vitest";

// demo.js reads the env when it loads, so each test stubs the env and re-imports it
const loadDemo = () => import("./demo");

describe("demo account settings", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("has no demo credentials when the env vars are missing", async () => {
    vi.stubEnv("VITE_DEMO_EMAIL", "");
    vi.stubEnv("VITE_DEMO_PASSWORD", "");
    const { demoCredentials } = await loadDemo();
    expect(demoCredentials).toBeNull();
  });

  it("needs both the email and the password", async () => {
    vi.stubEnv("VITE_DEMO_EMAIL", "demo@example.com");
    vi.stubEnv("VITE_DEMO_PASSWORD", "");
    const { demoCredentials } = await loadDemo();
    expect(demoCredentials).toBeNull();
  });

  it("recognises the demo user regardless of email case", async () => {
    vi.stubEnv("VITE_DEMO_EMAIL", "demo@example.com");
    vi.stubEnv("VITE_DEMO_PASSWORD", "Test-Only-1!");
    const { demoCredentials, isDemoUser } = await loadDemo();

    expect(demoCredentials).toEqual({
      email: "demo@example.com",
      password: "Test-Only-1!",
    });
    expect(isDemoUser({ email: "Demo@Example.com" })).toBe(true);
    expect(isDemoUser({ email: "someone@example.com" })).toBe(false);
    expect(isDemoUser(null)).toBe(false);
  });
});
