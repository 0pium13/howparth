// Configuration for AI Community Scraper
module.exports = {
  // Target subreddits for AI content
  subreddits: [
    'PromptEngineering',
    'ChatGPT', 
    'OpenAI',
    'StableDiffusion',
    'MachineLearning',
    'artificial',
    'LocalLLaMA',
    'MachineLearning',
    'deeplearning',
    'compsci'
  ],

  // Scraping intervals (in minutes)
  intervals: {
    posts: 360, // 6 hours
    comments: 180, // 3 hours
    trending: 60, // 1 hour
    hot: 30 // 30 minutes
  },

  // Rate limiting and delays
  rateLimit: {
    minDelay: 2000, // 2 seconds
    maxDelay: 8000, // 8 seconds
    maxRequestsPerMinute: 30,
    maxConcurrentRequests: 3
  },

  // User agents for rotation
  userAgents: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
  ],

  // Free proxy sources (rotated)
  proxySources: [
    'https://www.proxy-list.download/api/v1/get?type=http',
    'https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
    'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt'
  ],

  // Database configuration
  database: {
    path: './data/scraped_data.db',
    tables: {
      posts: 'reddit_posts',
      comments: 'reddit_comments', 
      trends: 'trending_topics',
      analytics: 'scraping_analytics'
    }
  },

  // Data extraction settings
  extraction: {
    maxPostsPerSubreddit: 100,
    maxCommentsPerPost: 50,
    includeDeleted: false,
    includeRemoved: false,
    minUpvotes: 5, // Minimum upvotes to include
    timeRange: 'week' // day, week, month, year, all
  },

  // Anti-detection measures
  antiDetection: {
    randomizeViewport: true,
    disableImages: true,
    disableCSS: true,
    disableJavaScript: false, // Reddit needs JS
    stealthMode: true,
    fingerprintRotation: true
  },

  // Logging configuration
  logging: {
    level: 'info',
    file: './logs/scraper.log',
    maxSize: '10MB',
    maxFiles: 5
  },

  // Dashboard configuration
  dashboard: {
    port: 3003,
    updateInterval: 5000, // 5 seconds
    maxHistoryDays: 30
  }
};
