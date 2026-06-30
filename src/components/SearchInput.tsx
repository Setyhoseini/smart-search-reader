"use client";

import { useAutocomplete } from "@/hooks/useAutocomplete";
import SearchSuggestions from "./SearchSuggestions";
import NavigationArrows from "./NavigationArrows";

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalMatches: number;
  currentMatchIndex: number | null;
  onPrev: () => void;
  onNext: () => void;
  text: string;
}

export default function SearchInput({
  searchTerm,
  onSearchChange,
  totalMatches,
  currentMatchIndex,
  onPrev,
  onNext,
  text,
}: SearchInputProps) {
  // Use the custom Autocomplete hook
  const {
    inputRef,
    containerRef,
    displayValue,
    suggestions,
    selectedIndex,
    isOpen,
    originalQuery,
    autocompleteDisabled,
    handleInputChange,
    handleKeyDown,
    handleSelectSuggestion,
    handleSuggestionHighlight,
  } = useAutocomplete({
    initialQuery: searchTerm,
    text,
    onSearchChange,
    externalSearchTerm: searchTerm, // sync with parent
  });

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a keyword..."
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (
              originalQuery.trim() &&
              suggestions.length > 0 &&
              !autocompleteDisabled
            ) {
              // isOpen is managed by the hook; we can just call setter if needed,
              // but the hook already handles opening when suggestions appear.
              // We'll let the hook manage it.
            }
          }}
          className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-900 placeholder-blue-900 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-40"
        />

        {/* Navigation Arrows */}
        <NavigationArrows
          totalMatches={totalMatches}
          currentMatchIndex={currentMatchIndex}
          onPrev={onPrev}
          onNext={onNext}
          query={originalQuery}
        />
      </div>

      <SearchSuggestions
        suggestions={suggestions}
        query={originalQuery}
        selectedIndex={selectedIndex}
        onSelect={handleSelectSuggestion}
        onHighlight={handleSuggestionHighlight}
        isOpen={isOpen && suggestions.length > 0}
      />
    </div>
  );
}
