import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingToggle } from "../PricingToggle";

describe("PricingToggle", () => {
  it("renders monthly and annual options", () => {
    render(<PricingToggle />);
    expect(screen.getByRole("radio", { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /annual/i })).toBeInTheDocument();
  });

  it("defaults to monthly", () => {
    render(<PricingToggle />);
    expect(screen.getByRole("radio", { name: /monthly/i })).toBeChecked();
  });

  it("switches to annual when clicked", async () => {
    render(<PricingToggle />);
    await userEvent.click(screen.getByRole("radio", { name: /annual/i }));
    expect(screen.getByRole("radio", { name: /annual/i })).toBeChecked();
    expect(screen.getByText(/save 20%/i)).toBeInTheDocument();
  });
});
