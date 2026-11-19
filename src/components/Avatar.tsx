type Props = { src: string; alt: string; className?: string };

/**
 * Profile photo. A plain <img> on purpose: the avatars are small remote SVGs,
 * and next/image would need extra config (remote domains + SVG allowance)
 * for no real gain here.
 */
export default function Avatar({ src, alt, className = "" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} draggable={false} className={`select-none object-cover ${className}`} />
  );
}
