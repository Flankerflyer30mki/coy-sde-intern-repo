import Link from "next/link";
import MatchesList from "@/components/MatchesList";

export default function MatchesPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link href="/discover" className="text-sm text-zinc-500" aria-label="Back to Discover">
          ← Back
        </Link>
        <h1 className="text-xl font-bold">Matches</h1>
      </header>
      <MatchesList />
    </div>
  );
}
