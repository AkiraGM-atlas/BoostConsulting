import { AsyncLocalStorage } from "node:async_hooks";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { NextRequest, type NextFetchEvent } from "next/server";

const mocks = vi.hoisted(() => ({
  protect: vi.fn(),
  middleware: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware:
    (
      handler: (
        auth: { protect: typeof mocks.protect },
        request: NextRequest,
      ) => Promise<void>,
    ) =>
    async (request: NextRequest) => {
      mocks.middleware(request);
      await handler({ protect: mocks.protect }, request);
      return new Response(null, { headers: { "x-middleware-next": "1" } });
    },
}));

import proxy, { config } from "./proxy";

const event = {} as NextFetchEvent;
const requestFor = (path: string) =>
  new NextRequest(new URL(path, "http://localhost:3000"));

async function responseFor(path: string): Promise<Response> {
  const response = await proxy(requestFor(path), event);
  if (!(response instanceof Response))
    throw new Error("Expected an HTTP response");
  return response;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.protect.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each([
  { name: "both keys absent", publicKey: undefined, secretKey: undefined },
  { name: "both keys empty", publicKey: "", secretKey: "" },
  { name: "only public key present", publicKey: "test-public", secretKey: "" },
  { name: "only secret key present", publicKey: "", secretKey: "test-secret" },
  { name: "whitespace public key", publicKey: "  ", secretKey: "test-secret" },
  { name: "whitespace secret key", publicKey: "test-public", secretKey: "  " },
])("authentication unavailable: $name", ({ publicKey, secretKey }) => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", publicKey);
    vi.stubEnv("CLERK_SECRET_KEY", secretKey);
  });

  it.each(["/", "/api/health"])("allows public endpoint %s", async (path) => {
    const response = await responseFor(path);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(mocks.middleware).not.toHaveBeenCalled();
    expect(mocks.protect).not.toHaveBeenCalled();
  });

  it.each([
    "/dashboard",
    "/dashboard/settings",
    "/api/private",
    "/api/health/private",
    "/sign-in",
    "/sign-in/verify",
    "/sign-up",
  ])("fails closed for %s", async (path) => {
    const response = await responseFor(path);
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-middleware-next")).toBeNull();
    expect(await response.text()).toContain("認証環境を準備中です");
    expect(mocks.middleware).not.toHaveBeenCalled();
    expect(mocks.protect).not.toHaveBeenCalled();
  });
});

describe("authentication configured", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "test-public");
    vi.stubEnv("CLERK_SECRET_KEY", "test-secret");
  });

  it.each([
    "/",
    "/api/health",
    "/sign-in",
    "/sign-in/verify",
    "/sign-up",
    "/sign-up/verify",
  ])(
    "lets Clerk handle public endpoint %s without requiring a session",
    async (path) => {
      await proxy(requestFor(path), event);
      expect(mocks.middleware).toHaveBeenCalledOnce();
      expect(mocks.protect).not.toHaveBeenCalled();
    },
  );

  it.each([
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/private.csv",
    "/api/private",
    "/api/private.csv",
    "/sign-in-admin",
    "/sign-up-export",
  ])("requires Clerk protection for %s", async (path) => {
    await proxy(requestFor(path), event);
    expect(mocks.middleware).toHaveBeenCalledOnce();
    expect(mocks.protect).toHaveBeenCalledOnce();
  });

  it("does not continue when Clerk rejects access", async () => {
    const rejection = new Error("Authentication required");
    mocks.protect.mockRejectedValueOnce(rejection);
    await expect(proxy(requestFor("/dashboard"), event)).rejects.toBe(
      rejection,
    );
  });
});

describe("Next.js proxy matcher", () => {
  let doesMatch: typeof import("next/experimental/testing/server").unstable_doesMiddlewareMatch;

  beforeAll(async () => {
    // Next normally installs this global during server bootstrap.
    vi.stubGlobal("AsyncLocalStorage", AsyncLocalStorage);
    const testing = await import("next/experimental/testing/server");
    doesMatch = testing.unstable_doesMiddlewareMatch;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    "/dashboard",
    "/dashboard/private.csv",
    "/dashboard/report.pdf",
    "/api/private",
    "/api/private.csv",
    "/sign-in-admin",
    "/sign-up-export",
    "/_next/static-secret",
    "/_next/image-secret",
    "/favicon.ico/private",
  ])("runs authentication for %s", (url) => {
    expect(doesMatch({ config, url })).toBe(true);
  });

  it.each([
    "/_next/static/chunks/app.js",
    "/_next/image?url=%2Fphoto.jpg&w=640&q=75",
    "/favicon.ico",
  ])("skips public Next.js assets at %s", (url) => {
    expect(doesMatch({ config, url })).toBe(false);
  });
});
