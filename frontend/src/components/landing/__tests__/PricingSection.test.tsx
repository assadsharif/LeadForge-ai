import { render, screen } from "@testing-library/react";
import { PricingSection } from "../PricingSection";

describe("PricingSection", () => {
  it("renders section heading", () => {
    render(<PricingSection />);
    expect(
      screen.getByRole("heading", { name: /simple, transparent pricing/i })
    ).toBeInTheDocument();
  });

  it("renders all 3 tier names", () => {
    render(<PricingSection />);
    expect(screen.getByText(/^Free$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Pro$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Enterprise$/i)).toBeInTheDocument();
  });

  it("renders CTA for each tier", () => {
    render(<PricingSection />);
    expect(
      screen.getByRole("link", { name: /get started/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /start free trial/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /contact sales/i })
    ).toBeInTheDocument();
  });

  it("has pricing anchor id", () => {
    const { container } = render(<PricingSection />);
    expect(container.querySelector("#pricing")).not.toBeNull();
  });
});
