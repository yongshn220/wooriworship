import { useState } from 'react';


export default function useLocalStorage<T>(key: string, initialValue: T): [T,  (value: (((prevState: T) => T) | T)) => void] {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        return initialValue;
      }
      
      return JSON.parse(item)
    }
    catch (error) {
      console.error(error);
      return initialValue;
    }
  })

  function setValue(value: any) {
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

