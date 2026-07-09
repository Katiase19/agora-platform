import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("upvote button is clickable", async () => {
    const user = userEvent.setup();
    render(<VoteButtons voteScore={3} />);
    const upvoteButton = screen.getByLabelText("Upvote");
    await user.click(upvoteButton);
    
  });
});