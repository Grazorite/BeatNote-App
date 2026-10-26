export const DEFAULT_ANNOTATION_SUGGESTIONS = [
  'Hit',
  '8-count',
  'Formation',
  'Freeze',
  'Turn',
  'Jump',
  'Accent',
] as const;

export const appendAnnotationSuggestion = (
  current: string,
  suggestion: string,
  maxLength: number,
): string => {
  const trimmed = current.trim();
  const combined = trimmed.length === 0 ? suggestion : `${trimmed} · ${suggestion}`;
  if (combined.length <= maxLength) return combined;
  return trimmed.length === 0 ? suggestion.slice(0, maxLength) : trimmed.slice(0, maxLength);
};
