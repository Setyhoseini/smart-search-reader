'use client';

import { useEffect, useRef } from 'react';

interface SearchSuggestionsProps {
  suggestions: string[];
  query: string;
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
  onHighlight: (index: number) => void;
  isOpen: boolean;
}

export default function SearchSuggestions({
  suggestions,
  query,
  selectedIndex,
  onSelect,
  onHighlight,
  isOpen,
}: SearchSuggestionsProps) {
  const suggestionRefs = useRef<(HTMLElement | null)[]>([]);

  // Scroll the selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < suggestionRefs.current.length) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  if (!isOpen || suggestions.length === 0 || !query.trim()) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
      <ul className="py-1">
        {suggestions.map((suggestion, index) => {
          const isSelected = index === selectedIndex;
          // Highlight the matched part in the suggestion
          const matchStart = suggestion.toLowerCase().indexOf(query.toLowerCase());
          const beforeMatch = suggestion.slice(0, matchStart);
          const matched = suggestion.slice(matchStart, matchStart + query.length);
          const afterMatch = suggestion.slice(matchStart + query.length);

          return (
            <li
              key={suggestion + index}
              ref={(el) => {
                suggestionRefs.current[index] = el;
              }}
              className={`
                px-4 py-2 cursor-pointer text-left transition-colors
                ${isSelected 
                  ? 'bg-blue-100 text-blue-900' 
                  : 'hover:bg-gray-100 text-gray-700'
                }
              `}
              onClick={() => onSelect(suggestion)}
              onMouseEnter={() => onHighlight(index)}
            >
              {matchStart > 0 && <span>{beforeMatch}</span>}
              <span className="font-bold text-blue-600">{matched}</span>
              {afterMatch && <span>{afterMatch}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}