import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddLeadModal } from "../AddLeadModal";

const { mockApiPost, ApiRequestError } = vi.hoisted(() => {
  class ApiRequestError extends Error {
    constructor(
      public readonly status: number,
      public readonly detail: string,
    ) {
      super(detail);
      this.name = "ApiRequestError";
    }
  }
  return { mockApiPost: vi.fn(), ApiRequestError };
});

vi.mock("@/lib/api/client", () => ({
  ApiRequestError,
  apiPost: (...args: unknown[]) => mockApiPost(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("AddLeadModal", () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const token = "test-token";

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders heading, name input, email input, and action buttons", () => {
    render(<AddLeadModal token={token} onClose={onClose} onSuccess={onSuccess} />);
    expect(screen.getByRole("heading", { name: /add lead/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add lead/i })).toBeInTheDocument();
  });

  it("calls apiPost with correct payload and token, then calls onSuccess", async () => {
    mockApiPost.mockResolvedValue({});
    render(<AddLeadModal token={token} onClose={onClose} onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/name/i), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: /add lead/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        "/api/v1/leads",
        { name: "Ada Lovelace", email: "ada@example.com" },
        token,
      );
      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });

  it("shows error alert on 409 duplicate email", async () => {
    mockApiPost.mockRejectedValue(
      new ApiRequestError(409, "A lead with this email already exists"),
    );
    render(<AddLeadModal token={token} onClose={onClose} onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/name/i), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: /add lead/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A lead with this email already exists",
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("calls onClose when Cancel is clicked", async () => {
    render(<AddLeadModal token={token} onClose={onClose} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("disables submit button while submitting", async () => {
    mockApiPost.mockReturnValue(new Promise(() => {})); // never resolves
    render(<AddLeadModal token={token} onClose={onClose} onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/name/i), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: /add lead/i }));

    expect(await screen.findByRole("button", { name: /add lead/i })).toBeDisabled();
  });
});
