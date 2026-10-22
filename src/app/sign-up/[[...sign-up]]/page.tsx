import { SignUp } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { isAuthConfigured } from "@/lib/auth-config";

export const dynamic = "force-dynamic";
export default function SignUpPage() {
  if (!isAuthConfigured()) notFound();
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <SignUp />
    </main>
  );
}
