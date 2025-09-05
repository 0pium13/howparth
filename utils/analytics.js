/**
 * Analytics Integration
 * Google Analytics and custom event tracking
 */

// Google Analytics tracking
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
  
  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Analytics Event: ${action} - ${category} - ${label}`, value);
  }
};

export const trackPageView = (path) => {
  if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
    gtag('config', process.env.REACT_APP_GA_ID, {
      page_path: path,
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Page View: ${path}`);
  }
};

// Custom analytics events
export const trackChatMessage = (messageLength, responseTime) => {
  trackEvent('chat_message', 'User Interaction', 'Message Sent', messageLength);
  trackEvent('chat_response_time', 'Performance', 'Response Time', responseTime);
};

export const trackAdminAction = (action, details) => {
  trackEvent('admin_action', 'Admin', action, details);
};

export const trackCommunityInteraction = (action, postId) => {
  trackEvent('community_interaction', 'Community', action, postId);
};

export const trackContentGeneration = (contentType, wordCount) => {
  trackEvent('content_generation', 'AI Features', contentType, wordCount);
};

export const trackError = (errorType, errorMessage) => {
  trackEvent('error_occurred', 'Errors', errorType, 1);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`Analytics Error: ${errorType} - ${errorMessage}`);
  }
};

// Performance tracking
export const trackPerformance = (metric, value) => {
  trackEvent('performance_metric', 'Performance', metric, value);
};

// User engagement tracking
export const trackUserEngagement = (action, duration) => {
  trackEvent('user_engagement', 'Engagement', action, duration);
};

// Track route changes
export const trackRouteChange = (path) => {
  trackPageView(path);
};

// Initialize analytics
export const initAnalytics = () => {
  if (typeof window !== 'undefined' && process.env.REACT_APP_GA_ID) {
    // Google Analytics is already loaded via index.html
    trackPageView(window.location.pathname);
  }
};

// Default export
export default {
  trackEvent,
  trackPageView,
  trackChatMessage,
  trackAdminAction,
  trackCommunityInteraction,
  trackContentGeneration,
  trackError,
  trackPerformance,
  trackUserEngagement,
  initAnalytics,
  trackRouteChange
};

