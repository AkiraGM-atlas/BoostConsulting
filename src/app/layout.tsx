import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { isAuthConfigured } from "@/lib/auth-config";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoostConsulting",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        {isAuthConfigured() ? (
          <ClerkProvider
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
          >
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
