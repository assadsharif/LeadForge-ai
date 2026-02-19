import { render, screen } from "@testing-library/react";
import { FeaturesSection } from "../FeaturesSection";

describe("FeaturesSection", () => {
  it("renders section heading", () => {
    render(<FeaturesSection />);
    expect(
      screen.getByRole("heading", { name: /everything you need/i })
    ).toBeInTheDocument();
  });

  it("renders all 3 feature cards", () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/AI Enrichment/i)).toBeInTheDocument();
    expect(screen.getByText(/Smart Capture/i)).toBeInTheDocument();
    expect(screen.getByText(/Pipeline Ready/i)).toBeInTheDocument();
  });

  it("has features anchor id", () => {
    const { container } = render(<FeaturesSection />);
    expect(container.querySelector("#features")).not.toBeNull();
  });
});
