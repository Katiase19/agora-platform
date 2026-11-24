import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  // Tokens and autosaved drafts must not leak between tests
  localStorage.clear();
});
