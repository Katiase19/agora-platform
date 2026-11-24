import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
      replyCount: 0,
      authorName: "Kwame Asante",
      authorId: 102,
      createdAt: "2026-06-22T14:30:00",
    },
  ]),
}));

vi.mock("../api/resourceApi", () => ({
  getTrendingResources: vi.fn().mockResolvedValue([]),
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

async function waitForThreads() {
  await waitFor(() => {
    expect(screen.getByText("How does binary search work?")).toBeInTheDocument();
  });
}

describe("ThreadList", () => {
  it("shows loading state initially", () => {
    renderThreadList();
    expect(screen.getByText("Loading threads...")).toBeInTheDocument();
  });

  it("renders thread titles after loading", async () => {
    renderThreadList();
    await waitForThreads();
    expect(screen.getByText("Past questions for Database Systems?")).toBeInTheDocument();
  });

  it("renders course tags on the threads", async () => {
    renderThreadList();
    await waitForThreads();
    const list = screen.getByRole("list");
    expect(within(list).getByText("CS201")).toBeInTheDocument();
    expect(within(list).getByText("CS305")).toBeInTheDocument();
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

  it("filters threads by search text", async () => {
    const user = userEvent.setup();
    renderThreadList();
    await waitForThreads();

    await user.type(screen.getByLabelText("Search threads"), "database");

    expect(screen.queryByText("How does binary search work?")).not.toBeInTheDocument();
    expect(screen.getByText("Past questions for Database Systems?")).toBeInTheDocument();
  });

  it("filters threads by course", async () => {
    const user = userEvent.setup();
    renderThreadList();
    await waitForThreads();

    await user.click(screen.getByLabelText("Filter by course CS305"));

    expect(screen.queryByText("How does binary search work?")).not.toBeInTheDocument();
    expect(screen.getByText("Past questions for Database Systems?")).toBeInTheDocument();
  });

  it("shows only unanswered threads with the Unanswered filter", async () => {
    const user = userEvent.setup();
    renderThreadList();
    await waitForThreads();

    await user.click(screen.getByRole("button", { name: "Unanswered" }));

    expect(screen.queryByText("How does binary search work?")).not.toBeInTheDocument();
    expect(screen.getByText("Past questions for Database Systems?")).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderThreadList();
    await waitForThreads();

    await user.type(screen.getByLabelText("Search threads"), "quantum physics");

    expect(screen.getByText("No questions match your search")).toBeInTheDocument();
  });
});
