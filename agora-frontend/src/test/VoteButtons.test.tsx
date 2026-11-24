import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import VoteButtons from "../components/VoteButtons";

describe("VoteButtons", () => {
  it("renders the vote score", () => {
    render(<VoteButtons voteScore={7} />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders upvote and downvote buttons", () => {
    render(<VoteButtons voteScore={0} />);
    expect(screen.getByLabelText("Upvote")).toBeInTheDocument();
    expect(screen.getByLabelText("Downvote")).toBeInTheDocument();
  });

  it("calls onVote with +1 and -1", async () => {
    const user = userEvent.setup();
    const onVote = vi.fn();
    render(<VoteButtons voteScore={3} onVote={onVote} />);

    await user.click(screen.getByLabelText("Upvote"));
    await user.click(screen.getByLabelText("Downvote"));

    expect(onVote).toHaveBeenNthCalledWith(1, 1);
    expect(onVote).toHaveBeenNthCalledWith(2, -1);
  });

  it("is disabled without an onVote handler (e.g. logged out)", () => {
    render(<VoteButtons voteScore={3} disabledReason="Log in to vote" />);
    expect(screen.getByLabelText("Upvote")).toBeDisabled();
    expect(screen.getByLabelText("Upvote")).toHaveAttribute("title", "Log in to vote");
  });

  it("marks the user's current vote as pressed", () => {
    render(<VoteButtons voteScore={3} userVote={1} onVote={() => {}} />);
    expect(screen.getByLabelText("Upvote")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Downvote")).toHaveAttribute("aria-pressed", "false");
  });
});
