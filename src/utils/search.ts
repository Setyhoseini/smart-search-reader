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

/**
 * Get unique words from the text that start with the search term (case-insensitive)
 * Sorted by frequency (most common first)
 */
export function getSuggestions(text: string, query: string, maxResults: number = 10): string[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  
  // Split text into words (remove punctuation)
  const words = text.match(/[a-zA-Z\u0600-\u06FF]+/g) || [];
  
  // Count frequency of each word that starts with the query
  const wordCount: Record<string, number> = {};
  
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    if (lowerWord.startsWith(lowerQuery) && lowerWord !== lowerQuery) {
      // Store with original casing for display, but key for counting
      const key = lowerWord;
      wordCount[key] = (wordCount[key] || 0) + 1;
    }
  }
  
  // Sort by frequency (highest first), then alphabetically
  const sortedWords = Object.keys(wordCount).sort((a, b) => {
    const freqDiff = wordCount[b] - wordCount[a];
    if (freqDiff !== 0) return freqDiff;
    return a.localeCompare(b);
  });
  
  // Return the top results
  return sortedWords.slice(0, maxResults);
}