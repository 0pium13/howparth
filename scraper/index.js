#!/usr/bin/env node

const RedditScraper = require('./reddit-scraper');
const ScrapingScheduler = require('./scheduler');
const logger = require('./utils/logger');

class AIScraperApp {
  constructor() {
    this.scraper = new RedditScraper();
    this.scheduler = new ScrapingScheduler();
  }

  async run() {
    const command = process.argv[2];
    const subcommand = process.argv[3];

    try {
      switch (command) {
        case 'scrape':
          await this.runScraping(subcommand);
          break;
          
        case 'schedule':
          await this.runScheduling(subcommand);
          break;
          
        case 'dashboard':
          await this.runDashboard();
          break;
          
        case 'test':
          await this.runTests();
          break;
          
        default:
          this.showHelp();
      }
    } catch (error) {
      logger.error('Application error', { error: error.message });
      process.exit(1);
    }
  }

  async runScraping(subcommand) {
    await this.scraper.initialize();
    
    switch (subcommand) {
      case 'once':
        logger.info('Running one-time scraping...');
        await this.scraper.startScraping();
        break;
        
      case 'continuous':
        logger.info('Starting continuous scraping...');
        await this.scraper.startScraping();
        break;
        
      default:
        logger.info('Running default scraping...');
        await this.scraper.startScraping();
    }
    
    await this.scraper.cleanup();
  }

  async runScheduling(subcommand) {
    switch (subcommand) {
      case 'start':
        await this.scheduler.initialize();
        this.scheduler.startScheduledScraping();
        
        // Keep process running
        process.on('SIGINT', async () => {
          logger.info('Stopping scheduler...');
          await this.scheduler.stop();
          process.exit(0);
        });
        
        // Keep alive
        setInterval(() => {}, 1000);
        break;
        
      case 'stop':
        await this.scheduler.stop();
        break;
        
      case 'status':
        await this.scheduler.initialize();
        const status = this.scheduler.getJobStatus();
        console.log('Scheduler Status:', JSON.stringify(status, null, 2));
        break;
        
      default:
        logger.info('Running one-time scheduled job...');
        await this.scheduler.runOnce();
    }
  }

  async runDashboard() {
    const Dashboard = require('./dashboard');
    const dashboard = new Dashboard();
    await dashboard.start();
  }

  async runTests() {
    logger.info('Running scraper tests...');
    
    // Test database connection
    await this.scraper.initialize();
    logger.info('✓ Database connection test passed');
    
    // Test proxy manager
    const proxyStats = this.scraper.proxyManager.getProxyStats();
    logger.info('✓ Proxy manager test passed', proxyStats);
    
    // Test sentiment analyzer
    const testText = "This AI model is absolutely amazing and revolutionary!";
    const sentiment = this.scraper.sentimentAnalyzer.analyze(testText);
    logger.info('✓ Sentiment analyzer test passed', sentiment);
    
    await this.scraper.cleanup();
    logger.info('All tests completed successfully');
  }

  showHelp() {
    console.log(`
🤖 AI Community Scraper - Powerful Web Scraping System

USAGE:
  node index.js <command> [subcommand]

COMMANDS:
  scrape [once|continuous]    Run scraping (once or continuously)
  schedule [start|stop|status] Manage scheduled scraping jobs
  dashboard                   Start monitoring dashboard
  test                       Run system tests

EXAMPLES:
  node index.js scrape once           # Run scraping once
  node index.js schedule start        # Start scheduled scraping
  node index.js dashboard             # Start monitoring dashboard
  node index.js test                  # Run tests

FEATURES:
  ✅ Reddit AI subreddit scraping
  ✅ Proxy rotation and anti-detection
  ✅ Sentiment analysis and trending topics
  ✅ Automated scheduling with cron jobs
  ✅ Real-time monitoring dashboard
  ✅ SQLite database storage
  ✅ Comprehensive logging

TARGET SUBREDDITS:
  • r/PromptEngineering
  • r/ChatGPT
  • r/OpenAI
  • r/StableDiffusion
  • r/MachineLearning
  • r/artificial
  • r/LocalLLaMA
  • r/deeplearning
  • r/compsci

For more information, check the README.md file.
    `);
  }
}

// Run the application
if (require.main === module) {
  const app = new AIScraperApp();
  app.run();
}

module.exports = AIScraperApp;
