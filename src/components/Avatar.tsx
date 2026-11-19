type Props = {
  src: string;
  alt: string;
  /** Picks the background colour, so each person gets a consistent tint. */
  seed: string;
  className?: string;
};

// Muted tints that a white silhouette reads well on.
const TINTS = ["#94a3b8", "#a5b4fc", "#f9a8d4", "#fdba74", "#86efac", "#93c5fd", "#c4b5fd", "#fca5a5"];

export function tintFor(seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

/**
 * Profile photo. The seed data uses a plain human-silhouette placeholder
 * (no real people's photos). A plain <img> on purpose: next/image adds
 * nothing for a tiny local SVG.
 */
export default function Avatar({ src, alt, seed, className = "" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{ backgroundColor: tintFor(seed) }}
      className={`select-none object-contain object-bottom ${className}`}
    />
  );
}
