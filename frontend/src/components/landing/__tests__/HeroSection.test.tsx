import { render, screen } from "@testing-library/react";
import { HeroSection } from "../HeroSection";

describe("HeroSection", () => {
  it("renders main headline", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("heading", { level: 1 })
    ).toHaveTextContent(/capture and qualify leads/i);
  });

  it("renders get started CTA linking to /register", () => {
    render(<HeroSection />);
    const cta = screen.getByRole("link", { name: /get started free/i });
    expect(cta).toHaveAttribute("href", "/register");
  });

  it("renders trust badge", () => {
    render(<HeroSection />);
    expect(screen.getByText(/no credit card required/i)).toBeInTheDocument();
  });
});
