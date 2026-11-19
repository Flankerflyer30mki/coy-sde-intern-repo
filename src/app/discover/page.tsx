import Link from "next/link";
import DiscoverDeck from "@/components/DiscoverDeck";

export default function DiscoverPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold">Discover</h1>
        <Link
          href="/discover/matches"
          className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-brand"
        >
          💘 Matches
        </Link>
      </header>
      <DiscoverDeck />
    </div>
  );
}
