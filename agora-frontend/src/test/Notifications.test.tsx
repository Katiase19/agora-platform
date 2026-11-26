import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import NotificationBell from "../components/NotificationBell";

const notifications = [
  {
    id: 1,
    type: "NEW_REPLY",
    message: 'replied to your question "How does binary search work?"',
    actorName: "Kofi Boateng",
    threadId: 5,
    isRead: false,
    createdAt: "2026-06-20T10:00:00",
  },
  {
    id: 2,
    type: "UPVOTE",
    message: 'liked your question "How does binary search work?"',
    actorName: "Efua Mensah",
    threadId: 5,
    isRead: true,
    createdAt: "2026-06-20T09:00:00",
  },
];

vi.mock("../api/notificationApi", () => ({
  getUnreadCount: vi.fn(() => Promise.resolve(1)),
  getNotifications: vi.fn(() => Promise.resolve(notifications.map((n) => ({ ...n })))),
  markNotificationRead: vi.fn(() => Promise.resolve()),
  markAllNotificationsRead: vi.fn(() => Promise.resolve()),
}));

function renderBell() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<NotificationBell />} />
        <Route path="/threads/:id" element={<p>Thread page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("NotificationBell", () => {
  it("shows the unread count as a badge", async () => {
    renderBell();
    expect(await screen.findByLabelText("Notifications (1 unread)")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("lists notifications when opened", async () => {
    const user = userEvent.setup();
    renderBell();
    await user.click(await screen.findByLabelText("Notifications (1 unread)"));

    expect(await screen.findByText("Kofi Boateng")).toBeInTheDocument();
    expect(screen.getByText("Efua Mensah")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Unread")).toHaveLength(1);
  });

  it("marks a notification read and opens its thread when clicked", async () => {
    const user = userEvent.setup();
    renderBell();
    await user.click(await screen.findByLabelText("Notifications (1 unread)"));
    await user.click(await screen.findByText("Kofi Boateng"));

    const { markNotificationRead } = await import("../api/notificationApi");
    expect(markNotificationRead).toHaveBeenCalledWith(1);
    expect(await screen.findByText("Thread page")).toBeInTheDocument();
  });

  it("marks everything as read", async () => {
    const user = userEvent.setup();
    renderBell();
    await user.click(await screen.findByLabelText("Notifications (1 unread)"));
    await user.click(await screen.findByText("Mark all as read"));

    const { markAllNotificationsRead } = await import("../api/notificationApi");
    expect(markAllNotificationsRead).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByLabelText("Unread")).not.toBeInTheDocument());
    // The badge is gone once everything is read
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });
});
