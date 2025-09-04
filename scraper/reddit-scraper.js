const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');
const Database = require('./utils/database');
const SentimentAnalyzer = require('./utils/sentiment');
const ProxyManager = require('./utils/proxy-manager');
const logger = require('./utils/logger');
const config = require('./config');

class RedditScraper {
  constructor() {
    this.database = new Database();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.proxyManager = new ProxyManager();
    this.browser = null;
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.isRunning = false;
  }

  async initialize() {
    try {
      await this.proxyManager.initialize();
      await this.database.init();
      logger.info('Reddit scraper initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Reddit scraper', { error: error.message });
      throw error;
    }
  }

  async startScraping() {
    if (this.isRunning) {
      logger.warn('Scraper is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting Reddit scraping process');

    try {
      await this.launchBrowser();
      
      for (const subreddit of config.subreddits) {
        if (!this.isRunning) break;
        
        await this.scrapeSubreddit(subreddit);
        await this.randomDelay();
      }

      await this.analyzeTrends();
      await this.generateAnalytics();
      
    } catch (error) {
      logger.error('Scraping process failed', { error: error.message });
    } finally {
      await this.cleanup();
      this.isRunning = false;
    }
  }

  async launchBrowser() {
    const proxy = this.proxyManager.getNextProxy();
    const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
    
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    };

    if (proxy) {
      launchOptions.args.push(`--proxy-server=http://${proxy.host}:${proxy.port}`);
    }

    this.browser = await puppeteer.launch(launchOptions);
    
    // Set user agent
    const page = await this.browser.newPage();
    await page.setUserAgent(userAgent);
    
    // Set viewport
    await page.setViewport({
      width: 1366 + Math.floor(Math.random() * 100),
      height: 768 + Math.floor(Math.random() * 100)
    });

    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.close();
    logger.info('Browser launched successfully', { proxy: proxy ? `${proxy.host}:${proxy.port}` : 'none' });
  }

