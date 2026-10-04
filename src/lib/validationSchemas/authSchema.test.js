import { describe, expect, it } from "vitest";
import { changePasswordSchema, loginSchema } from "./authSchema";

const firstError = (result) => result.error?.issues[0]?.message;

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Secret#123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "user@", password: "Secret#123" });
    expect(firstError(result)).toBe("Invalid Email");
  });

  it("accepts passwords longer than 10 characters (regression: users were locked out)", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "A-much-longer-Passw0rd!",
    });
    expect(result.success).toBe(true);
  });
});

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "Old@Pass1",
    password: "New@Pass12",
    rePassword: "New@Pass12",
  };

  it("accepts a strong new password that matches its confirmation", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a weak new password", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      password: "weakpass",
      rePassword: "weakpass",
    });
    expect(firstError(result)).toMatch(/at least 8 characters/);
  });

  it("rejects a confirmation that doesn't match", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      rePassword: "Different@1",
    });
    expect(firstError(result)).toBe("Passwords do not match.");
  });
});
