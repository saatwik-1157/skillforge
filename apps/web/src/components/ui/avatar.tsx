import { cn } from '@/lib/utils';

/** Circular avatar with image fallback to the person's initial. */
export function Avatar({
  src,
  name,
  className,
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
}) {
  const initial = name?.charAt(0)?.toUpperCase() ?? 'U';
  return (
    <span
      className={cn(
        'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy text-sm font-bold text-white',
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? 'avatar'} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
