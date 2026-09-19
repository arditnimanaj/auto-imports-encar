/**
 * Plain <img> rather than next/image: Encar's CDN already returns the size we
 * ask for, and the optimiser would put a server hop in front of every photo.
 */
export default function CarPhoto({
  src, alt, className, priority = false, sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
    />
  );
}
