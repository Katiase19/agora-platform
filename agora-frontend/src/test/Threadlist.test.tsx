import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ThreadList from "../pages/ThreadList";
import { AuthProvider } from "../api/AuthContext";

vi.mock("../api/forumApi", () => ({
  getThreads: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "How does binary search work?",
      body: "I need help understanding binary search.",
      courseTag: "CS201",
      isResolved: true,
      voteScore: 10,
      viewCount: 100,
      replyCount: 3,
      authorName: "Ama Owusu",
      authorId: 101,
      createdAt: "2026-06-20T09:15:00",
    },
    {
      id: 2,
      title: "Past questions for Database Systems?",
      body: "Does anyone have past questions?",
      courseTag: "CS305",
      isResolved: false,
      voteScore: 5,
      viewCount: 89,
      replyCount: 1,
      authorName: "Kwame Asante",
      authorId: 102,
      createdAt: "2026-06-22T14:30:00",
    },
  ]),
}));

function renderThreadList() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <ThreadList />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("ThreadList", () => {
  it("shows loading state initially", () => {
    renderThreadList();
    expect(screen.getByText("Loading threads...")).toBeInTheDocument();
  });

  it("renders thread titles after loading", async () => {
    renderThreadList();
    await waitFor(() => {
      expect(
        screen.getByText("How does binary search work?")
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("Past questions for Database Systems?")
    ).toBeInTheDocument();
  });

  it("renders course tags", async () => {
    renderThreadList();
    await waitFor(() => {
      expect(screen.getByText("CS201")).toBeInTheDocument();
    });
    expect(screen.getByText("CS305")).toBeInTheDocument();
  });

  it("shows resolved badge on resolved threads", async () => {
    renderThreadList();
    await waitFor(() => {
      expect(screen.getByText("Resolved")).toBeInTheDocument();
    });
  });

  it("shows author names", async () => {
    renderThreadList();
    await waitFor(() => {
      expect(screen.getByText("by Ama Owusu")).toBeInTheDocument();
    });
  });
});