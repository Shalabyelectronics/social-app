import { describe, expect, it } from "vitest";
import { formatErrorMessage } from "./tools";

describe("formatErrorMessage", () => {
  it("returns a generic message when the backend sends nothing", () => {
    expect(formatErrorMessage("")).toBe("An error occurred. Please try again.");
    expect(formatErrorMessage(undefined)).toBe(
      "An error occurred. Please try again.",
    );
  });

  it("explains the password rules instead of the raw pattern error", () => {
    const raw =
      '"password" with value "abc" fails to match the required pattern: /^(?=.*[A-Z])/';
    expect(formatErrorMessage(raw)).toMatch(/at least 8 characters/);
  });

  it("turns an email pattern error into a short message", () => {
    const raw = '"email" with value "x@" fails to match the required pattern';
    expect(formatErrorMessage(raw)).toBe("Please enter a valid email address");
  });

  it("passes other messages through unchanged", () => {
    expect(formatErrorMessage("incorrect email or password")).toBe(
      "incorrect email or password",
    );
  });
});
