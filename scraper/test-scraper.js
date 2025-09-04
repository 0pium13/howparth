#!/usr/bin/env node

const RedditScraper = require('./reddit-scraper');
const logger = require('./utils/logger');

async function runTests() {
  console.log('🧪 Running AI Community Scraper Tests...\n');
  
  const scraper = new RedditScraper();
  let testsPassed = 0;
  let testsTotal = 0;
  
  function test(name, testFn) {
    testsTotal++;
    try {
      testFn();
      console.log(`✅ ${name}`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }
  
  async function asyncTest(name, testFn) {
    testsTotal++;
    try {
      await testFn();
      console.log(`✅ ${name}`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }
  
  // Test 1: Configuration loading
  test('Configuration loads correctly', () => {
    const config = require('./config');
    if (!config.subreddits || config.subreddits.length === 0) {
      throw new Error('No subreddits configured');
    }
    if (!config.rateLimit || !config.rateLimit.minDelay) {
      throw new Error('Rate limiting not configured');
    }
  });
  
  // Test 2: Database initialization
  await asyncTest('Database initializes', async () => {
    await scraper.database.init();
    const result = await scraper.database.get('SELECT 1 as test');
    if (!result || result.test !== 1) {
      throw new Error('Database test query failed');
    }
  });
  
  // Test 3: Sentiment analyzer
  test('Sentiment analyzer works', () => {
    const sentiment = scraper.sentimentAnalyzer.analyze("This AI is amazing!");
    if (!sentiment || typeof sentiment.score !== 'number') {
      throw new Error('Sentiment analysis failed');
    }
    if (sentiment.score <= 0) {
      throw new Error('Positive sentiment not detected');
    }
  });
  
  // Test 4: Proxy manager
  await asyncTest('Proxy manager initializes', async () => {
    await scraper.proxyManager.initialize();
    const stats = scraper.proxyManager.getProxyStats();
    if (typeof stats.total !== 'number') {
      throw new Error('Proxy stats not available');
    }
  });
  
  // Test 5: Tag extraction
  test('Tag extraction works', () => {
    const tags = scraper.extractTags("ChatGPT prompt engineering tutorial", "Learn how to use ChatGPT for better prompts");
    if (!tags.includes('chatgpt') || !tags.includes('prompt-engineering')) {
      throw new Error('Tag extraction failed');
    }
  });
  
  // Test 6: Trending detection
  test('Trending detection works', () => {
    const postData = {
      score: 100,
      comments_count: 20,
      created_utc: Date.now() / 1000 - 3600 // 1 hour ago
    };
    const isTrending = scraper.isTrendingPost(postData);
    if (!isTrending) {
      throw new Error('Trending post not detected');
    }
  });
  
  // Test 7: Rate limiting
  test('Rate limiting enforces delays', async () => {
    const start = Date.now();
    await scraper.enforceRateLimit();
    const elapsed = Date.now() - start;
    if (elapsed < 100) { // Should have some delay
      throw new Error('Rate limiting not working');
    }
  });
  
  // Test 8: Data processing
  test('Data processing pipeline', () => {
    const testPost = {
      id: 'test123',
      title: 'Amazing AI breakthrough',
      content: 'This is incredible technology',
      author: 'testuser',
      upvotes: 50,
      score: 45,
      subreddit: 'test'
    };
    
    const processed = scraper.processPost(testPost, 'test');
    if (!processed) {
      throw new Error('Post processing failed');
    }
  });
  
  // Test 9: Error handling
  test('Error handling works', () => {
    try {
      scraper.sentimentAnalyzer.analyze(null);
      // Should not throw, but return neutral sentiment
    } catch (error) {
      throw new Error('Error handling failed');
    }
  });
  
  // Test 10: Configuration validation
  test('Configuration validation', () => {
    const config = require('./config');
    
    // Check required fields
    const required = ['subreddits', 'rateLimit', 'intervals', 'userAgents'];
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required config field: ${field}`);
      }
    }
    
    // Check subreddits
    if (config.subreddits.length < 5) {
      throw new Error('Too few subreddits configured');
    }
    
    // Check rate limits
    if (config.rateLimit.minDelay >= config.rateLimit.maxDelay) {
      throw new Error('Invalid rate limit configuration');
    }
  });
  
  // Cleanup
  await scraper.cleanup();
  
  // Results
  console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests passed! Scraper is ready to use.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration.');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = runTests;
