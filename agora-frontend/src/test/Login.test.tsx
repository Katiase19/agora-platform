import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Login from "../pages/Login";
import { AuthProvider } from "../api/AuthContext";

vi.mock("../api/client", () => ({
  default: {
    post: vi.fn().mockResolvedValue({
      data: { token: "fake-jwt-token" },
    }),
  },
}));

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("Login", () => {
  it("renders email and password fields", () => {
    renderLogin();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders the login button", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("updates email field when user types", async () => {
    const user = userEvent.setup();
    renderLogin();
    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "test@gmail.com");
    expect(emailInput).toHaveValue("test@gmail.com");
  });

  it("updates password field when user types", async () => {
    const user = userEvent.setup();
    renderLogin();
    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "password123");
    expect(passwordInput).toHaveValue("password123");
  });

  it("shows register link", () => {
    renderLogin();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });
});