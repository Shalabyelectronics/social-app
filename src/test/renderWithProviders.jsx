import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { vi } from "vitest";
import { AuthContext } from "../components/AuthContext/AuthContextProvider";

/**
 * Renders `ui` at `route` inside a router and a fake AuthContext.
 * `routes` adds marker pages (e.g. { "/profile": "Profile page" }) so tests can assert navigation.
 */
export function renderWithProviders(
  ui,
  { route = "/", path = route, auth = {}, routes = {} } = {},
) {
  const authValue = {
    token: null,
    setToken: vi.fn(),
    user: null,
    setUser: vi.fn(),
    userPhoto: null,
    setUserPhoto: vi.fn(),
    refreshUserProfile: vi.fn(),
    ...auth,
  };

  const result = render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
          {Object.entries(routes).map(([to, text]) => (
            <Route key={to} path={to} element={<p>{text}</p>} />
          ))}
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

  return { ...result, auth: authValue };
}
