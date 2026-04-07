/** Paths safe for `next/image` (must be absolute URL or start with `/`). */
export function pictureToImageSrc(picture: string): string | null {
    const s = picture.trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/")) return s;
    return `/mobile-suits/${s}`;
  }