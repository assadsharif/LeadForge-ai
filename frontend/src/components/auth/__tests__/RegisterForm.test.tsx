import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "../RegisterForm";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it("renders all form fields and submit button", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("shows inline errors when submitted empty", async () => {
    render(<RegisterForm />);
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "s3cur3pass");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "different");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("submits to API and redirects on success", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "test-jwt",
          token_type: "bearer",
          user: { id: "uuid-1", email: "ada@example.com", full_name: "Ada Lovelace", created_at: new Date().toISOString() },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "s3cur3pass");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "s3cur3pass");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error banner on 409 conflict", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ detail: "Email already registered" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "s3cur3pass");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "s3cur3pass");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/already registered/i),
    ).toBeInTheDocument();
  });

  it("shows generic error banner on network failure", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network Error"));

    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "s3cur3pass");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "s3cur3pass");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/something went wrong/i),
    ).toBeInTheDocument();
  });
});
