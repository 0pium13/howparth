// Performance optimization utilities

// Throttled scroll listener
let ticking = false;

export function throttledScroll(callback: () => void): (event: Event) => void {
  return (event: Event) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
}

// Intersection Observer for better performance
export const observerOptions = {
  threshold: [0.1, 0.5, 0.9],
  rootMargin: '50px'
};

export function createIntersectionObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
  return new IntersectionObserver(callback, observerOptions);
}

// Debounced function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
}

// GPU acceleration helper
export function enableGPUAcceleration(element: HTMLElement) {
  element.style.willChange = 'transform';
  element.style.transform = 'translateZ(0)';
}

// Memory cleanup
export function cleanupEventListeners(element: HTMLElement, eventType: string, handler: EventListener) {
  element.removeEventListener(eventType, handler);
}

// Reduced motion check
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Optimized scroll handler for solar background
export function createSolarScrollHandler(): (event: Event) => void {
  return throttledScroll(() => {
    const scrollPercent = Math.min(window.scrollY / 500, 1);
    const solar = document.querySelector('.solar-background') as HTMLElement;
    
    if (solar) {
      solar.style.opacity = (scrollPercent * 0.6).toString();
      solar.style.transform = `translateX(-50%) translateY(${20 - scrollPercent * 30}vh)`;
    }
  });
}
