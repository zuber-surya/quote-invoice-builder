import { describe, expect, it, vi } from "vitest";

// Auth.js v5's `auth(callback)` wraps `callback` with session resolution and calls
// it with `req.auth` populated. Mocking `auth` as an identity function lets us test
// our own routing/authorization logic directly against a fake `req`.
vi.mock("@/lib/auth", () => ({ auth: (callback: unknown) => callback }));

import middleware from "./middleware";

type FakeUser = { id: string; name: string; email: string };

function makeReq(pathname: string, user: FakeUser | null) {
  return {
    nextUrl: new URL(`http://localhost${pathname}`),
    auth: user ? { user } : null,
  } as never;
}

// The real Auth.js callback type returns `void | Response` and takes a second
// `NextFetchEvent` arg we don't use — this project's middleware always returns a
// Response, so asserting that here keeps the rest of each test readable.
async function run(pathname: string, user: FakeUser | null) {
  const response = await middleware(makeReq(pathname, user), {} as never);
  if (!response) throw new Error("middleware returned void, expected a Response");
  return response;
}

const loggedInUser = { id: "user-1", name: "Demo", email: "demo@example.com" };

describe("middleware", () => {
  it("returns a JSON 401 for unauthenticated /api/ requests, never a redirect", async () => {
    const response = await run("/api/v1/customers", null);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in." } });
  });

  it("still redirects an unauthenticated page request to /login with a callbackUrl", async () => {
    const response = await run("/dashboard", null);

    expect(response.status).toBe(307);
    const location = response.headers.get("location") ?? "";
    expect(location).toContain("/login");
    expect(location).toContain("callbackUrl=%2Fdashboard");
  });

  it("lets unauthenticated requests through for public API prefixes", async () => {
    const response = await run("/api/auth/session", null);
    expect(response.status).toBe(200);
  });

  it("lets unauthenticated requests through for public pages", async () => {
    const response = await run("/login", null);
    expect(response.status).toBe(200);
  });

  it("allows an authenticated request to a protected API route through", async () => {
    const response = await run("/api/v1/customers", loggedInUser);
    expect(response.status).toBe(200);
  });

  it("redirects an authenticated user away from /login", async () => {
    const response = await run("/login", loggedInUser);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });
});
