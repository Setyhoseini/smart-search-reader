"use client";

import { useState, useEffect, useRef } from "react";
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
  const [autocompleteDisabled, setAutocompleteDisabled] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const displayValue = (() => {
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      return suggestions[selectedIndex];
    }

    if (autocompleteDisabled || !isOpen || suggestions.length === 0) {
      return originalQuery;
    }

    const first = suggestions[0];

    if (first.toLowerCase().startsWith(originalQuery.toLowerCase())) {
      return originalQuery + first.slice(originalQuery.length);
    }

    return originalQuery;
  })();

  // ✅ FIX: Combined effect with debounce and sync
  useEffect(() => {
    const timer = setTimeout(() => {
      // ✅ Sync with parent's searchTerm here (debounced)
      if (searchTerm !== originalQuery) {
        setOriginalQuery(searchTerm);
      }

      if (originalQuery.trim() && !autocompleteDisabled) {
        const newSuggestions = getSuggestions(text, originalQuery, 8).map(
          capitalize,
        );

        setSuggestions(newSuggestions);
        setIsOpen(newSuggestions.length > 0);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [originalQuery, text, autocompleteDisabled, searchTerm]); // ← Added searchTerm

  // ❌ REMOVED the problematic useEffect
  // useEffect(() => {
  //   if (searchTerm !== originalQuery) {
  //     setOriginalQuery(searchTerm);
  //   }
  // }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setOriginalQuery(newValue);
    onSearchChange(newValue);
  };

  const isPrintableKey = (e: React.KeyboardEvent<HTMLInputElement>) =>
    e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

  const handleSelectSuggestion = (suggestion: string) => {
    const committed = capitalize(suggestion);

    setOriginalQuery(committed);
    onSearchChange(committed);

    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    setAutocompleteDisabled(false);

    requestAnimationFrame(() => {
      const len = committed.length;

      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(len, len);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Re‑enable autocomplete when user types a character
    if (isPrintableKey(e)) {
      setAutocompleteDisabled(false);
    }

    // Backspace or Delete: disable autocomplete and close suggestions
    if (e.key === "Backspace" || e.key === "Delete") {
      // Check if there's an active autocomplete suffix
      const hasSuffix =
        !autocompleteDisabled &&
        displayValue !== originalQuery &&
        selectedIndex === -1 &&
        isOpen;

      if (hasSuffix) {
        e.preventDefault(); // Prevent default deletion
        setSuggestions([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        setAutocompleteDisabled(true);

        // Move cursor to the end of the typed part
        requestAnimationFrame(() => {
          const len = originalQuery.length;
          inputRef.current?.focus();
          inputRef.current?.setSelectionRange(len, len);
        });
      } else {
        // Simply disable autocomplete; normal deletion will occur
        setAutocompleteDisabled(true);
      }
      return; // Don't process arrow keys after backspace
    }

    if (e.key === "Escape") {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (displayValue !== originalQuery) {
        handleSelectSuggestion(displayValue);
      }
    }
  };

  useEffect(() => {
    if (autocompleteDisabled || !inputRef.current) {
      return;
    }

    const start = originalQuery.length;
    const end = displayValue.length;

    if (
      displayValue !== originalQuery &&
      isOpen &&
      selectedIndex === -1 &&
      start < end
    ) {
      inputRef.current.setSelectionRange(start, end);
    }
  }, [
    displayValue,
    originalQuery,
    isOpen,
    selectedIndex,
    autocompleteDisabled,
  ]);

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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              !autocompleteDisabled
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
        isOpen={isOpen && suggestions.length > 0}
      />
    </div>
  );
}
