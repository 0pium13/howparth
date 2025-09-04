const cron = require('node-cron');
const RedditScraper = require('./reddit-scraper');
const logger = require('./utils/logger');

class ScrapingScheduler {
  constructor() {
    this.scraper = new RedditScraper();
    this.jobs = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      await this.scraper.initialize();
      this.isInitialized = true;
      logger.info('Scraping scheduler initialized');
    } catch (error) {
      logger.error('Failed to initialize scheduler', { error: error.message });
      throw error;
    }
  }

  startScheduledScraping() {
    if (!this.isInitialized) {
      throw new Error('Scheduler not initialized');
    }

    // Schedule posts scraping every 6 hours
    const postsJob = cron.schedule('0 */6 * * *', async () => {
      logger.info('Starting scheduled posts scraping');
      try {
        await this.scraper.startScraping();
        logger.info('Scheduled posts scraping completed');
      } catch (error) {
        logger.error('Scheduled posts scraping failed', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Schedule comments scraping every 3 hours
    const commentsJob = cron.schedule('0 */3 * * *', async () => {
      logger.info('Starting scheduled comments scraping');
      try {
        // Focus on high-engagement posts for comments
        await this.scrapeHighEngagementComments();
        logger.info('Scheduled comments scraping completed');
      } catch (error) {
        logger.error('Scheduled comments scraping failed', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Schedule trending analysis every hour
    const trendingJob = cron.schedule('0 * * * *', async () => {
      logger.info('Starting trending analysis');
      try {
        await this.scraper.analyzeTrends();
        logger.info('Trending analysis completed');
      } catch (error) {
        logger.error('Trending analysis failed', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Schedule hot posts scraping every 30 minutes
    const hotJob = cron.schedule('*/30 * * * *', async () => {
      logger.info('Starting hot posts scraping');
      try {
        await this.scrapeHotPosts();
        logger.info('Hot posts scraping completed');
      } catch (error) {
        logger.error('Hot posts scraping failed', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Store job references
    this.jobs.set('posts', postsJob);
    this.jobs.set('comments', commentsJob);
    this.jobs.set('trending', trendingJob);
    this.jobs.set('hot', hotJob);

    // Start all jobs
    this.jobs.forEach((job, name) => {
      job.start();
      logger.info(`Started ${name} scraping job`);
    });

    logger.info('All scheduled scraping jobs started');
  }

  async scrapeHighEngagementComments() {
    // This would be a specialized method to scrape comments from high-engagement posts
    // For now, we'll use the regular scraping method
    await this.scraper.startScraping();
  }

  async scrapeHotPosts() {
    // This would be a specialized method to scrape only hot/trending posts
    // For now, we'll use the regular scraping method
    await this.scraper.startScraping();
  }

  stopScheduledScraping() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped ${name} scraping job`);
    });
    
    this.jobs.clear();
    logger.info('All scheduled scraping jobs stopped');
  }

  getJobStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        nextRun: job.nextDate ? job.nextDate().toISOString() : null
      };
    });
    return status;
  }

  async runOnce() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    logger.info('Running one-time scraping job');
    await this.scraper.startScraping();
  }

  async stop() {
    this.stopScheduledScraping();
    await this.scraper.stop();
    logger.info('Scheduler stopped');
  }
}

// CLI interface
if (require.main === module) {
  const scheduler = new ScrapingScheduler();
  
  const command = process.argv[2];
  
  async function main() {
    try {
      switch (command) {
        case 'start':
          await scheduler.initialize();
          scheduler.startScheduledScraping();
          logger.info('Scheduler started. Press Ctrl+C to stop.');
          
          // Keep the process running
          process.on('SIGINT', async () => {
            logger.info('Received SIGINT, stopping scheduler...');
            await scheduler.stop();
            process.exit(0);
          });
          break;
          
        case 'run-once':
          await scheduler.runOnce();
          break;
          
        case 'status':
          await scheduler.initialize();
          const status = scheduler.getJobStatus();
          console.log('Job Status:', JSON.stringify(status, null, 2));
          break;
          
        default:
          console.log('Usage: node scheduler.js [start|run-once|status]');
          process.exit(1);
      }
    } catch (error) {
      logger.error('Scheduler error', { error: error.message });
      process.exit(1);
    }
  }
  
  main();
}

module.exports = ScrapingScheduler;
