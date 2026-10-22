import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { isAuthConfigured } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isAuthConfigured()) notFound();
  await auth.protect();
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">BoostConsulting ワークスペース</h1>
        <UserButton />
      </header>
      <p className="mt-8 text-slate-700">
        ログインしました。業務機能はここに追加します。
      </p>
    </main>
  );
}
