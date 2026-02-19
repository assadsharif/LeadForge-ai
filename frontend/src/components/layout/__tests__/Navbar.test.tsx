import { render, screen } from "@testing-library/react";
import { Navbar } from "../Navbar";

describe("Navbar", () => {
  it("renders logo text", () => {
    render(<Navbar />);
    expect(screen.getByText(/LeadForge/i)).toBeInTheDocument();
  });

  it("renders get started link pointing to /register", () => {
    render(<Navbar />);
    const cta = screen.getByRole("link", { name: /get started free/i });
    expect(cta).toHaveAttribute("href", "/register");
  });

  it("renders features nav link", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /features/i })).toBeInTheDocument();
  });
});
