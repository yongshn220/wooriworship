import { useState } from 'react';


export default function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T) => void ] {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    }
    catch (error) {
      console.error(error);
      return initialValue;
    }
  })

  function setValue(value) {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  return [storedValue, setValue];
}

