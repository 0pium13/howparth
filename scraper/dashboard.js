const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Database = require('./utils/database');
const logger = require('./utils/logger');
const config = require('./config');

class ScrapingDashboard {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.database = new Database();
    this.port = config.dashboard.port;
    this.isRunning = false;
  }

  async initialize() {
    await this.database.init();
    this.setupRoutes();
    this.setupSocketHandlers();
    this.startDataBroadcasting();
  }

  setupRoutes() {
    // Serve static files
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // API routes
    this.app.get('/api/stats', async (req, res) => {
      try {
        const stats = await this.getStats();
        res.json(stats);
      } catch (error) {
        logger.error('Failed to get stats', { error: error.message });
        res.status(500).json({ error: 'Failed to get stats' });
      }
    });

    this.app.get('/api/trending', async (req, res) => {
      try {
        const trending = await this.database.getTrendingTopics(20);
        res.json(trending);
      } catch (error) {
        logger.error('Failed to get trending topics', { error: error.message });
        res.status(500).json({ error: 'Failed to get trending topics' });
      }
    });

    this.app.get('/api/analytics', async (req, res) => {
      try {
        const analytics = await this.database.getAnalytics(24);
        res.json(analytics);
      } catch (error) {
        logger.error('Failed to get analytics', { error: error.message });
        res.status(500).json({ error: 'Failed to get analytics' });
      }
    });

    this.app.get('/api/posts', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 50;
        const subreddit = req.query.subreddit;
        
        let sql = `
          SELECT * FROM reddit_posts 
          WHERE 1=1
        `;
        const params = [];
        
        if (subreddit) {
          sql += ' AND subreddit = ?';
          params.push(subreddit);
        }
        
        sql += ' ORDER BY score DESC LIMIT ?';
        params.push(limit);
        
        const posts = await this.database.all(sql, params);
        res.json(posts);
      } catch (error) {
        logger.error('Failed to get posts', { error: error.message });
        res.status(500).json({ error: 'Failed to get posts' });
      }
    });

    // Serve dashboard HTML
    this.app.get('/', (req, res) => {
      res.send(this.getDashboardHTML());
    });
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('Dashboard client connected', { id: socket.id });
      
      socket.on('disconnect', () => {
        logger.info('Dashboard client disconnected', { id: socket.id });
      });
      
      socket.on('request-update', async () => {
        try {
          const stats = await this.getStats();
          socket.emit('stats-update', stats);
        } catch (error) {
          socket.emit('error', { message: 'Failed to get stats' });
        }
      });
    });
  }

  startDataBroadcasting() {
    setInterval(async () => {
      try {
        const stats = await this.getStats();
        this.io.emit('stats-update', stats);
      } catch (error) {
        logger.error('Failed to broadcast stats', { error: error.message });
      }
    }, config.dashboard.updateInterval);
  }

  async getStats() {
    const [
      totalPosts,
      totalComments,
      trendingTopics,
      recentPosts,
      analytics
    ] = await Promise.all([
      this.database.get('SELECT COUNT(*) as count FROM reddit_posts'),
      this.database.get('SELECT COUNT(*) as count FROM reddit_comments'),
      this.database.getTrendingTopics(10),
      this.database.all(`
        SELECT subreddit, COUNT(*) as count 
        FROM reddit_posts 
        WHERE scraped_at > datetime('now', '-24 hours')
        GROUP BY subreddit
        ORDER BY count DESC
      `),
      this.database.getAnalytics(24)
    ]);

    return {
      totalPosts: totalPosts.count,
      totalComments: totalComments.count,
      trendingTopics,
      recentPosts,
      analytics,
      lastUpdate: new Date().toISOString()
    };
  }

  getDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Community Scraper Dashboard</title>
    <script src="/socket.io/socket.io.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .stat-label {
            font-size: 1rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .section {
            background: white;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        
        .trending-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .trending-item:last-child {
            border-bottom: none;
        }
        
        .trending-topic {
            font-weight: 500;
        }
        
        .trending-score {
            background: #667eea;
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.9rem;
        }
        
        .subreddit-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .subreddit-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 10px;
        }
        
        .status-online {
            background: #28a745;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .last-update {
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            margin-top: 20px;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI Community Scraper</h1>
            <p>Real-time monitoring dashboard for AI community insights</p>
            <div class="status-indicator status-online"></div>
            <span>Live</span>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="total-posts">-</div>
                <div class="stat-label">Total Posts</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="total-comments">-</div>
                <div class="stat-label">Total Comments</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="trending-count">-</div>
                <div class="stat-label">Trending Topics</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="subreddits-count">-</div>
                <div class="stat-label">Active Subreddits</div>
            </div>
        </div>
        
        <div class="section">
            <h2>🔥 Trending Topics</h2>
            <div id="trending-topics" class="loading">Loading trending topics...</div>
        </div>
        
        <div class="section">
            <h2>📊 Subreddit Activity (24h)</h2>
            <div id="subreddit-stats" class="loading">Loading subreddit stats...</div>
        </div>
        
        <div class="last-update" id="last-update">
            Last updated: Never
        </div>
    </div>

    <script>
        const socket = io();
        
        socket.on('stats-update', function(data) {
            updateDashboard(data);
        });
        
        socket.on('error', function(error) {
            console.error('Dashboard error:', error);
        });
        
        function updateDashboard(data) {
            // Update main stats
            document.getElementById('total-posts').textContent = data.totalPosts.toLocaleString();
            document.getElementById('total-comments').textContent = data.totalComments.toLocaleString();
            document.getElementById('trending-count').textContent = data.trendingTopics.length;
            document.getElementById('subreddits-count').textContent = data.recentPosts.length;
            
            // Update trending topics
            const trendingContainer = document.getElementById('trending-topics');
            if (data.trendingTopics.length > 0) {
                trendingContainer.innerHTML = data.trendingTopics.map(topic => \`
                    <div class="trending-item">
                        <span class="trending-topic">\${topic.topic}</span>
                        <span class="trending-score">\${topic.mentions} mentions</span>
                    </div>
                \`).join('');
            } else {
                trendingContainer.innerHTML = '<div class="loading">No trending topics found</div>';
            }
            
            // Update subreddit stats
            const subredditContainer = document.getElementById('subreddit-stats');
            if (data.recentPosts.length > 0) {
                subredditContainer.innerHTML = \`
                    <div class="subreddit-stats">
                        \${data.recentPosts.map(sub => \`
                            <div class="subreddit-item">
                                <span>r/\${sub.subreddit}</span>
                                <span>\${sub.count} posts</span>
                            </div>
                        \`).join('')}
                    </div>
                \`;
            } else {
                subredditContainer.innerHTML = '<div class="loading">No recent activity</div>';
            }
            
            // Update last update time
            document.getElementById('last-update').textContent = \`Last updated: \${new Date(data.lastUpdate).toLocaleString()}\`;
        }
        
        // Request initial data
        socket.emit('request-update');
        
        // Request updates every 30 seconds
        setInterval(() => {
            socket.emit('request-update');
        }, 30000);
    </script>
</body>
</html>
    `;
  }

  async start() {
    await this.initialize();
    
    this.server.listen(this.port, () => {
      this.isRunning = true;
      logger.info(`Dashboard started on http://localhost:${this.port}`);
      console.log(`\n🚀 AI Community Scraper Dashboard`);
      console.log(`📊 Dashboard: http://localhost:${this.port}`);
      console.log(`📈 Real-time monitoring active`);
      console.log(`\nPress Ctrl+C to stop\n`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Stopping dashboard...');
      this.server.close(() => {
        this.database.close();
        process.exit(0);
      });
    });
  }

  stop() {
    if (this.isRunning) {
      this.server.close();
      this.database.close();
      this.isRunning = false;
    }
  }
}

module.exports = ScrapingDashboard;
