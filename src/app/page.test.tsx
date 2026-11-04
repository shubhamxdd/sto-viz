import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("Home Page Component", () => {
  // covers: AC-1 (renders FolioCity landing screen with dark cyberpunk styling and stack summary)
  it("renders the primary FolioCity title and tagline", () => {
    render(<HomePage />);

    const heading = screen.getByRole("heading", {
      level: 1,
      name: /foliocity/i,
    });
    expect(heading).toBeDefined();

    expect(screen.getByText(/foundation scaffolding complete/i)).toBeDefined();
    expect(
      screen.getByText(/indian stock portfolio visualizer/i),
    ).toBeDefined();
  });

  it("displays the foundational architecture stack cards", () => {
    render(<HomePage />);

    expect(screen.getByText("Framework")).toBeDefined();
    expect(screen.getByText("3D Graphics")).toBeDefined();
    expect(screen.getByText("Database & ORM")).toBeDefined();
    expect(screen.getByText("Authentication")).toBeDefined();

    expect(
      screen.getAllByText(/next\.js app router/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/react three fiber/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Postgres + Drizzle")).toBeDefined();
    expect(screen.getAllByText(/better auth/i).length).toBeGreaterThanOrEqual(
      1,
    );
  });
});
