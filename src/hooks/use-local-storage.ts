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

      // Always read the latest value from storage before making an update.
      // This avoids race conditions and stale state.
      const currentValue = readValue();
      const newValue = value instanceof Function ? value(currentValue) : value;

      try {
        // Persist to localStorage.
        window.localStorage.setItem(key, JSON.stringify(newValue));
        
        // Update the state of this hook instance IMMEDIATELY.
        setStoredValue(newValue);

        // Debug log for albums to track the issue
        if (key === "albums") {
          console.log(`🔧 DEBUG: localStorage "${key}" updated:`, newValue);
          console.log(`🔧 DEBUG: localStorage size:`, (newValue as any[])?.length || 0);
        }

        // Force a synthetic storage event to sync across all hook instances
        // This ensures all components using the same key get updated immediately
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: JSON.stringify(newValue),
          oldValue: JSON.stringify(currentValue),
          storageArea: window.localStorage,
          url: window.location.href
        }));

      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
        
        // Handle quota exceeded error specifically
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          // Try to calculate the size of the data being stored
          const dataSize = JSON.stringify(newValue).length;
          const dataSizeMB = (dataSize / (1024 * 1024)).toFixed(2);
          
          console.error(`❌ LocalStorage quota exceeded! Trying to store ${dataSizeMB}MB`);
          
          // Throw a more user-friendly error
          throw new Error(`Storage limit exceeded. You're trying to save ${dataSizeMB}MB but localStorage has limited space. Try removing audio files or exporting your data first.`);
        }
        
        throw error;
      }
    },
    [key, readValue]
  );
  
  // This effect runs on mount to sync the state with the value in localStorage.
  useEffect(() => {
    const initialValue = readValue();
    setStoredValue(initialValue);
    
    // Debug log for albums on mount
    if (key === "albums") {
      console.log(`🔧 DEBUG: localStorage "${key}" on mount:`, initialValue);
      console.log(`🔧 DEBUG: localStorage size on mount:`, (initialValue as any[])?.length || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This effect listens for storage changes to sync across tabs.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        const newValue = readValue();
        setStoredValue(newValue);
        
        // Debug log for storage events
        if (key === "albums") {
          console.log(`🔧 DEBUG: Storage event for "${key}":`, newValue);
          console.log(`🔧 DEBUG: Event triggered by:`, e.url);
        }
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