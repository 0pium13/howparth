const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');
const logger = require('./logger');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, '../data/scraped_data.db');
    this.init();
  }

  async init() {
    try {
      // Ensure data directory exists
      await fs.ensureDir(path.dirname(this.dbPath));
      
      // Create database connection
      this.db = new sqlite3.Database(this.dbPath);
      
      // Create tables
      await this.createTables();
      
      logger.info('Database initialized successfully', { path: this.dbPath });
    } catch (error) {
      logger.error('Database initialization failed', { error: error.message });
      throw error;
    }
  }

  async createTables() {
    const tables = {
      reddit_posts: `
        CREATE TABLE IF NOT EXISTS reddit_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id TEXT UNIQUE NOT NULL,
          subreddit TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT,
          author TEXT,
          upvotes INTEGER DEFAULT 0,
          downvotes INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          score REAL DEFAULT 0,
          url TEXT,
          permalink TEXT,
          created_utc INTEGER,
          scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          sentiment_score REAL,
          sentiment_label TEXT,
          tags TEXT,
          is_hot BOOLEAN DEFAULT 0,
          is_trending BOOLEAN DEFAULT 0
        )
      `,
      
      reddit_comments: `
        CREATE TABLE IF NOT EXISTS reddit_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          comment_id TEXT UNIQUE NOT NULL,
          post_id TEXT NOT NULL,
          parent_id TEXT,
          author TEXT,
          content TEXT NOT NULL,
          upvotes INTEGER DEFAULT 0,
          downvotes INTEGER DEFAULT 0,
          score REAL DEFAULT 0,
          created_utc INTEGER,
          scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          sentiment_score REAL,
          sentiment_label TEXT,
          depth INTEGER DEFAULT 0,
          FOREIGN KEY (post_id) REFERENCES reddit_posts (post_id)
        )
      `,
      
      trending_topics: `
        CREATE TABLE IF NOT EXISTS trending_topics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          topic TEXT NOT NULL,
          subreddit TEXT NOT NULL,
          mentions INTEGER DEFAULT 1,
          sentiment_avg REAL,
          first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          trend_score REAL DEFAULT 0
        )
      `,
      
      scraping_analytics: `
        CREATE TABLE IF NOT EXISTS scraping_analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          subreddit TEXT,
          posts_scraped INTEGER DEFAULT 0,
          comments_scraped INTEGER DEFAULT 0,
          errors_count INTEGER DEFAULT 0,
          success_rate REAL,
          avg_response_time REAL,
          proxy_used TEXT,
          user_agent TEXT
        )
      `
    };

    for (const [tableName, sql] of Object.entries(tables)) {
      await this.run(sql);
      logger.info(`Table created/verified: ${tableName}`);
    }

    // Create indexes for better performance
    await this.createIndexes();
  }

  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_posts_subreddit ON reddit_posts(subreddit)',
      'CREATE INDEX IF NOT EXISTS idx_posts_created ON reddit_posts(created_utc)',
      'CREATE INDEX IF NOT EXISTS idx_posts_score ON reddit_posts(score)',
      'CREATE INDEX IF NOT EXISTS idx_posts_trending ON reddit_posts(is_trending)',
      'CREATE INDEX IF NOT EXISTS idx_comments_post_id ON reddit_comments(post_id)',
      'CREATE INDEX IF NOT EXISTS idx_trending_topic ON trending_topics(topic)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON scraping_analytics(timestamp)'
    ];

    for (const indexSQL of indexes) {
      await this.run(indexSQL);
    }
  }

  // Promise wrapper for database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Database run error', { error: err.message, sql });
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error', { error: err.message, sql });
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database all error', { error: err.message, sql });
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Insert or update post
  async upsertPost(postData) {
    const sql = `
      INSERT OR REPLACE INTO reddit_posts (
        post_id, subreddit, title, content, author, upvotes, downvotes,
        comments_count, score, url, permalink, created_utc, sentiment_score,
        sentiment_label, tags, is_hot, is_trending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      postData.id, postData.subreddit, postData.title, postData.content,
      postData.author, postData.upvotes, postData.downvotes, postData.comments_count,
      postData.score, postData.url, postData.permalink, postData.created_utc,
      postData.sentiment_score, postData.sentiment_label, postData.tags,
      postData.is_hot, postData.is_trending
    ];

    return await this.run(sql, params);
  }

  // Insert comment
  async insertComment(commentData) {
    const sql = `
      INSERT OR REPLACE INTO reddit_comments (
        comment_id, post_id, parent_id, author, content, upvotes, downvotes,
        score, created_utc, sentiment_score, sentiment_label, depth
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      commentData.id, commentData.post_id, commentData.parent_id, commentData.author,
      commentData.content, commentData.upvotes, commentData.downvotes, commentData.score,
      commentData.created_utc, commentData.sentiment_score, commentData.sentiment_label,
      commentData.depth
    ];

    return await this.run(sql, params);
  }

  // Get trending topics
  async getTrendingTopics(limit = 20) {
    const sql = `
      SELECT topic, subreddit, mentions, sentiment_avg, trend_score, last_updated
      FROM trending_topics 
      ORDER BY trend_score DESC, mentions DESC 
      LIMIT ?
    `;
    return await this.all(sql, [limit]);
  }

  // Get analytics data
  async getAnalytics(hours = 24) {
    const sql = `
      SELECT 
        subreddit,
        SUM(posts_scraped) as total_posts,
        SUM(comments_scraped) as total_comments,
        AVG(success_rate) as avg_success_rate,
        AVG(avg_response_time) as avg_response_time,
        COUNT(*) as scraping_sessions
      FROM scraping_analytics 
      WHERE timestamp > datetime('now', '-${hours} hours')
      GROUP BY subreddit
      ORDER BY total_posts DESC
    `;
    return await this.all(sql);
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          logger.error('Error closing database', { error: err.message });
        } else {
          logger.info('Database connection closed');
        }
      });
    }
  }
}

module.exports = Database;
