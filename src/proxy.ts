import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import { isAuthConfigured } from "@/lib/auth-config";

function isPublicRoute(request: NextRequest): boolean {
  const path = request.nextUrl.pathname;
  return (
    ["/", "/api/health", "/sign-in", "/sign-up"].includes(path) ||
    path.startsWith("/sign-in/") ||
    path.startsWith("/sign-up/")
  );
}
const withClerk = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect();
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!isAuthConfigured()) {
    if (
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname === "/api/health"
    )
      return NextResponse.next();
    return new NextResponse(
      "認証環境を準備中です。設定完了後にお試しください。",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }
  return withClerk(request, event);
}

export const config = {
  matcher: ["/((?!_next/static(?:/|$)|_next/image(?:/|$)|favicon\\.ico$).*)"],
};
