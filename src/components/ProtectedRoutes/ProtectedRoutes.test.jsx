import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import AppProtectedRoutes from "./AppProtectedRoutes";
import AuthProtextedRoutes from "./AuthProtextedRoutes";

describe("AppProtectedRoutes", () => {
  it("sends visitors without a token to /login", () => {
    renderWithProviders(
      <AppProtectedRoutes>
        <p>News feed</p>
      </AppProtectedRoutes>,
      { route: "/", routes: { "/login": "Login page" } },
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("News feed")).not.toBeInTheDocument();
  });

  it("shows the page to logged-in users", () => {
    renderWithProviders(
      <AppProtectedRoutes>
        <p>News feed</p>
      </AppProtectedRoutes>,
      { route: "/", auth: { token: "token-123" }, routes: { "/login": "Login page" } },
    );

    expect(screen.getByText("News feed")).toBeInTheDocument();
  });
});

describe("AuthProtextedRoutes", () => {
  it("sends logged-in users from /login to the feed", () => {
    renderWithProviders(
      <AuthProtextedRoutes>
        <p>Login form</p>
      </AuthProtextedRoutes>,
      { route: "/login", auth: { token: "token-123" }, routes: { "/": "Feed page" } },
    );

    expect(screen.getByText("Feed page")).toBeInTheDocument();
    expect(screen.queryByText("Login form")).not.toBeInTheDocument();
  });

  it("shows the login form to visitors", () => {
    renderWithProviders(
      <AuthProtextedRoutes>
        <p>Login form</p>
      </AuthProtextedRoutes>,
      { route: "/login", routes: { "/": "Feed page" } },
    );

    expect(screen.getByText("Login form")).toBeInTheDocument();
  });
});
