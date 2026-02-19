import { render, screen } from "@testing-library/react";
import { StatsSection } from "../StatsSection";

describe("StatsSection", () => {
  it("renders all 3 stats", () => {
    render(<StatsSection />);
    expect(screen.getByText(/10,000\+/)).toBeInTheDocument();
    expect(screen.getByText(/3×/)).toBeInTheDocument();
    expect(screen.getByText(/94%/)).toBeInTheDocument();
  });
});
