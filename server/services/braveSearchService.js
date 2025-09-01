const fetch = require('node-fetch');
const Parser = require('rss-parser');

class BraveSearchService {
  constructor() {
    this.apiKey = process.env.BRAVE_API_KEY;
    this.requestCount = 0;
    this.monthlyLimit = 2000;
    this.parser = new Parser();
    this.lastReset = new Date().getMonth();
  }

  async searchWeb(query, count = 3) {
    // Reset counter if new month
    const currentMonth = new Date().getMonth();
    if (currentMonth !== this.lastReset) {
      this.requestCount = 0;
      this.lastReset = currentMonth;
    }

    if (this.requestCount >= this.monthlyLimit) {
      console.log('Brave API limit reached, using RSS fallback');
      return await this.fallbackRSSSearch(query);
    }

    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
        {
          headers: {
            'X-Subscription-Token': this.apiKey,
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      if (!response.ok) {
        throw new Error(`Brave API error: ${response.status}`);
      }

      this.requestCount++;
      const data = await response.json();
      
      return data.web?.results?.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
        published: r.age || new Date().toISOString(),
        source: 'Brave Search'
      })) || [];

    } catch (error) {
      console.error('Brave search error:', error);
      return await this.fallbackRSSSearch(query);
    }
  }

  async fallbackRSSSearch(query, count = 3) {
    const feeds = [
      'https://techcrunch.com/feed/',
      'https://feeds.feedburner.com/venturebeat/SZYF',
      'https://www.artificialintelligence-news.com/feed/',
      'https://www.zdnet.com/news/rss.xml',
      'https://www.theverge.com/rss/index.xml'
    ];

    const results = [];
    const searchTerms = query.toLowerCase().split(' ');

    for (const feedUrl of feeds) {
      try {
        const feed = await this.parser.parseURL(feedUrl);
        const relevant = feed.items
          .filter(item => {
            const title = item.title?.toLowerCase() || '';
            const content = item.contentSnippet?.toLowerCase() || item.content?.toLowerCase() || '';
            const text = `${title} ${content}`;
            
            return searchTerms.some(term => text.includes(term));
          })
          .slice(0, 2)
          .map(item => ({
            title: item.title,
            url: item.link,
            snippet: item.contentSnippet || item.content?.substring(0, 200) + '...',
            published: item.pubDate,
            source: feed.title || 'RSS Feed'
          }));
        
        results.push(...relevant);
      } catch (error) {
        console.error(`RSS fetch error for ${feedUrl}:`, error);
      }
    }
    
    // Sort by relevance and recency
    results.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, searchTerms);
      const bScore = this.calculateRelevanceScore(b, searchTerms);
      return bScore - aScore;
    });
    
    return results.slice(0, count);
  }

  calculateRelevanceScore(item, searchTerms) {
    const title = item.title?.toLowerCase() || '';
    const snippet = item.snippet?.toLowerCase() || '';
    const text = `${title} ${snippet}`;
    
    let score = 0;
    searchTerms.forEach(term => {
      if (title.includes(term)) score += 3;
      if (snippet.includes(term)) score += 1;
    });
    
    // Bonus for recent content
    if (item.published) {
      const published = new Date(item.published);
      const daysAgo = (new Date() - published) / (1000 * 60 * 60 * 24);
      if (daysAgo < 7) score += 2;
      if (daysAgo < 30) score += 1;
    }
    
    return score;
  }

  async searchAIAndTech(query) {
    const aiTechQuery = `${query} AI artificial intelligence technology latest news`;
    return await this.searchWeb(aiTechQuery, 5);
  }

  async getUsageStats() {
    return {
      requestsThisMonth: this.requestCount,
      monthlyLimit: this.monthlyLimit,
      remainingRequests: this.monthlyLimit - this.requestCount,
      usingFallback: this.requestCount >= this.monthlyLimit
    };
  }
}

module.exports = BraveSearchService;
