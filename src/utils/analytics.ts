// Analytics utility for tracking user behavior and performance

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

class Analytics {
  private isInitialized = false;

  // Initialize analytics (Google Analytics, etc.)
  init() {
    if (this.isInitialized) return;
    
    // Add Google Analytics 4 tracking code here
    // For now, we'll use console logging for development
    console.log('Analytics initialized');
    this.isInitialized = true;
  }

  // Track page views
  trackPageView(page: string) {
    console.log('Page view:', page);
    // Add actual analytics tracking here
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    console.log('Event tracked:', event);
    // Add actual analytics tracking here
  }

  // Track user interactions
  trackInteraction(element: string, action: string) {
    this.trackEvent({
      category: 'User Interaction',
      action,
      label: element
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number) {
    this.trackEvent({
      category: 'Performance',
      action: metric,
      value
    });
  }

  // Track form submissions
  trackFormSubmission(formName: string) {
    this.trackEvent({
      category: 'Form',
      action: 'Submit',
      label: formName
    });
  }

  // Track button clicks
  trackButtonClick(buttonName: string) {
    this.trackEvent({
      category: 'Button',
      action: 'Click',
      label: buttonName
    });
  }

  // Track emoji interactions
  trackEmojiInteraction(emoji: string, action: string) {
    this.trackEvent({
      category: 'Emoji',
      action,
      label: emoji
    });
  }

  // Track scroll depth
  trackScrollDepth(depth: number) {
    this.trackEvent({
      category: 'Engagement',
      action: 'Scroll Depth',
      value: depth
    });
  }

  // Track time on page
  trackTimeOnPage(page: string, timeInSeconds: number) {
    this.trackEvent({
      category: 'Engagement',
      action: 'Time on Page',
      label: page,
      value: timeInSeconds
    });
  }
}

// Create singleton instance
const analytics = new Analytics();

// Initialize on app load
if (typeof window !== 'undefined') {
  analytics.init();
}

export default analytics;
