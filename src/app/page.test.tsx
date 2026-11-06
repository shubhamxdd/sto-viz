import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage Component", () => {
  it("renders the primary FolioCity brand and metropolis status badge", () => {
    render(<HomePage />);

    expect(screen.getByText("FOLIOCITY")).toBeDefined();
    expect(screen.getByText("METROPOLIS")).toBeDefined();
  });

  it("renders camera toolbar with reset and orbit toggle buttons", () => {
    render(<HomePage />);

    const resetButton = screen.getByRole("button", {
      name: /reset camera view/i,
    });
    expect(resetButton).toBeDefined();

    const orbitButton = screen.getByRole("button", {
      name: /toggle auto orbit/i,
    });
    expect(orbitButton).toBeDefined();
  });

  it("renders quality switcher with High, Balanced, and Low options", () => {
    render(<HomePage />);

    expect(screen.getByRole("button", { name: /high/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /balanced/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /low/i })).toBeDefined();
  });

  it("displays the active holdings panel with Add Stock button", () => {
    render(<HomePage />);

    expect(screen.getByText(/active holdings/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /add stock/i })).toBeDefined();
    expect(
      screen.getByText(/drag to orbit · scroll to zoom · bounded camera/i),
    ).toBeDefined();
  });
});
