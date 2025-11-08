"use client";

import { useState, useEffect, useMemo } from "react";

interface UseSearchOptions<T> {
  items: T[];
  searchFn: (item: T, searchTerm: string) => boolean;
  debounceMs?: number;
}

/**
 * Custom hook for search functionality with debounce
 * @param items - Array of items to search through
 * @param searchFn - Function to determine if an item matches the search term
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Object with searchTerm, setSearchTerm, debouncedSearchTerm, and filteredItems
 */
export function useSearch<T>({
  items,
  searchFn,
  debounceMs = 300,
}: UseSearchOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(handle);
  }, [searchTerm, debounceMs]);

  // Filter items based on debounced search term
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return items;
    }

    return items.filter((item) => searchFn(item, debouncedSearchTerm));
  }, [items, debouncedSearchTerm, searchFn]);

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filteredItems,
    clearSearch,
  };
}

