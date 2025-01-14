import {useEffect, useState} from 'react';

export default function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.visualViewport?.height || window.innerHeight);
    };

    updateViewportHeight();

    window.visualViewport?.addEventListener('resize', updateViewportHeight);
    return () => window.visualViewport?.removeEventListener('resize', updateViewportHeight);
  }, []);

  return viewportHeight;
};

