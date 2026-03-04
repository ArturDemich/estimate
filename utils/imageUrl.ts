/**
 * Converts Google Drive URL to a direct viewable image URL.
 * drive.google.com/uc?id=XXX does not work as <img src>; use export=view.
 */
export function toViewableImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== "string") return "";
  const match = url.match(/drive\.google\.com\/uc\?id=([^&\s]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }
  return url;
}
