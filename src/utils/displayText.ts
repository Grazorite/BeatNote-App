/** Keep long song titles recognisable at both ends without crowding the iPhone toolbar. */
export const SONG_TITLE_DISPLAY_THRESHOLD = 36;

export function middleTruncate(
  value: string,
  threshold = SONG_TITLE_DISPLAY_THRESHOLD,
): string {
  if (threshold < 5 || value.length <= threshold) return value;
  const visibleCharacters = threshold - 1;
  const leadingCharacters = Math.ceil(visibleCharacters / 2);
  const trailingCharacters = Math.floor(visibleCharacters / 2);
  return `${value.slice(0, leadingCharacters)}…${value.slice(-trailingCharacters)}`;
}