  async scrapeSubreddit(subreddit) {
    logger.scraping(`Starting to scrape r/${subreddit}`);
    
    try {
      const page = await this.browser.newPage();
      
      // Set random user agent for this page
      const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
      await page.setUserAgent(userAgent);
      
      // Navigate to subreddit
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${config.extraction.maxPostsPerSubreddit}`;
      await this.navigateWithRetry(page, url);
      
      // Extract posts data
      const postsData = await this.extractPostsData(page, subreddit);
      
      // Process and save posts
      for (const postData of postsData) {
        await this.processPost(postData, subreddit);
        await this.randomDelay();
      }
      
      await page.close();
      logger.scraping(`Completed scraping r/${subreddit}`, { posts: postsData.length });
      
    } catch (error) {
      logger.error(`Failed to scrape r/${subreddit}`, { error: error.message });
    }
  }

  async navigateWithRetry(page, url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.enforceRateLimit();
        
        const response = await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        
        if (response.status() === 200) {
          return response;
        } else {
          throw new Error(`HTTP ${response.status()}`);
        }
        
      } catch (error) {
        logger.warn(`Navigation attempt ${attempt} failed`, { url, error: error.message });
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        await this.randomDelay(5000, 10000); // Longer delay on retry
      }
    }
  }

  async extractPostsData(page, subreddit) {
    try {
      const postsData = await page.evaluate((subreddit) => {
        const posts = [];
        
        // Try to parse JSON response
        try {
          const data = JSON.parse(document.body.textContent);
          if (data.data && data.data.children) {
            data.data.children.forEach(child => {
              const post = child.data;
              if (post && post.id) {
                posts.push({
                  id: post.id,
                  title: post.title || '',
                  content: post.selftext || '',
                  author: post.author || 'deleted',
                  upvotes: post.ups || 0,
                  downvotes: post.downs || 0,
                  score: post.score || 0,
                  comments_count: post.num_comments || 0,
                  url: post.url || '',
                  permalink: post.permalink || '',
                  created_utc: post.created_utc || 0,
                  is_hot: post.ups > 100,
                  subreddit: subreddit
                });
              }
            });
          }
        } catch (e) {
          console.error('Failed to parse JSON:', e);
        }
        
        return posts;
      }, subreddit);
      
      return postsData;
      
    } catch (error) {
      logger.error('Failed to extract posts data', { error: error.message });
      return [];
    }
  }

  async processPost(postData, subreddit) {
    try {
      // Analyze sentiment
      const sentiment = this.sentimentAnalyzer.analyze(
        `${postData.title} ${postData.content}`
      );
      
      // Extract tags
      const tags = this.extractTags(postData.title, postData.content);
      
      // Determine if trending
      const isTrending = this.isTrendingPost(postData);
      
      // Prepare data for database
      const processedPost = {
        ...postData,
        sentiment_score: sentiment.score,
        sentiment_label: sentiment.label,
        tags: tags.join(','),
        is_trending: isTrending
      };
      
      // Save to database
      await this.database.upsertPost(processedPost);
      
      // Scrape comments if post is interesting
      if (postData.comments_count > 0 && (postData.score > 10 || isTrending)) {
        await this.scrapeComments(postData.id, subreddit);
      }
      
      logger.scraping(`Processed post: ${postData.title.substring(0, 50)}...`, {
        score: postData.score,
        sentiment: sentiment.label,
        comments: postData.comments_count
      });
      
    } catch (error) {
      logger.error('Failed to process post', { error: error.message, postId: postData.id });
    }
  }

  async scrapeComments(postId, subreddit) {
    try {
      const page = await this.browser.newPage();
      const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;
      
      await this.navigateWithRetry(page, url);
      
      const commentsData = await page.evaluate(() => {
        const comments = [];
        
        try {
          const data = JSON.parse(document.body.textContent);
          if (data[1] && data[1].data && data[1].data.children) {
            data[1].data.children.forEach(child => {
              const comment = child.data;
              if (comment && comment.id && comment.body) {
                comments.push({
                  id: comment.id,
                  post_id: postId,
                  parent_id: comment.parent_id,
                  author: comment.author || 'deleted',
                  content: comment.body,
                  upvotes: comment.ups || 0,
                  downvotes: comment.downs || 0,
                  score: comment.score || 0,
                  created_utc: comment.created_utc || 0,
                  depth: comment.depth || 0
                });
              }
            });
          }
        } catch (e) {
          console.error('Failed to parse comments JSON:', e);
        }
        
        return comments;
      });
      
      // Process and save comments
      for (const commentData of commentsData.slice(0, config.extraction.maxCommentsPerPost)) {
        const sentiment = this.sentimentAnalyzer.analyze(commentData.content);
        
        const processedComment = {
          ...commentData,
          sentiment_score: sentiment.score,
          sentiment_label: sentiment.label
        };
        
        await this.database.insertComment(processedComment);
      }
      
      await page.close();
      logger.scraping(`Scraped ${commentsData.length} comments for post ${postId}`);
      
    } catch (error) {
      logger.error('Failed to scrape comments', { error: error.message, postId });
    }
  }

  extractTags(title, content) {
    const text = `${title} ${content}`.toLowerCase();
    const tags = [];
    
    const tagKeywords = {
      'prompt-engineering': ['prompt', 'prompting', 'prompt engineering'],
      'chatgpt': ['chatgpt', 'gpt', 'openai'],
      'stable-diffusion': ['stable diffusion', 'midjourney', 'dalle'],
      'machine-learning': ['machine learning', 'ml', 'neural network'],
      'ai-art': ['ai art', 'generated art', 'digital art'],
      'coding': ['code', 'programming', 'python', 'javascript'],
      'tutorial': ['tutorial', 'guide', 'how to', 'step by step'],
      'discussion': ['discussion', 'opinion', 'thoughts', 'what do you think']
    };
    
    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag);
      }
    });
    
    return tags;
  }

  isTrendingPost(postData) {
    // Simple trending logic - can be enhanced
    const scoreThreshold = 50;
    const commentsThreshold = 10;
    const ageHours = (Date.now() / 1000 - postData.created_utc) / 3600;
    
    return (
      postData.score > scoreThreshold &&
      postData.comments_count > commentsThreshold &&
      ageHours < 24
    );
  }

  async analyzeTrends() {
    logger.info('Analyzing trends...');
    
    try {
      // Get recent posts
      const recentPosts = await this.database.all(`
        SELECT * FROM reddit_posts 
        WHERE scraped_at > datetime('now', '-24 hours')
        ORDER BY score DESC
      `);
      
      // Analyze trending topics
      const topicCounts = {};
      recentPosts.forEach(post => {
        if (post.tags) {
          post.tags.split(',').forEach(tag => {
            if (tag.trim()) {
              topicCounts[tag.trim()] = (topicCounts[tag.trim()] || 0) + 1;
            }
          });
        }
      });
      
      // Update trending topics
      for (const [topic, count] of Object.entries(topicCounts)) {
        if (count > 5) { // Only topics mentioned 5+ times
          await this.database.run(`
            INSERT OR REPLACE INTO trending_topics 
            (topic, subreddit, mentions, trend_score, last_updated)
            VALUES (?, 'all', ?, ?, datetime('now'))
          `, [topic, count, count * 0.1]);
        }
      }
      
      logger.info('Trend analysis completed', { topics: Object.keys(topicCounts).length });
      
    } catch (error) {
      logger.error('Failed to analyze trends', { error: error.message });
    }
  }

  async generateAnalytics() {
    logger.info('Generating analytics...');
    
    try {
      const analytics = await this.database.getAnalytics(24);
      
      // Save analytics
      for (const analytic of analytics) {
        await this.database.run(`
          INSERT INTO scraping_analytics 
          (subreddit, posts_scraped, comments_scraped, success_rate, avg_response_time)
          VALUES (?, ?, ?, ?, ?)
        `, [
          analytic.subreddit,
          analytic.total_posts,
          analytic.total_comments,
          analytic.avg_success_rate,
          analytic.avg_response_time
        ]);
      }
      
      logger.info('Analytics generated successfully');
      
    } catch (error) {
      logger.error('Failed to generate analytics', { error: error.message });
    }
  }

  enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minDelay = config.rateLimit.minDelay;
    
    if (timeSinceLastRequest < minDelay) {
      const delay = minDelay - timeSinceLastRequest;
      return new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = now;
    this.requestCount++;
  }

  async randomDelay(min = null, max = null) {
    const minDelay = min || config.rateLimit.minDelay;
    const maxDelay = max || config.rateLimit.maxDelay;
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async stop() {
    logger.info('Stopping scraper...');
    this.isRunning = false;
    await this.cleanup();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    if (this.database) {
      this.database.close();
    }
    
    logger.info('Scraper cleanup completed');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      requestCount: this.requestCount,
      proxyStats: this.proxyManager.getProxyStats(),
      lastRequestTime: this.lastRequestTime
    };
  }
}

module.exports = RedditScraper;
