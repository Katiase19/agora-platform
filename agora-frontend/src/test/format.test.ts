import { initials, normalizeCourseCode, pluralize, timeAgo } from "../utils/format";

describe("format utils", () => {
  const now = new Date("2026-06-20T12:00:00");

  it("timeAgo describes recent times", () => {
    expect(timeAgo("2026-06-20T11:59:30", now)).toBe("just now");
    expect(timeAgo("2026-06-20T11:55:00", now)).toBe("5 minutes ago");
    expect(timeAgo("2026-06-20T11:00:00", now)).toBe("1 hour ago");
    expect(timeAgo("2026-06-17T12:00:00", now)).toBe("3 days ago");
  });

  it("timeAgo returns an empty string for invalid dates", () => {
    expect(timeAgo("not a date", now)).toBe("");
  });

  it("initials takes the first letter of the first two names", () => {
    expect(initials("Ama Owusu")).toBe("AO");
    expect(initials("kofi")).toBe("K");
    expect(initials("Yaw Kwame Darko")).toBe("YK");
  });

  it("pluralize", () => {
    expect(pluralize(1, "reply", "replies")).toBe("1 reply");
    expect(pluralize(2, "reply", "replies")).toBe("2 replies");
    expect(pluralize(0, "vote")).toBe("0 votes");
  });

  it("normalizeCourseCode matches the backend format", () => {
    expect(normalizeCourseCode(" cs 201 ")).toBe("CS201");
  });
});
