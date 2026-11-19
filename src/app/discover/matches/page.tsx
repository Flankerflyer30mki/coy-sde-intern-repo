import Link from "next/link";

// Matches view: will list mutual matches from GET /api/matches.
export default function MatchesPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link href="/discover" className="text-sm text-zinc-500">
          ← Back
        </Link>
        <h1 className="text-xl font-bold">Matches</h1>
      </header>
      <div className="flex flex-1 items-center justify-center text-zinc-400">
        Matches list coming soon
      </div>
    </div>
  );
}
