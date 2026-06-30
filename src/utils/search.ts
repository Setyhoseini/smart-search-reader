export function findMatches(text: string, query: string): Array<{ start: number; end: number }> {
  if (!query.trim()) return [];
  
  const matches: Array<{ start: number; end: number }> = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let index = lowerText.indexOf(lowerQuery);
  
  while (index !== -1) {
    matches.push({ start: index, end: index + query.length });
    index = lowerText.indexOf(lowerQuery, index + 1);
  }
  
  return matches;
}