import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("redirects to /login when no token", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("renders Leads heading when authenticated", async () => {
    localStorage.setItem("access_token", "test-token");
    render(<DashboardPage />);
    expect(
      await screen.findByRole("heading", { name: /^leads$/i })
    ).toBeInTheDocument();
  });

  it("renders Name, Email, Added column headers", async () => {
    localStorage.setItem("access_token", "test-token");
    render(<DashboardPage />);
    await screen.findByRole("heading", { name: /^leads$/i });
    expect(screen.getByText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByText(/^added$/i)).toBeInTheDocument();
  });

  it("clears token and redirects on sign out", async () => {
    localStorage.setItem("access_token", "test-token");
    render(<DashboardPage />);
    const signOutBtn = await screen.findByRole("button", { name: /sign out/i });
    await userEvent.click(signOutBtn);
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
