import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });
  
  const startTimeRef = useRef<number>(0);
  
  // Mark render start
  startTimeRef.current = performance.now();
  
  useEffect(() => {
    // Mark render end
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    const metrics = metricsRef.current;
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.averageRenderTime = 
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;
    
    // Log performance warnings for slow renders (> 16ms for 60fps)
    if (renderTime > 16) {
      console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
    }
    
    // Log metrics every 100 renders in development
    if (__DEV__ && metrics.renderCount % 100 === 0) {
      console.log(`${componentName} Performance:`, {
        renders: metrics.renderCount,
        avgTime: metrics.averageRenderTime.toFixed(2) + 'ms',
        lastTime: metrics.lastRenderTime.toFixed(2) + 'ms',
      });
    }
  });
  
  return metricsRef.current;
};