import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Register from "../pages/Register";
import { AuthProvider } from "../api/AuthContext";

vi.mock("../api/client", () => ({
  default: {
    post: vi.fn().mockResolvedValue({
      data: { token: "fake-jwt-token" },
    }),
  },
}));

function renderRegister() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("Register", () => {
  it("renders all required fields", () => {
  renderRegister();
  expect(screen.getByLabelText("First Name", { exact: false })).toBeInTheDocument();
  expect(screen.getByLabelText("Last Name", { exact: false })).toBeInTheDocument();
  expect(screen.getByLabelText("Email", { exact: false })).toBeInTheDocument();
  expect(screen.getByLabelText("Password", { exact: false })).toBeInTheDocument();
});

it("renders optional fields", () => {
  renderRegister();
  expect(screen.getByLabelText("Course of Study", { exact: false })).toBeInTheDocument();
  expect(screen.getByLabelText("Academic Year", { exact: false })).toBeInTheDocument();
});

it("updates first name field when user types", async () => {
  const user = userEvent.setup();
  renderRegister();
  const input = screen.getByLabelText("First Name", { exact: false });
  await user.type(input, "Ama");
  expect(input).toHaveValue("Ama");
});

it("updates email field when user types", async () => {
  const user = userEvent.setup();
  renderRegister();
  const input = screen.getByLabelText("Email", { exact: false });
  await user.type(input, "ama@gmail.com");
  expect(input).toHaveValue("ama@gmail.com");
});
});