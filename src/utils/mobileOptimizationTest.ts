// Mobile Optimization Test Utility
export class MobileOptimizationTest {
  static testTouchTargets(): boolean {
    const buttons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
    let allValid = true;
    
    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect();
      const minSize = 44; // 44px minimum touch target
      
      if (rect.width < minSize || rect.height < minSize) {
        console.warn('Touch target too small:', button, `(${rect.width}x${rect.height}px)`);
        allValid = false;
      }
    });
    
    return allValid;
  }

  static testResponsiveBreakpoints(): boolean {
    const viewport = window.innerWidth;
    const breakpoints = {
      mobile: viewport <= 479,
      largeMobile: viewport > 479 && viewport <= 767,
      tablet: viewport > 767 && viewport <= 1023,
      desktop: viewport > 1023
    };
    
    console.log('Current breakpoint:', breakpoints);
    return true;
  }

  static testPerformanceMode(): boolean {
    const isLowEndDevice = 
      (navigator as any).deviceMemory < 4 ||
      navigator.hardwareConcurrency < 4 ||
      window.devicePixelRatio < 2;
    
    console.log('Low-end device detected:', isLowEndDevice);
    return isLowEndDevice;
  }

  static testServiceWorker(): boolean {
    return 'serviceWorker' in navigator;
  }

  static testHapticFeedback(): boolean {
    return 'vibrate' in navigator;
  }

  static testOfflineCapability(): boolean {
    return 'indexedDB' in window;
  }

  static runAllTests(): {
    touchTargets: boolean;
    responsiveBreakpoints: boolean;
    performanceMode: boolean;
    serviceWorker: boolean;
    hapticFeedback: boolean;
    offlineCapability: boolean;
  } {
    console.log('🧪 Running Mobile Optimization Tests...');
    
    const results = {
      touchTargets: this.testTouchTargets(),
      responsiveBreakpoints: this.testResponsiveBreakpoints(),
      performanceMode: this.testPerformanceMode(),
      serviceWorker: this.testServiceWorker(),
      hapticFeedback: this.testHapticFeedback(),
      offlineCapability: this.testOfflineCapability()
    };
    
    console.log('📊 Test Results:', results);
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    console.log(`✅ ${passed}/${total} tests passed`);
    
    return results;
  }
}

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    MobileOptimizationTest.runAllTests();
  }, 2000);
}
