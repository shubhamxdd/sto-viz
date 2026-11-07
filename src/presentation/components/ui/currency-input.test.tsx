import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CurrencyInput } from "./currency-input";

describe("CurrencyInput Component", () => {
  // covers: AC-3 (currency input with rupee formatting and paise parsing)
  it("renders with currency prefix badge and formatted initial value", () => {
    const handleChange = vi.fn();
    render(
      <CurrencyInput
        label="Buy Price"
        valuePaise={245050n}
        onChangePaise={handleChange}
      />,
    );

    expect(screen.getByText("₹")).toBeDefined();
    const input = screen.getByLabelText("Buy Price") as HTMLInputElement;
    expect(input.value).toBe("2450.50");
  });

  it("parses valid decimal input to integer paise and invokes callback", () => {
    const handleChange = vi.fn();
    render(
      <CurrencyInput
        label="Buy Price"
        valuePaise={0n}
        onChangePaise={handleChange}
      />,
    );

    const input = screen.getByLabelText("Buy Price");
    fireEvent.change(input, { target: { value: "1250.75" } });

    expect(handleChange).toHaveBeenCalledWith(125075n);
  });

  it("handles clearing input gracefully without throwing errors", () => {
    const handleChange = vi.fn();
    render(
      <CurrencyInput
        label="Buy Price"
        valuePaise={10000n}
        onChangePaise={handleChange}
      />,
    );

    const input = screen.getByLabelText("Buy Price");
    fireEvent.change(input, { target: { value: "" } });

    expect(handleChange).toHaveBeenCalledWith(0n);
  });

  it("blocks non-numeric input characters", () => {
    const handleChange = vi.fn();
    render(
      <CurrencyInput
        label="Buy Price"
        valuePaise={10000n}
        onChangePaise={handleChange}
      />,
    );

    const input = screen.getByLabelText("Buy Price") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc" } });

    // Value should not update to invalid string
    expect(input.value).toBe("100.00");
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("displays external error message when provided", () => {
    const handleChange = vi.fn();
    render(
      <CurrencyInput
        label="Buy Price"
        valuePaise={0n}
        onChangePaise={handleChange}
        error="Price must exceed zero"
      />,
    );

    expect(screen.getByText("Price must exceed zero")).toBeDefined();
  });

  it("applies disabled state to input field", () => {
    const handleChange = vi.fn();
    render(
      <CurrencyInput
        label="Buy Price"
        valuePaise={10000n}
        onChangePaise={handleChange}
        disabled={true}
      />,
    );

    const input = screen.getByLabelText("Buy Price") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
