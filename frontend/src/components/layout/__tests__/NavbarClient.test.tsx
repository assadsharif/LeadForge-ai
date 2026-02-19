import { render, screen } from "@testing-library/react";
import { NavbarClient } from "../NavbarClient";

describe("NavbarClient", () => {
  it("renders children", () => {
    render(<NavbarClient><div>nav content</div></NavbarClient>);
    expect(screen.getByText("nav content")).toBeInTheDocument();
  });

  it("has role navigation", () => {
    render(<NavbarClient><span>nav</span></NavbarClient>);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
