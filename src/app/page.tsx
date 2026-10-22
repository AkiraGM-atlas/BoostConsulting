import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-widest text-slate-600">
        BOOST CONSULTING
      </p>
      <h1 className="mt-4 break-words text-4xl font-bold tracking-tight sm:text-5xl">
        BoostConsulting
      </h1>
      <p className="mt-6 text-lg leading-8 text-slate-700">
        ワークスペースの準備を進めています。
      </p>
      <Link
        className="mt-8 w-fit rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white"
        prefetch={false}
        href="/dashboard"
      >
        ワークスペースを開く
      </Link>
    </main>
  );
}
