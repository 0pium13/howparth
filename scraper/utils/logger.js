const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
fs.ensureDirSync(logsDir);

// Create logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-scraper' },
  transports: [
    // Write all logs to file
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Custom logging methods
logger.scraping = (message, meta = {}) => {
  logger.info(`[SCRAPING] ${message}`, { ...meta, type: 'scraping' });
};

logger.performance = (message, meta = {}) => {
  logger.info(`[PERFORMANCE] ${message}`, { ...meta, type: 'performance' });
};

logger.detection = (message, meta = {}) => {
  logger.warn(`[DETECTION] ${message}`, { ...meta, type: 'detection' });
};

logger.rateLimit = (message, meta = {}) => {
  logger.warn(`[RATE_LIMIT] ${message}`, { ...meta, type: 'rate_limit' });
};

module.exports = logger;
