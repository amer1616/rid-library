import { beforeAll, afterAll, vi } from "vitest";

// Example: Mocking console methods to suppress logs during tests
beforeAll(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});
