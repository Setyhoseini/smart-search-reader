import { findMatches } from './search';

export function getHighlightedSegments(
  text: string,
  query: string
): Array<{ text: string; isMatch: boolean; matchIndex?: number }> {
  if (!query.trim()) {
    return [{ text, isMatch: false }];
  }

  const matches = findMatches(text, query);
  if (matches.length === 0) {
    return [{ text, isMatch: false }];
  }

  const segments: Array<{ text: string; isMatch: boolean; matchIndex?: number }> = [];
  let lastEnd = 0;

  matches.forEach((match, idx) => {
    // Add plain text before the match
    if (match.start > lastEnd) {
      segments.push({
        text: text.slice(lastEnd, match.start),
        isMatch: false,
      });
    }
    // Add the matched text
    segments.push({
      text: text.slice(match.start, match.end),
      isMatch: true,
      matchIndex: idx,
    });
    lastEnd = match.end;
  });

  // Add remaining plain text
  if (lastEnd < text.length) {
    segments.push({
      text: text.slice(lastEnd),
      isMatch: false,
    });
  }

  return segments;
}