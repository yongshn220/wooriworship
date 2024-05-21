import { useEffect, useRef } from 'react';

export function useKeyboardVisibility(inputRefs: Array<any>) {
  useEffect(() => {
    const handleFocus = (e: any) => {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300); // Delay to ensure keyboard is fully up
    };

    inputRefs.forEach(inputRef => {
      const input = inputRef.current;
      if (input) {
        input.addEventListener('focus', handleFocus);
      }
    });

    return () => {
      inputRefs.forEach(inputRef => {
        const input = inputRef.current;
        if (input) {
          input.removeEventListener('focus', handleFocus);
        }
      });
    };
  }, [inputRefs]);
}
