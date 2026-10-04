import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../services/authServices", () => ({ changePasswordService: vi.fn() }));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// isDemoUser reads the env when it loads, so re-import after stubbing
async function setup(currentUser) {
  vi.resetModules();
  vi.stubEnv("VITE_DEMO_EMAIL", "demo@example.com");
  vi.stubEnv("VITE_DEMO_PASSWORD", "Test-Only-1!");

  // Import one at a time: parallel imports right after resetModules can build a mock twice
  const { changePasswordService } = await import("../../services/authServices");
  const { renderWithProviders } = await import("../../test/renderWithProviders");
  const { default: ChangePassword } = await import("./ChangePassword");

  const view = renderWithProviders(<ChangePassword />, {
    auth: { token: "token-123", user: currentUser },
  });
  return { ...view, user: userEvent.setup(), changePasswordService };
}

describe("Change Password", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is turned off for the shared demo account", async () => {
    await setup({ email: "demo@example.com" });

    expect(
      screen.getByText(/password changes are\s+turned off/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Password" })).toBeDisabled();
  });

  it("changes the password and stores the new token for a regular user", async () => {
    const { user, changePasswordService, auth } = await setup({
      email: "mona@example.com",
    });
    changePasswordService.mockResolvedValue({ data: { data: { token: "new-token" } } });

    expect(screen.queryByText(/turned off/i)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Current Password", { selector: "input" }), "Old@Pass1");
    await user.type(screen.getByLabelText("New Password", { selector: "input" }), "New@Pass12");
    await user.type(screen.getByLabelText("Confirm New Password", { selector: "input" }), "New@Pass12");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => expect(auth.setToken).toHaveBeenCalledWith("new-token"));
    expect(changePasswordService).toHaveBeenCalledWith("token-123", {
      password: "Old@Pass1",
      newPassword: "New@Pass12",
    });
  });
});
