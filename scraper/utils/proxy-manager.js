const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const logger = require('./logger');

class ProxyManager {
  constructor() {
    this.proxies = [];
    this.currentProxyIndex = 0;
    this.failedProxies = new Set();
    this.lastProxyUpdate = 0;
    this.proxyUpdateInterval = 30 * 60 * 1000; // 30 minutes
  }

  async initialize() {
    await this.fetchProxies();
    logger.info(`Proxy manager initialized with ${this.proxies.length} proxies`);
  }

  async fetchProxies() {
    const proxySources = [
      'https://www.proxy-list.download/api/v1/get?type=http',
      'https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
      'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt'
    ];

    const allProxies = [];

    for (const source of proxySources) {
      try {
        const response = await axios.get(source, { timeout: 10000 });
        const proxies = this.parseProxyResponse(response.data);
        allProxies.push(...proxies);
        logger.info(`Fetched ${proxies.length} proxies from ${source}`);
      } catch (error) {
        logger.warn(`Failed to fetch proxies from ${source}`, { error: error.message });
      }
    }

    // Remove duplicates and filter valid proxies
    this.proxies = this.deduplicateAndValidate(allProxies);
    this.lastProxyUpdate = Date.now();
    
    logger.info(`Total valid proxies: ${this.proxies.length}`);
  }

  parseProxyResponse(data) {
    const proxies = [];
    const lines = data.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const proxy = this.parseProxyLine(line.trim());
      if (proxy) {
        proxies.push(proxy);
      }
    }
    
    return proxies;
  }

  parseProxyLine(line) {
    // Handle different proxy formats
    const patterns = [
      /^(\d+\.\d+\.\d+\.\d+):(\d+)$/, // IP:PORT
      /^(\d+\.\d+\.\d+\.\d+):(\d+):(.+):(.+)$/, // IP:PORT:USER:PASS
      /^http:\/\/(\d+\.\d+\.\d+\.\d+):(\d+)$/, // http://IP:PORT
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return {
          host: match[1],
          port: parseInt(match[2]),
          username: match[3] || null,
          password: match[4] || null,
          protocol: 'http'
        };
      }
    }

    return null;
  }

  deduplicateAndValidate(proxies) {
    const unique = new Map();
    
    for (const proxy of proxies) {
      const key = `${proxy.host}:${proxy.port}`;
      if (!unique.has(key) && this.isValidProxy(proxy)) {
        unique.set(key, proxy);
      }
    }
    
    return Array.from(unique.values());
  }

  isValidProxy(proxy) {
    // Basic validation
    if (!proxy.host || !proxy.port) return false;
    if (proxy.port < 1 || proxy.port > 65535) return false;
    
    // IP validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(proxy.host)) return false;
    
    return true;
  }

  getNextProxy() {
    if (this.proxies.length === 0) {
      return null;
    }

    // Check if we need to refresh proxies
    if (Date.now() - this.lastProxyUpdate > this.proxyUpdateInterval) {
      this.fetchProxies();
    }

    // Find next available proxy
    let attempts = 0;
    while (attempts < this.proxies.length) {
      const proxy = this.proxies[this.currentProxyIndex];
      this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
      
      if (!this.failedProxies.has(`${proxy.host}:${proxy.port}`)) {
        return proxy;
      }
      
      attempts++;
    }

    // If all proxies failed, reset failed list and try again
    logger.warn('All proxies failed, resetting failed list');
    this.failedProxies.clear();
    return this.proxies[0] || null;
  }

  markProxyFailed(proxy) {
    const key = `${proxy.host}:${proxy.port}`;
    this.failedProxies.add(key);
    logger.warn(`Marked proxy as failed: ${key}`);
  }

  markProxySuccess(proxy) {
    const key = `${proxy.host}:${proxy.port}`;
    this.failedProxies.delete(key);
  }

  createProxyAgent(proxy) {
    if (!proxy) return null;
    
    const proxyUrl = proxy.username && proxy.password 
      ? `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
      : `http://${proxy.host}:${proxy.port}`;
    
    return new HttpsProxyAgent(proxyUrl);
  }

  async testProxy(proxy) {
    try {
      const agent = this.createProxyAgent(proxy);
      const response = await axios.get('https://httpbin.org/ip', {
        httpsAgent: agent,
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.status === 200) {
        this.markProxySuccess(proxy);
        return true;
      }
    } catch (error) {
      this.markProxyFailed(proxy);
      return false;
    }
    
    return false;
  }

  async testAllProxies() {
    logger.info('Testing all proxies...');
    const testPromises = this.proxies.map(proxy => this.testProxy(proxy));
    const results = await Promise.allSettled(testPromises);
    
    const workingProxies = results.filter(result => result.status === 'fulfilled' && result.value).length;
    logger.info(`Proxy test completed: ${workingProxies}/${this.proxies.length} proxies working`);
    
    return workingProxies;
  }

  getProxyStats() {
    return {
      total: this.proxies.length,
      failed: this.failedProxies.size,
      working: this.proxies.length - this.failedProxies.size,
      lastUpdate: this.lastProxyUpdate
    };
  }

  // Get random proxy for additional randomization
  getRandomProxy() {
    if (this.proxies.length === 0) return null;
    
    const availableProxies = this.proxies.filter(proxy => 
      !this.failedProxies.has(`${proxy.host}:${proxy.port}`)
    );
    
    if (availableProxies.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableProxies.length);
    return availableProxies[randomIndex];
  }
}

module.exports = ProxyManager;
