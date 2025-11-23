import { useEffect, useRef } from 'react';
import { useStudioStore } from './useStudioStore';

const MIN_PIXELS_PER_SECOND = 5;
const MAX_PIXELS_PER_SECOND = 800;
const VIEWPORT_WIDTH = 800;

export const useScrollZoom = (elementRef?: React.RefObject<any>) => {
  const { pixelsPerSecond, setPixelsPerSecond, setViewportDuration, songLoaded } = useStudioStore();
  const isHovering = useRef(false);

  const handleWheelZoom = (event: WheelEvent) => {
    if (!isHovering.current) return;
    event.preventDefault();
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newPixelsPerSecond = Math.max(MIN_PIXELS_PER_SECOND, 
      Math.min(MAX_PIXELS_PER_SECOND, pixelsPerSecond * zoomFactor));
    const newDuration = (VIEWPORT_WIDTH / newPixelsPerSecond) * 1000;
    
    setPixelsPerSecond(newPixelsPerSecond);
    setViewportDuration(newDuration);
  };

  useEffect(() => {
    if (elementRef?.current) {
      const element = elementRef.current;
      
      const handleMouseEnter = () => { isHovering.current = true; };
      const handleMouseLeave = () => { isHovering.current = false; };
      
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('wheel', handleWheelZoom, { passive: false });
      
      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('wheel', handleWheelZoom);
      };
    }
  }, [elementRef, pixelsPerSecond, handleWheelZoom, songLoaded]);

  return { handleWheelZoom };
};