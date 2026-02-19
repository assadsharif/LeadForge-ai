import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { PricingToggle, type BillingCycle } from "../PricingToggle";

function ControlledWrapper({ initial = "monthly" as BillingCycle }) {
  const [value, setValue] = useState<BillingCycle>(initial);
  return <PricingToggle value={value} onChange={setValue} />;
}

describe("PricingToggle", () => {
  it("renders monthly and annual options", () => {
    render(<ControlledWrapper />);
    expect(screen.getByRole("radio", { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /annual/i })).toBeInTheDocument();
  });

  it("defaults to monthly", () => {
    render(<ControlledWrapper />);
    expect(screen.getByRole("radio", { name: /monthly/i })).toBeChecked();
  });

  it("switches to annual when clicked", async () => {
    render(<ControlledWrapper />);
    await userEvent.click(screen.getByRole("radio", { name: /annual/i }));
    expect(screen.getByRole("radio", { name: /annual/i })).toBeChecked();
    expect(screen.getByText(/save 20%/i)).toBeInTheDocument();
  });
});
