import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Use vi.hoisted so the class and mock fn are available inside the vi.mock factory
// (which vitest hoists to run before any module-scope code).
const { mockApiGet, ApiRequestError } = vi.hoisted(() => {
  class ApiRequestError extends Error {
    constructor(
      public readonly status: number,
      message: string,
    ) {
      super(message);
      this.name = "ApiRequestError";
    }
  }
  return { mockApiGet: vi.fn(), ApiRequestError };
});

vi.mock("@/lib/api/client", () => ({
  ApiRequestError,
  apiGet: (...args: unknown[]) => mockApiGet(...args),
  apiPost: vi.fn(),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    // Default: authenticated requests return an empty leads list
    mockApiGet.mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Existing tests ────────────────────────────────────────────────────

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
      await screen.findByRole("heading", { name: /^leads$/i }),
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

  // ── New tests ─────────────────────────────────────────────────────────

  it("shows loading state while fetching leads", async () => {
    localStorage.setItem("access_token", "test-token");
    mockApiGet.mockReturnValue(new Promise(() => {})); // never resolves
    render(<DashboardPage />);
    expect(await screen.findByText("Loading\u2026")).toBeInTheDocument();
  });

  it("renders leads returned by the API", async () => {
    localStorage.setItem("access_token", "test-token");
    mockApiGet.mockResolvedValue([
      {
        id: "abc123",
        name: "Ada Lovelace",
        email: "ada@example.com",
        created_at: "2024-01-01T00:00:00Z",
      },
    ]);
    render(<DashboardPage />);
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("shows error banner when API returns non-401 error", async () => {
    localStorage.setItem("access_token", "test-token");
    mockApiGet.mockRejectedValue(new ApiRequestError(500, "Internal server error"));
    render(<DashboardPage />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Internal server error");
  });

  it("clears token and redirects to /login on 401 from API", async () => {
    localStorage.setItem("access_token", "test-token");
    mockApiGet.mockRejectedValue(new ApiRequestError(401, "Unauthorized"));
    render(<DashboardPage />);
    await waitFor(() => {
      expect(localStorage.getItem("access_token")).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("opens Add lead modal when Add lead button is clicked", async () => {
    localStorage.setItem("access_token", "test-token");
    mockApiGet.mockResolvedValue([]);
    render(<DashboardPage />);
    const addBtn = await screen.findByRole("button", { name: /add lead/i });
    await userEvent.click(addBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
