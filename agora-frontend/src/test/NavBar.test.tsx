import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../api/AuthContext";

function renderNavbar() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("Navbar", () => {
  it("renders the Agora brand link", () => {
    renderNavbar();
    expect(screen.getByText("Agora")).toBeInTheDocument();
  });

  it("shows Log In and Register links when not logged in", () => {
    renderNavbar();
    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("does not show Log Out button when not logged in", () => {
    renderNavbar();
    expect(screen.queryByText("Log Out")).not.toBeInTheDocument();
  });

  it("shows Ask a Question and Log Out when logged in", () => {
    localStorage.setItem("token", "fake-jwt-token");
    renderNavbar();
    expect(screen.getByText("Ask a Question")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
    localStorage.removeItem("token");
  });

  it("does not show Log In when logged in", () => {
    localStorage.setItem("token", "fake-jwt-token");
    renderNavbar();
    expect(screen.queryByText("Log In")).not.toBeInTheDocument();
    localStorage.removeItem("token");
  });

  it("clears token and shows login links after logout", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-jwt-token");
    renderNavbar();
    await user.click(screen.getByText("Log Out"));
    expect(localStorage.getItem("token")).toBeNull();
    localStorage.removeItem("token");
  });
});