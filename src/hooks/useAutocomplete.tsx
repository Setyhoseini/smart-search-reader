import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getSuggestions } from '@/utils/search';

interface UseAutocompleteProps {
  initialQuery?: string;
  text: string;
  onSearchChange: (value: string) => void;
  externalSearchTerm?: string; // sync with parent
}

export function useAutocomplete({
  initialQuery = '',
  text,
  onSearchChange,
  externalSearchTerm,
}: UseAutocompleteProps) {
  // State
  const [originalQuery, setOriginalQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [autocompleteDisabled, setAutocompleteDisabled] = useState(false);

  // Ref
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper: Capitalize
  const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  // Compute display value
  const displayValue = useMemo(() => {
    // Selected suggestion from keyboard/mouse
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      return suggestions[selectedIndex];
    }

    // If autocomplete is disabled or no suggestions, show only what user typed
    if (autocompleteDisabled || !isOpen || suggestions.length === 0) {
      return originalQuery;
    }

    const first = suggestions[0];
    if (first.toLowerCase().startsWith(originalQuery.toLowerCase())) {
      return originalQuery + first.slice(originalQuery.length);
    }

    return originalQuery;
  }, [originalQuery, suggestions, isOpen, selectedIndex, autocompleteDisabled]);

  // Fetch suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Sync with external search term if provided
      if (externalSearchTerm !== undefined && externalSearchTerm !== originalQuery) {
        setOriginalQuery(externalSearchTerm);
      }

      if (originalQuery.trim() && !autocompleteDisabled) {
        const newSuggestions = getSuggestions(text, originalQuery, 8).map(capitalize);
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
  }, [originalQuery, text, autocompleteDisabled, externalSearchTerm]);

  // Handlers
  const handleInputChange = useCallback((newValue: string) => {
    setOriginalQuery(newValue);
    onSearchChange(newValue);
    // Typing forward re-enables autocomplete
    if (autocompleteDisabled) {
      setAutocompleteDisabled(false);
    }
  }, [onSearchChange, autocompleteDisabled]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    const committed = capitalize(suggestion);
    setOriginalQuery(committed);
    onSearchChange(committed);
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    setAutocompleteDisabled(false);
    // Move cursor to end
    requestAnimationFrame(() => {
      const len = committed.length;
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(len, len);
    });
  }, [onSearchChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Re-enable autocomplete on printable characters
    const isPrintableKey = (event: React.KeyboardEvent) =>
      event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    if (isPrintableKey(e)) {
      setAutocompleteDisabled(false);
    }

    // Backspace or Delete: disable autocomplete and optionally remove suffix
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const hasSuffix = !autocompleteDisabled &&
        displayValue !== originalQuery &&
        selectedIndex === -1 &&
        isOpen;

      if (hasSuffix) {
        e.preventDefault();
        setSuggestions([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        setAutocompleteDisabled(true);
        requestAnimationFrame(() => {
          const len = originalQuery.length;
          inputRef.current?.focus();
          inputRef.current?.setSelectionRange(len, len);
        });
      } else {
        setAutocompleteDisabled(true);
      }
      return;
    }

    // Escape: close dropdown
    if (e.key === 'Escape') {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    // If dropdown closed or no suggestions, do nothing else
    if (!isOpen || suggestions.length === 0) return;

    // Arrow navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (displayValue !== originalQuery) {
        handleSelectSuggestion(displayValue);
      }
    }
  }, [autocompleteDisabled, displayValue, originalQuery, isOpen, suggestions, selectedIndex, handleSelectSuggestion]);

  // Selection highlight
  useEffect(() => {
    if (autocompleteDisabled || !inputRef.current) return;
    const start = originalQuery.length;
    const end = displayValue.length;
    if (displayValue !== originalQuery && isOpen && selectedIndex === -1 && start < end) {
      inputRef.current.setSelectionRange(start, end);
    }
  }, [displayValue, originalQuery, isOpen, selectedIndex, autocompleteDisabled]);

  // Click outside
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Expose
  return {
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
    handleSuggestionHighlight: setSelectedIndex,
    setAutoCompleteDisabled: setAutocompleteDisabled,
    setSuggestions,
    setIsOpen,
    setSelectedIndex,
  };
}