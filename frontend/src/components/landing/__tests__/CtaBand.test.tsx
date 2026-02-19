import { render, screen } from "@testing-library/react";
import { CtaBand } from "../CtaBand";

describe("CtaBand", () => {
  it("renders CTA headline", () => {
    render(<CtaBand />);
    expect(
      screen.getByRole("heading", { name: /start capturing smarter leads/i })
    ).toBeInTheDocument();
  });

  it("renders CTA link to /register", () => {
    render(<CtaBand />);
    const cta = screen.getByRole("link", { name: /get started free/i });
    expect(cta).toHaveAttribute("href", "/register");
  });
});
