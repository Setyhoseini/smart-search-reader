'use client';

import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { getHighlightedSegments } from '@/utils/highlight';

// Types
interface SearchContextValue {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentMatchIndex: number | null;
  setCurrentMatchIndex: (index: number | null) => void;
  totalMatches: number;
  segments: ReturnType<typeof getHighlightedSegments>;
  text: string;
  setText: (text: string) => void;
  // Navigation functions
  goToNext: () => void;
  goToPrev: () => void;
  goToMatch: (index: number) => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

// Provider
export function SearchProvider({
  children,
  initialText = '',
}: {
  children: ReactNode;
  initialText?: string;
}) {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number | null>(null);
  const [text, setText] = useState(initialText);

  // Derived data (computed)
  const segments = useMemo(
    () => getHighlightedSegments(text, searchTerm),
    [text, searchTerm]
  );

  const matches = useMemo(
    () => segments.filter((s) => s.isMatch),
    [segments]
  );

  const totalMatches = matches.length;

  // Navigation functions
  const goToMatch = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalMatches) return;
      setCurrentMatchIndex(index);
    },
    [totalMatches] // Only changes when totalMatches changes
  );

  const goToNext = useCallback(() => {
    if (currentMatchIndex === null) {
      goToMatch(0);
    } else {
      goToMatch((currentMatchIndex + 1) % totalMatches);
    }
  }, [currentMatchIndex, totalMatches, goToMatch]);

  const goToPrev = useCallback(() => {
    if (currentMatchIndex === null) {
      goToMatch(totalMatches - 1);
    } else {
      goToMatch((currentMatchIndex - 1 + totalMatches) % totalMatches);
    }
  }, [currentMatchIndex, totalMatches, goToMatch]);

  // Context value
  const value = useMemo(
    () => ({
      searchTerm,
      setSearchTerm,
      currentMatchIndex,
      setCurrentMatchIndex,
      totalMatches,
      segments,
      text,
      setText,
      goToNext,
      goToPrev,
      goToMatch,
    }),
    [
      searchTerm,
      currentMatchIndex,
      totalMatches,
      segments,
      text,
      goToNext,
      goToPrev,
      goToMatch,
    ]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

// Custom hook
export function useSearchContext() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}