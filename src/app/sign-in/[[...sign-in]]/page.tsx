import { SignIn } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { isAuthConfigured } from "@/lib/auth-config";

export const dynamic = "force-dynamic";
export default function SignInPage() {
  if (!isAuthConfigured()) notFound();
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <SignIn />
    </main>
  );
}
