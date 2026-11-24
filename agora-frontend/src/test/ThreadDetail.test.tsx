import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import ThreadDetail from "../pages/ThreadDetail";
import { AuthProvider } from "../api/AuthContext";

const thread = {
  id: 1,
  title: "How does binary search work?",
  body: "Use `mid = low + (high - low) / 2`",
  courseTag: "CS201",
  isResolved: false,
  voteScore: 2,
  viewCount: 10,
  replyCount: 1,
  authorName: "Ama Owusu",
  authorId: 101,
  createdAt: "2026-06-20T09:15:00",
  userVote: 0,
};

const reply = {
  id: 7,
  body: "Halve the search range each step.",
  isAccepted: false,
  voteScore: 1,
  threadId: 1,
  authorName: "Kofi Boateng",
  authorId: 104,
  createdAt: "2026-06-20T10:00:00",
  userVote: 0,
};

vi.mock("../api/forumApi", () => ({
  getThreadById: vi.fn(() => Promise.resolve({ ...thread })),
  getRepliesForThread: vi.fn(() => Promise.resolve([{ ...reply }])),
  castVote: vi.fn(() => Promise.resolve({ targetType: "THREAD", targetId: 1, voteScore: 3, userVote: 1 })),
  acceptReply: vi.fn(() => Promise.resolve({ ...reply, isAccepted: true })),
  deleteThread: vi.fn(),
  deleteReply: vi.fn(),
  updateReply: vi.fn(),
  createReply: vi.fn(),
}));

const currentUser = vi.hoisted(() => ({ id: 101 }));

vi.mock("../api/authApi", () => ({
  getCurrentUser: vi.fn(() =>
    Promise.resolve({
      id: currentUser.id,
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      role: "STUDENT",
      reputationScore: 0,
      courseOfStudy: null,
      academicYear: null,
      createdAt: "2026-01-01T00:00:00",
    })
  ),
}));

function renderDetail() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/threads/1"]}>
        <Routes>
          <Route path="/threads/:id" element={<ThreadDetail />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("ThreadDetail", () => {
  it("renders the thread and its replies", async () => {
    renderDetail();
    expect(await screen.findByText("How does binary search work?")).toBeInTheDocument();
    expect(screen.getByText("Halve the search range each step.")).toBeInTheDocument();
    // inline code is rendered as <code>
    expect(screen.getByText("mid = low + (high - low) / 2").tagName).toBe("CODE");
  });

  it("asks logged-out users to log in instead of showing the reply box", async () => {
    renderDetail();
    await screen.findByText("How does binary search work?");
    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.queryByText("Post Reply")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Upvote")[0]).toBeDisabled();
  });

  it("lets the thread author accept an answer, edit and delete", async () => {
    currentUser.id = 101; // thread author
    localStorage.setItem("token", "fake-token");
    const user = userEvent.setup();
    renderDetail();

    const acceptButton = await screen.findByLabelText("Accept this answer");
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();

    await user.click(acceptButton);
    const { acceptReply } = await import("../api/forumApi");
    expect(acceptReply).toHaveBeenCalledWith(1, 7);
  });

  it("lets other users vote on the thread but not accept answers", async () => {
    currentUser.id = 999;
    localStorage.setItem("token", "fake-token");
    const user = userEvent.setup();
    renderDetail();

    await screen.findByText("How does binary search work?");
    await waitFor(() => expect(screen.getAllByLabelText("Upvote")[0]).not.toBeDisabled());
    expect(screen.queryByLabelText("Accept this answer")).not.toBeInTheDocument();

    await user.click(screen.getAllByLabelText("Upvote")[0]);
    const { castVote } = await import("../api/forumApi");
    expect(castVote).toHaveBeenCalledWith("THREAD", 1, 1);
    expect(await screen.findByLabelText("Score 3")).toBeInTheDocument();
  });
});
