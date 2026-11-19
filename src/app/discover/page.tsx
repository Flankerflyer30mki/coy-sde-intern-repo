import Link from "next/link";

// Discover tab: the swipe deck will live here.
export default function DiscoverPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold">Discover</h1>
        <Link href="/discover/matches" className="text-sm font-medium text-brand">
          Matches
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center text-zinc-400">
        Swipe deck coming soon
      </div>
    </div>
  );
}
