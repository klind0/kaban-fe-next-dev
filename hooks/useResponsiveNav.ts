import { useState, useEffect } from "react";

type MediaSize = 'mobile' | 'desktop';

interface ResponsiveNavProps {
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function useResponsiveNav({ onClick, onMouseEnter, onMouseLeave }: ResponsiveNavProps = {}) {
  // Start as null or undefined to avoid server vs client layout mismatches
  const [mediasize, setmediaSize] = useState<MediaSize>('desktop');

  useEffect(() => {
    // This code only runs inside the browser context, safe from SSR crashes
    function handleResize() {
      setmediaSize(window.innerWidth <= 768 ? 'mobile' : 'desktop');
    }
    
    handleResize(); // Initialize size immediately on mount
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Safe callback return matching the structural execution requirements
  if (mediasize === 'mobile') {
    return { onClick, mediasize };
  }
  
  return { onMouseEnter, onMouseLeave, mediasize };
}