/**
 * 雪场封面：有 coverImageUrl 用真实图片（支持放在 apps/web/public/images/resorts/ 下），
 * 没有则按 slug 生成确定性的山形插画占位，避免版权风险。
 */

function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

export function ResortCover({
  slug,
  name,
  imageUrl,
  className,
}: {
  slug: string;
  name: string;
  imageUrl: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={name} className={`h-full w-full object-cover ${className ?? ""}`} />
    );
  }
  const hue = hashHue(slug);
  const sky = `hsl(${hue}, 45%, 82%)`;
  const skyDark = `hsl(${hue}, 40%, 60%)`;
  const back = `hsl(${hue}, 25%, 68%)`;
  const front = `hsl(${hue}, 30%, 52%)`;
  return (
    <svg
      viewBox="0 0 400 160"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className ?? ""}`}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id={`sky-${slug}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky} />
          <stop offset="100%" stopColor={skyDark} />
        </linearGradient>
      </defs>
      <rect width="400" height="160" fill={`url(#sky-${slug})`} />
      <circle cx="330" cy="38" r="18" fill="white" opacity="0.85" />
      <path d="M0 160 L90 70 L150 120 L210 60 L280 160 Z" fill={back} />
      <path d="M120 160 L230 55 L290 110 L340 75 L400 160 Z" fill={front} />
      <path d="M218 67 L230 55 L242 67 L233 66 L228 72 Z" fill="white" />
      <path d="M78 82 L90 70 L102 82 L93 80 L87 87 Z" fill="white" />
    </svg>
  );
}
