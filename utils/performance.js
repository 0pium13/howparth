/**
 * Performance Monitoring Utilities
 * Web Vitals and performance tracking
 */

// Preload critical routes for better performance
export const preloadRoutes = () => {
  // Preload critical routes
  import('./pages/Chat');
  import('./pages/Admin');
  import('./pages/CommunityHub');
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    // Preload routes when idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadRoutes);
    } else {
      setTimeout(preloadRoutes, 2000);
    }

    // Track page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
          gtag('event', 'page_load_time', {
            value: Math.round(loadTime),
            event_category: 'Performance',
            non_interaction: true,
          });
        }
      }
    });
  }
};

// Track custom performance metrics
export const trackPerformance = (name, startTime, endTime) => {
  const duration = endTime - startTime;
  
  if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
    gtag('event', 'custom_performance', {
      event_category: 'Performance',
      event_label: name,
      value: Math.round(duration),
      non_interaction: true,
    });
  }
  
  console.log(`${name}: ${duration}ms`);
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
  }
  return null;
};

// Network performance monitoring
export const trackNetworkPerformance = (url, startTime, endTime) => {
  const duration = endTime - startTime;
  
  if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
    gtag('event', 'network_request', {
      event_category: 'Performance',
      event_label: url,
      value: Math.round(duration),
      non_interaction: true,
    });
  }
};

// Initialize performance monitoring on app start
if (typeof window !== 'undefined') {
  initPerformanceMonitoring();
}
