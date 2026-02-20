import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RegisterPage from "../page";

vi.mock("@/components/auth/RegisterForm", () => ({
  RegisterForm: () => <div data-testid="register-form" />,
}));

describe("RegisterPage", () => {
  it("renders page heading", () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole("heading", { name: /create your account/i })
    ).toBeInTheDocument();
  });

  it("renders login link", () => {
    render(<RegisterPage />);
    const link = screen.getByRole("link", { name: /log in/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
