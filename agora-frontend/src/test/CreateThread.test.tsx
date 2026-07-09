import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import CreateThread from "../pages/CreateThread";
import { AuthProvider } from "../api/AuthContext";

vi.mock("../api/forumApi", () => ({
  createThread: vi.fn().mockResolvedValue({
    id: 1,
    title: "Test Thread",
    body: "Test body",
    courseTag: "CS101",
    isResolved: false,
    voteScore: 0,
    viewCount: 0,
    replyCount: 0,
    authorName: "Test User",
    authorId: 1,
    createdAt: "2026-06-29T10:00:00",
  }),
}));

function renderCreateThread() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <CreateThread />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("CreateThread", () => {
  it("renders the form fields", () => {
    renderCreateThread();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Course Tag")).toBeInTheDocument();
    expect(screen.getByLabelText("Details")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    renderCreateThread();
    expect(screen.getByText("Post Question")).toBeInTheDocument();
  });

  it("updates title field when user types", async () => {
    const user = userEvent.setup();
    renderCreateThread();
    const titleInput = screen.getByLabelText("Title");
    await user.type(titleInput, "How does recursion work?");
    expect(titleInput).toHaveValue("How does recursion work?");
  });

  it("does not submit when title is empty", async () => {
    const user = userEvent.setup();
    const { createThread } = await import("../api/forumApi");
    renderCreateThread();
    await user.type(screen.getByLabelText("Details"), "Some body text");
    await user.click(screen.getByText("Post Question"));
    expect(createThread).not.toHaveBeenCalled();
  });

  it("does not submit when body is empty", async () => {
    const user = userEvent.setup();
    const { createThread } = await import("../api/forumApi");
    renderCreateThread();
    await user.type(screen.getByLabelText("Title"), "Some title");
    await user.click(screen.getByText("Post Question"));
    expect(createThread).not.toHaveBeenCalled();
  });
});