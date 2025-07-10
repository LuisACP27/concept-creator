"use client";

import { useState, useEffect, useCallback } from "react";

// This hook is designed to be SSR-safe and sync across tabs.
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // A function to read the value from local storage.
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // The state that holds the value. Initialized with the initialValue to prevent hydration errors.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // The setter function. Wrapped in useCallback to keep it stable across re-renders.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      // Prevent SSR issues
      if (typeof window === 'undefined') {
        console.warn(`Tried to set localStorage key "${key}" even though no window was found`);
        return;
      }

      try {
        // Always read the latest value from storage before making an update.
        // This avoids race conditions and stale state.
        const currentValue = readValue();
        const newValue = value instanceof Function ? value(currentValue) : value;
        
        // Persist to localStorage.
        window.localStorage.setItem(key, JSON.stringify(newValue));
        
        // Update the state of this hook instance.
        setStoredValue(newValue);

      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, readValue]
  );
  
  // This effect runs on mount to sync the state with the value in localStorage.
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This effect listens for storage changes to sync across tabs.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(readValue());
      }
    };

    // Listen for the native 'storage' event for cross-tab synchronization.
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
} 