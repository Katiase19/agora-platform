import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import BookmarkButton from "../components/BookmarkButton";
import Saved from "../pages/Saved";

vi.mock("../api/bookmarkApi", () => ({
  addBookmark: vi.fn(() => Promise.resolve()),
  removeBookmark: vi.fn(() => Promise.resolve()),
  getBookmarks: vi.fn(() =>
    Promise.resolve([
      {
        id: 3,
        title: "Past questions for Database Systems?",
        body: "Anyone?",
        courseTag: "CS305",
        isResolved: false,
        voteScore: 2,
        viewCount: 4,
        replyCount: 1,
        authorName: "Kwame Asante",
        authorId: 102,
        createdAt: "2026-06-22T14:30:00",
        bookmarked: true,
      },
    ])
  ),
}));

function Harness({ initial }: { initial: boolean }) {
  const [saved, setSaved] = useState(initial);
  return <BookmarkButton threadId={3} bookmarked={saved} onChange={setSaved} />;
}

describe("BookmarkButton", () => {
  it("saves and unsaves a thread", async () => {
    const user = userEvent.setup();
    render(<Harness initial={false} />);
    const { addBookmark, removeBookmark } = await import("../api/bookmarkApi");

    await user.click(screen.getByLabelText("Bookmark this question"));
    expect(addBookmark).toHaveBeenCalledWith(3);
    expect(await screen.findByText("Saved")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Remove bookmark"));
    expect(removeBookmark).toHaveBeenCalledWith(3);
    expect(await screen.findByText("Save")).toBeInTheDocument();
  });
});

describe("Saved page", () => {
  it("lists bookmarked threads and removes them", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Saved />
      </MemoryRouter>
    );

    expect(await screen.findByText("Past questions for Database Systems?")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Remove Past questions for Database Systems? from saved"));

    expect(screen.queryByText("Past questions for Database Systems?")).not.toBeInTheDocument();
    expect(screen.getByText("You haven't saved any questions yet.")).toBeInTheDocument();
  });
});
