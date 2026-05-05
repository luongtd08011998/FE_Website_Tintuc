/**
 * Định dạng kích thước file từ bytes sang KB hoặc MB
 * < 1MB -> KB (vd: 200 KB)
 * >= 1MB -> MB (vd: 2.5 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 KB";
  const k = 1024;
  const m = k * 1024;
  if (bytes < m) {
    return `${(bytes / k).toFixed(1)} KB`;
  }
  return `${(bytes / m).toFixed(1)} MB`;
}

/**
 * Copy text vào clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
