#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const Database = require('./utils/database');
const logger = require('./utils/logger');

async function setup() {
  console.log('🚀 Setting up AI Community Scraper...\n');
  
  try {
    // Create necessary directories
    console.log('📁 Creating directories...');
    await fs.ensureDir('./data');
    await fs.ensureDir('./logs');
    await fs.ensureDir('./public');
    console.log('✅ Directories created\n');
    
    // Initialize database
    console.log('🗄️  Initializing database...');
    const db = new Database();
    await db.init();
    console.log('✅ Database initialized\n');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    const testResult = await db.get('SELECT 1 as test');
    if (testResult && testResult.test === 1) {
      console.log('✅ Database connection successful\n');
    } else {
      throw new Error('Database test failed');
    }
    
    // Create sample data
    console.log('📊 Creating sample data...');
    await db.run(`
      INSERT OR IGNORE INTO reddit_posts 
      (post_id, subreddit, title, content, author, upvotes, score, created_utc, sentiment_score, sentiment_label)
      VALUES 
      ('sample1', 'ChatGPT', 'Sample AI Post', 'This is a sample post for testing', 'testuser', 100, 95, ${Math.floor(Date.now() / 1000)}, 0.8, 'positive'),
      ('sample2', 'OpenAI', 'Another Sample', 'Another sample post for testing', 'testuser2', 50, 45, ${Math.floor(Date.now() / 1000)}, 0.2, 'positive')
    `);
    console.log('✅ Sample data created\n');
    
    // Test sentiment analyzer
    console.log('🧠 Testing sentiment analyzer...');
    const SentimentAnalyzer = require('./utils/sentiment');
    const sentiment = new SentimentAnalyzer();
    const testSentiment = sentiment.analyze("This AI model is absolutely amazing!");
    console.log(`✅ Sentiment test: ${testSentiment.label} (${testSentiment.score})\n`);
    
    // Test proxy manager
    console.log('🌐 Testing proxy manager...');
    const ProxyManager = require('./utils/proxy-manager');
    const proxyManager = new ProxyManager();
    await proxyManager.initialize();
    const proxyStats = proxyManager.getProxyStats();
    console.log(`✅ Proxy manager: ${proxyStats.total} proxies loaded\n`);
    
    // Create configuration check
    console.log('⚙️  Checking configuration...');
    const config = require('./config');
    console.log(`✅ Target subreddits: ${config.subreddits.length}`);
    console.log(`✅ Scraping intervals: ${Object.keys(config.intervals).length} configured`);
    console.log(`✅ Dashboard port: ${config.dashboard.port}\n`);
    
    // Create startup script
    console.log('📝 Creating startup scripts...');
    const startupScript = `#!/bin/bash
echo "🤖 Starting AI Community Scraper..."
echo "📊 Dashboard: http://localhost:${config.dashboard.port}"
echo "📈 Monitoring: Real-time updates enabled"
echo ""
node index.js schedule start
`;
    
    await fs.writeFile('./start.sh', startupScript);
    await fs.chmod('./start.sh', '755');
    console.log('✅ Startup script created\n');
    
    // Final setup summary
    console.log('🎉 Setup completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Run: npm run scrape (test scraping)');
    console.log('   2. Run: npm run dashboard (start monitoring)');
    console.log('   3. Run: npm run schedule (start automation)');
    console.log('   4. Visit: http://localhost:3003 (dashboard)');
    console.log('\n🚀 Ready to scrape AI community insights!');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    logger.error('Setup failed', { error: error.message });
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setup();
}

module.exports = setup;
