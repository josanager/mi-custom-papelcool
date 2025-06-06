import { useState, useEffect } from 'react';

export function useViewport() {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      function handleResize() {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const { width, height } = dimensions;
  const isPortrait = height > width;
  const isMobile = width <= 600;
  const isPortraitMobile = isPortrait && isMobile;

  return { width, height, isPortrait, isPortraitMobile };
}
