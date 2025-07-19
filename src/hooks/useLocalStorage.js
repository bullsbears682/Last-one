import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with automatic JSON serialization/deserialization
 * @param {string} key - The localStorage key
 * @param {*} initialValue - The initial value if no stored value exists
 * @returns {[value, setValue]} - The current value and a setter function
 */
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or if none return initialValue
      if (item) {
        const parsed = JSON.parse(item);
        
        // Validate and migrate data if needed
        return validateAndMigrateData(parsed, initialValue);
      }
      
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch custom event for cross-tab communication
        window.dispatchEvent(new CustomEvent('localStorage-update', {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(validateAndMigrateData(newValue, initialValue));
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    const handleCustomStorageChange = (e) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorage-update', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorage-update', handleCustomStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
};

/**
 * Validates and migrates data structure to ensure compatibility
 * @param {*} storedData - The data from localStorage
 * @param {*} initialValue - The expected initial structure
 * @returns {*} - The validated/migrated data
 */
const validateAndMigrateData = (storedData, initialValue) => {
  if (!storedData || typeof storedData !== 'object') {
    return initialValue;
  }

  // Ensure all required keys exist
  const migratedData = { ...initialValue };
  
  // Merge stored data with initial structure
  Object.keys(initialValue).forEach(key => {
    if (storedData.hasOwnProperty(key)) {
      if (typeof initialValue[key] === 'object' && !Array.isArray(initialValue[key])) {
        // Recursively merge objects
        migratedData[key] = { ...initialValue[key], ...storedData[key] };
      } else {
        migratedData[key] = storedData[key];
      }
    }
  });

  // Add version for future migrations
  if (!migratedData.version) {
    migratedData.version = '1.0.0';
  }

  return migratedData;
};

/**
 * Hook for managing localStorage with expiration
 * @param {string} key - The localStorage key
 * @param {*} initialValue - The initial value
 * @param {number} expirationHours - Hours until expiration (default: 24)
 * @returns {[value, setValue, isExpired]} - Value, setter, and expiration status
 */
export const useLocalStorageWithExpiration = (key, initialValue, expirationHours = 24) => {
  const [storedValue, setStoredValue] = useLocalStorage(key, {
    value: initialValue,
    timestamp: Date.now(),
    expiration: expirationHours * 60 * 60 * 1000 // Convert to milliseconds
  });

  const isExpired = Date.now() - storedValue.timestamp > storedValue.expiration;

  const setValue = useCallback((value) => {
    setStoredValue({
      value: value instanceof Function ? value(storedValue.value) : value,
      timestamp: Date.now(),
      expiration: expirationHours * 60 * 60 * 1000
    });
  }, [setStoredValue, storedValue.value, expirationHours]);

  return [isExpired ? initialValue : storedValue.value, setValue, isExpired];
};

/**
 * Hook for managing multiple localStorage keys as a single object
 * @param {Object} keys - Object with key-value pairs for localStorage keys and initial values
 * @returns {[values, setValues]} - Object with all values and setter function
 */
export const useMultipleLocalStorage = (keys) => {
  const [values, setValues] = useState(() => {
    const initialValues = {};
    Object.entries(keys).forEach(([key, initialValue]) => {
      try {
        const item = window.localStorage.getItem(key);
        initialValues[key] = item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        initialValues[key] = initialValue;
      }
    });
    return initialValues;
  });

  const setMultipleValues = useCallback((updates) => {
    setValues(prev => {
      const newValues = { ...prev, ...updates };
      
      // Update localStorage for each changed value
      Object.entries(updates).forEach(([key, value]) => {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      });
      
      return newValues;
    });
  }, []);

  return [values, setMultipleValues];
};

/**
 * Hook for clearing localStorage data
 * @returns {Function} - Function to clear specific keys or all app data
 */
export const useClearLocalStorage = () => {
  const clearStorage = useCallback((keysToKeep = []) => {
    try {
      const allKeys = Object.keys(localStorage);
      const appKeys = allKeys.filter(key => 
        key.startsWith('backPainApp') || 
        key.startsWith('bpm_') ||
        key.includes('pain') ||
        key.includes('medication') ||
        key.includes('exercise')
      );

      appKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Dispatch event for other components to react
      window.dispatchEvent(new CustomEvent('localStorage-cleared', {
        detail: { clearedKeys: appKeys.filter(k => !keysToKeep.includes(k)) }
      }));

      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }, []);

  return clearStorage;
};