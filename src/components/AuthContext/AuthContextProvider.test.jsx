import { useContext } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthContextProvider, { AuthContext } from "./AuthContextProvider";
import { getUserProfileService } from "../../services/authServices";

vi.mock("../../services/authServices", () => ({ getUserProfileService: vi.fn() }));

const profile = (name) => ({ data: { data: { user: { name, photo: `${name}.png` } } } });

function deferred() {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
}

function Probe() {
  const { user, setToken } = useContext(AuthContext);
  return (
    <div>
      <p>{user ? `User: ${user.name}` : "No user"}</p>
      <button onClick={() => setToken(null)}>Log out</button>
      <button onClick={() => setToken("token-b")}>Switch account</button>
    </div>
  );
}

const renderProvider = () =>
  render(
    <AuthContextProvider>
      <Probe />
    </AuthContextProvider>,
  );

describe("AuthContextProvider", () => {
  it("loads the profile for a saved session and clears it on logout", async () => {
    localStorage.setItem("userToken", "token-a");
    getUserProfileService.mockResolvedValue(profile("Mona"));
    const user = userEvent.setup();
    renderProvider();

    expect(await screen.findByText("User: Mona")).toBeInTheDocument();
    expect(getUserProfileService).toHaveBeenCalledWith("token-a");

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(screen.getByText("No user")).toBeInTheDocument();
    expect(localStorage.getItem("userToken")).toBeNull();
  });

  it("ignores a late profile response for a token that was replaced", async () => {
    localStorage.setItem("userToken", "token-a");
    const responseA = deferred();
    const responseB = deferred();
    getUserProfileService.mockImplementation((token) =>
      token === "token-a" ? responseA.promise : responseB.promise,
    );
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole("button", { name: "Switch account" }));
    await act(async () => responseB.resolve(profile("Bilal")));
    await act(async () => responseA.resolve(profile("Amal")));

    expect(screen.getByText("User: Bilal")).toBeInTheDocument();
    expect(localStorage.getItem("userToken")).toBe("token-b");
  });
});
