import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer";

describe("Footer", () => {
  it("renders logo", () => {
    render(<Footer />);
    expect(screen.getAllByText(/LeadForge/i).length).toBeGreaterThan(0);
  });

  it("renders contentinfo landmark", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders copyright year", () => {
    render(<Footer />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});
