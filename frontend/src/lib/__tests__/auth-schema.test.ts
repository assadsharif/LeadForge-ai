import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema } from "../schemas/auth";

describe("registerSchema", () => {
  it("accepts valid data", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "s3cur3pass",
      confirmPassword: "s3cur3pass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      fullName: "A",
      email: "ada@example.com",
      password: "s3cur3pass",
      confirmPassword: "s3cur3pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada",
      email: "not-email",
      password: "s3cur3pass",
      confirmPassword: "s3cur3pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada",
      email: "ada@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada",
      email: "ada@example.com",
      password: "s3cur3pass",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid data", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "s3cur3pass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-email",
      password: "s3cur3pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});
