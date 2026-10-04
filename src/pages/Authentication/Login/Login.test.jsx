import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../../services/authServices", () => ({ loginService: vi.fn() }));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const DEMO = { email: "demo@example.com", password: "Test-Only-1!" };

// Login reads the demo env vars when it loads, so each test re-imports it after stubbing the env
async function setup({ demo = false } = {}) {
  vi.resetModules();
  vi.stubEnv("VITE_DEMO_EMAIL", demo ? DEMO.email : "");
  vi.stubEnv("VITE_DEMO_PASSWORD", demo ? DEMO.password : "");

  // Import one at a time: parallel imports right after resetModules can build a mock twice
  const { loginService } = await import("../../../services/authServices");
  const { toast } = await import("react-toastify");
  const { renderWithProviders } = await import("../../../test/renderWithProviders");
  const { default: Login } = await import("./Login");

  const view = renderWithProviders(<Login />, {
    route: "/login",
    routes: { "/profile": "Profile page" },
  });
  return { ...view, user: userEvent.setup(), loginService, toast };
}

describe("Login page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation messages and doesn't call the API for an empty form", async () => {
    const { user, loginService } = await setup();

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(loginService).not.toHaveBeenCalled();
  });

  it("logs in, stores the token and opens the profile", async () => {
    const { user, loginService, toast, auth } = await setup();
    loginService.mockResolvedValue({
      data: { message: "success", data: { token: "token-123" } },
    });

    await user.type(screen.getByLabelText("Email", { selector: "input" }), "mona@example.com");
    await user.type(screen.getByLabelText("Password", { selector: "input" }), "Secret#123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Profile page")).toBeInTheDocument();
    expect(loginService).toHaveBeenCalledWith({
      email: "mona@example.com",
      password: "Secret#123",
    });
    expect(auth.setToken).toHaveBeenCalledWith("token-123");
    expect(toast.success).toHaveBeenCalledWith("success");
  });

  it("shows the server's error and stays on the page when login fails", async () => {
    const { user, loginService, toast, auth } = await setup();
    loginService.mockRejectedValue({
      response: { data: { message: "incorrect email or password" } },
    });

    await user.type(screen.getByLabelText("Email", { selector: "input" }), "mona@example.com");
    await user.type(screen.getByLabelText("Password", { selector: "input" }), "Wrong#123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("incorrect email or password"),
    );
    expect(auth.setToken).not.toHaveBeenCalled();
    expect(screen.queryByText("Profile page")).not.toBeInTheDocument();
  });

  it("hides the demo button when no demo account is configured", async () => {
    await setup({ demo: false });
    expect(
      screen.queryByRole("button", { name: "Try the demo" }),
    ).not.toBeInTheDocument();
  });

  it("logs in with the demo account in one click", async () => {
    const { user, loginService, auth } = await setup({ demo: true });
    loginService.mockResolvedValue({
      data: { message: "success", data: { token: "demo-token" } },
    });

    await user.click(screen.getByRole("button", { name: "Try the demo" }));

    expect(await screen.findByText("Profile page")).toBeInTheDocument();
    expect(loginService).toHaveBeenCalledWith(DEMO);
    expect(auth.setToken).toHaveBeenCalledWith("demo-token");
  });
});
