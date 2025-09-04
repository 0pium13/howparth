# 🤖 AI Community Scraper

A powerful, free web scraping system that automatically collects AI community insights from Reddit with advanced anti-detection measures, sentiment analysis, and real-time monitoring.

## ✨ Features

### 🔥 Core Scraping Capabilities
- **Multi-Subreddit Targeting**: Scrapes 10+ AI-focused subreddits
- **Proxy Rotation**: Automatic proxy rotation with free proxy sources
- **Anti-Detection**: User agent rotation, random delays, stealth mode
- **Rate Limiting**: Intelligent rate limiting to avoid blocks
- **Error Handling**: Comprehensive retry logic and error recovery

### 📊 Data Processing
- **Sentiment Analysis**: AI-powered sentiment analysis with custom AI vocabulary
- **Trending Detection**: Automatic trending topic identification
- **Tag Extraction**: Smart tagging system for content categorization
- **Data Storage**: SQLite database with optimized indexing

### ⏰ Automation
- **Cron Scheduling**: Automated scraping every 6 hours
- **Background Processing**: Runs continuously without manual intervention
- **Smart Intervals**: Different scraping frequencies for different content types

### 📈 Monitoring & Analytics
- **Real-time Dashboard**: Live monitoring with WebSocket updates
- **Performance Metrics**: Success rates, response times, proxy statistics
- **Trend Analysis**: Historical trending data and insights
- **Export Capabilities**: JSON/CSV export for further analysis

## 🎯 Target Subreddits

- r/PromptEngineering
- r/ChatGPT
- r/OpenAI
- r/StableDiffusion
- r/MachineLearning
- r/artificial
- r/LocalLLaMA
- r/deeplearning
- r/compsci

## 🚀 Quick Start

### 1. Installation

```bash
# Navigate to scraper directory
cd scraper

# Install dependencies
npm install

# Initialize database
npm run setup
```

### 2. Run Scraping

```bash
# Run once
npm run scrape

# Start scheduled scraping
npm run schedule

# Start monitoring dashboard
npm run dashboard
```

### 3. Access Dashboard

Open your browser to `http://localhost:3003` to see the real-time monitoring dashboard.

## 📋 Commands

### Scraping Commands
```bash
# Run scraping once
node index.js scrape once

# Run continuous scraping
node index.js scrape continuous

# Start scheduled scraping (recommended)
node index.js schedule start

# Check scheduler status
node index.js schedule status
```

### Monitoring Commands
```bash
# Start dashboard
node index.js dashboard

# Run system tests
node index.js test
```

## 🏗️ Architecture

### Core Components

1. **RedditScraper**: Main scraping engine with Puppeteer
2. **ProxyManager**: Handles proxy rotation and validation
3. **SentimentAnalyzer**: AI-powered sentiment analysis
4. **Database**: SQLite storage with optimized queries
5. **Scheduler**: Cron-based automation system
6. **Dashboard**: Real-time monitoring interface

### Data Flow

```
Reddit API → Proxy Rotation → Anti-Detection → Data Extraction → 
Sentiment Analysis → Database Storage → Trend Analysis → Dashboard
```

## 📊 Database Schema

### Tables

- **reddit_posts**: Main posts data with sentiment and trending flags
- **reddit_comments**: Comments with sentiment analysis
- **trending_topics**: Extracted trending topics with scores
- **scraping_analytics**: Performance and success metrics

### Key Fields

- **Sentiment Analysis**: score, label, confidence, topics, emotions
- **Trending Detection**: is_trending, trend_score, mentions
- **Performance**: success_rate, response_time, proxy_used

## 🔧 Configuration

Edit `config.js` to customize:

- **Subreddits**: Add/remove target subreddits
- **Intervals**: Adjust scraping frequencies
- **Rate Limits**: Modify delays and request limits
- **Proxy Sources**: Add new proxy sources
- **Database**: Configure storage settings

## 🛡️ Anti-Detection Features

### Proxy Management
- **Free Proxy Sources**: Multiple free proxy providers
- **Automatic Rotation**: Smart proxy switching
- **Health Checking**: Proxy validation and failure handling
- **Geographic Distribution**: Global proxy coverage

### Browser Fingerprinting
- **User Agent Rotation**: Random desktop user agents
- **Viewport Randomization**: Variable screen sizes
- **Resource Blocking**: Images, CSS, fonts disabled
- **Stealth Mode**: Advanced Puppeteer stealth

### Rate Limiting
- **Random Delays**: 2-8 second delays between requests
- **Request Limits**: Max 30 requests per minute
- **Concurrent Control**: Max 3 concurrent requests
- **Backoff Strategy**: Exponential backoff on failures

## 📈 Monitoring Dashboard

### Real-time Metrics
- **Total Posts/Comments**: Live counters
- **Trending Topics**: Top 10 trending topics
- **Subreddit Activity**: 24-hour activity by subreddit
- **System Status**: Proxy health, success rates

### Historical Data
- **Trend Analysis**: Trending topics over time
- **Performance Metrics**: Success rates, response times
- **Error Tracking**: Failed requests and retry attempts
- **Proxy Statistics**: Working vs failed proxies

## 🔍 Data Export

### JSON Export
```bash
# Export all posts
node -e "
const db = require('./utils/database');
db.all('SELECT * FROM reddit_posts').then(console.log);
"
```

### CSV Export
```bash
# Export trending topics
node -e "
const db = require('./utils/database');
db.all('SELECT * FROM trending_topics').then(data => {
  const csv = data.map(row => Object.values(row).join(',')).join('\\n');
  console.log(csv);
});
"
```

## 🚨 Troubleshooting

### Common Issues

1. **Proxy Failures**
   ```bash
   # Test proxy connectivity
   node -e "require('./utils/proxy-manager').testAllProxies()"
   ```

2. **Database Locked**
   ```bash
   # Reset database
   rm data/scraped_data.db
   npm run setup
   ```

3. **Rate Limiting**
   ```bash
   # Increase delays in config.js
   rateLimit: { minDelay: 5000, maxDelay: 15000 }
   ```

### Logs

Check logs in `logs/` directory:
- `combined.log`: All activities
- `error.log`: Errors only

## 🔒 Security & Privacy

- **No Authentication**: Uses public Reddit data only
- **Rate Limiting**: Respects Reddit's rate limits
- **Data Privacy**: No personal data collection
- **Open Source**: Fully transparent codebase

## 📝 License

MIT License - Feel free to use and modify for your projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review logs for error details
- Open an issue on GitHub

---

**Built with ❤️ for the AI community**
