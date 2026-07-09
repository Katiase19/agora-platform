import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ReplyBox from "../components/ReplyBox";

vi.mock("../api/forumApi", () => ({
  createReply: vi.fn().mockResolvedValue({}),
}));

describe("ReplyBox", () => {
  it("renders the textarea and submit button", () => {
    render(<ReplyBox threadId={1} onReplyAdded={() => {}} />);
    expect(screen.getByPlaceholderText("Share your answer or thoughts...")).toBeInTheDocument();
    expect(screen.getByText("Post Reply")).toBeInTheDocument();
  });

  it("updates textarea value when user types", async () => {
    const user = userEvent.setup();
    render(<ReplyBox threadId={1} onReplyAdded={() => {}} />);

    const textarea = screen.getByPlaceholderText("Share your answer or thoughts...");
    await user.type(textarea, "This is my reply");

    expect(textarea).toHaveValue("This is my reply");
  });

  it("clears textarea after successful submission", async () => {
    const user = userEvent.setup();
    render(<ReplyBox threadId={1} onReplyAdded={() => {}} />);

    const textarea = screen.getByPlaceholderText("Share your answer or thoughts...");
    await user.type(textarea, "This is my reply");
    await user.click(screen.getByText("Post Reply"));

    expect(textarea).toHaveValue("");
  });

  it("does not submit when textarea is empty", async () => {
    const user = userEvent.setup();
    const onReplyAdded = vi.fn();
    render(<ReplyBox threadId={1} onReplyAdded={onReplyAdded} />);

    await user.click(screen.getByText("Post Reply"));

    expect(onReplyAdded).not.toHaveBeenCalled();
  });
});