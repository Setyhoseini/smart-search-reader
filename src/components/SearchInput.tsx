"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import SearchSuggestions from "./SearchSuggestions";
import { getSuggestions } from "@/utils/search";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [originalQuery, setOriginalQuery] = useState(searchTerm);
  const [lastCharWasBackspace, setLastCharWasBackspace] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ Compute display value
  const displayValue = useCallback(() => {
    // When backspace was pressed, show ONLY the original query (no autocomplete)
    if (lastCharWasBackspace) {
      return originalQuery;
    }

    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      return suggestions[selectedIndex];
    }

    if (!isOpen || suggestions.length === 0) {
      return originalQuery;
    }

    const first = suggestions[0];
    if (first.toLowerCase().startsWith(originalQuery.toLowerCase())) {
      return first;
    }
    return originalQuery;
  }, [
    originalQuery,
    suggestions,
    isOpen,
    selectedIndex,
    lastCharWasBackspace,
  ])();

  // ✅ Update suggestions - NOW ALSO HANDLES SYNCING WITH searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      // ✅ Sync with parent's searchTerm if needed (WITHOUT cascading renders)
      if (searchTerm !== originalQuery) {
        setOriginalQuery(searchTerm);
      }

      // ✅ No suggestions when backspace was pressed
      if (originalQuery.trim() && !lastCharWasBackspace) {
        const newSuggestions = getSuggestions(text, originalQuery, 8);
        setSuggestions(newSuggestions);
        setIsOpen(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [originalQuery, text, searchTerm, lastCharWasBackspace]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const isTypingForward = newValue.length > originalQuery.length;

    if (isTypingForward) {
      setLastCharWasBackspace(false);
    }

    setOriginalQuery(newValue);
    onSearchChange(newValue);
  };

  // ✅ Handle keydown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace while autocomplete is active
    const hasAutocomplete =
      displayValue !== originalQuery && selectedIndex === -1 && isOpen;

    if (e.key === "Backspace" && hasAutocomplete) {
      e.preventDefault();

      // Keep only what user actually typed
      onSearchChange(originalQuery);

      // Disable autocomplete + suggestions
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      setLastCharWasBackspace(true);

      // Remove any selection
      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(
          originalQuery.length,
          originalQuery.length,
        );
      });

      return;
    }

    if (e.key === "Backspace") {
      setLastCharWasBackspace(true);
    } else {
      setLastCharWasBackspace(false);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    if (!isOpen || suggestions.length === 0 || lastCharWasBackspace) {
      if (e.key === "Enter" && originalQuery.trim()) {
        e.preventDefault();
        if (displayValue !== originalQuery) {
          handleSelectSuggestion(displayValue);
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (displayValue !== originalQuery) {
        handleSelectSuggestion(displayValue);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (displayValue !== originalQuery) {
        handleSelectSuggestion(displayValue);
      }
    }
  };

  // ✅ Highlight the auto-completed part - ONLY when NOT backspacing
  useEffect(() => {
    // Skip highlighting when backspace was pressed
    if (lastCharWasBackspace) {
      return;
    }

    if (inputRef.current) {
      const start = originalQuery.length;
      const end = displayValue.length;
      if (
        displayValue !== originalQuery &&
        isOpen &&
        start < end &&
        selectedIndex === -1
      ) {
        inputRef.current.setSelectionRange(start, end);
      }
    }
  }, [
    displayValue,
    originalQuery,
    isOpen,
    selectedIndex,
    lastCharWasBackspace,
  ]);

  const handleSelectSuggestion = (suggestion: string) => {
    setOriginalQuery(suggestion);
    onSearchChange(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
    setLastCharWasBackspace(false);
    inputRef.current?.focus();
  };

  const handleSuggestionHighlight = (index: number) => {
    setSelectedIndex(index);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
        setLastCharWasBackspace(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ REMOVED the problematic useEffect - now handled inside the debounced effect above

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a keyword..."
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (
              originalQuery.trim() &&
              suggestions.length > 0 &&
              !lastCharWasBackspace
            ) {
              setIsOpen(true);
            }
          }}
          className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-900 placeholder-blue-900 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {originalQuery && currentMatchIndex !== null && totalMatches > 0 && (
            <span className="text-gray-600 font-medium text-sm">
              {currentMatchIndex + 1}/{totalMatches}
            </span>
          )}
          <Image
            src="/line-vertical.svg"
            width={24}
            height={24}
            alt="Separator"
          />
          <button
            onClick={onPrev}
            disabled={totalMatches === 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed p-1 hover:bg-gray-100 rounded transition"
          >
            <Image
              src="/chevron.svg"
              width={20}
              height={20}
              alt="Previous"
              className="rotate-270"
            />
          </button>
          <button
            onClick={onNext}
            disabled={totalMatches === 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed p-1 hover:bg-gray-100 rounded transition"
          >
            <Image
              src="/chevron.svg"
              width={20}
              height={20}
              alt="Next"
              className="rotate-90"
            />
          </button>
        </div>
      </div>

      <SearchSuggestions
        suggestions={suggestions}
        query={originalQuery}
        selectedIndex={selectedIndex}
        onSelect={handleSelectSuggestion}
        onHighlight={handleSuggestionHighlight}
        isOpen={isOpen && suggestions.length > 0 && !lastCharWasBackspace}
      />
    </div>
  );
}