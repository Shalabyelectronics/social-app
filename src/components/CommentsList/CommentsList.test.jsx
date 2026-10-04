import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
// CommentsList imports from react-router-dom, so the test router must come from there too
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../AuthContext/AuthContextProvider";
import CommentsList from "./CommentsList";

const auth = { token: "token-123", user: { _id: "u1" }, setToken: vi.fn() };

function Providers({ children }) {
  return (
    <AuthContext.Provider value={auth}>
      <MemoryRouter>{children}</MemoryRouter>
    </AuthContext.Provider>
  );
}

const firstComment = {
  _id: "c1",
  content: "First!",
  createdAt: "2026-03-01T10:00:00.000Z",
  commentCreator: { _id: "u2", name: "Omar", photo: "" },
  likes: ["u1"],
  likesCount: 1,
  repliesCount: 0,
};

describe("CommentsList", () => {
  it("shows an empty state when there are no comments", () => {
    render(<CommentsList comments={[]} postID="p1" />, { wrapper: Providers });
    expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
  });

  // Regression: the effect used to run after the early return, so adding the
  // first comment changed the hook count and React crashed the list.
  it("renders the first comment after starting empty", () => {
    const { rerender } = render(<CommentsList comments={[]} postID="p1" />, {
      wrapper: Providers,
    });

    rerender(<CommentsList comments={[firstComment]} postID="p1" />);

    expect(screen.getByText("First!")).toBeInTheDocument();
    expect(screen.getByText("Omar")).toBeInTheDocument();
  });
});
