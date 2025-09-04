// Reddit Scraper API Route for Vercel
const OpenAI = require('openai');

// Initialize OpenAI for content analysis
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000
});

// Simple in-memory storage for scraped data (resets on cold start)
// In production, this should be replaced with a proper database
let scrapedDataStore = {
  posts: [],
  lastScraped: null,
  totalScraped: 0,
  subreddits: ['r/PromptEngineering', 'r/ChatGPT', 'r/OpenAI', 'r/StableDiffusion'],
  status: 'idle'
};

// Reddit API credentials
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

// Get Reddit access token
async function getRedditAccessToken() {
  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to get Reddit access token:', error);
    throw error;
  }
}

// Scrape Reddit posts
async function scrapeRedditPosts(subreddit, limit = 10) {
  try {
    const accessToken = await getRedditAccessToken();

    const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'HOWPARTH-SCRAPER/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();

    return data.data.children.map(post => ({
      id: post.data.id,
      title: post.data.title,
      selftext: post.data.selftext,
      url: post.data.url,
      score: post.data.score,
      num_comments: post.data.num_comments,
      created_utc: post.data.created_utc,
      author: post.data.author,
      subreddit: post.data.subreddit,
      permalink: post.data.permalink,
      scraped_at: new Date().toISOString()
    }));

  } catch (error) {
    console.error(`Failed to scrape r/${subreddit}:`, error);
    throw error;
  }
}

// Analyze content with AI
async function analyzeContent(posts) {
  const analyzedPosts = [];

  for (const post of posts) {
    try {
      // Analyze sentiment and relevance
      const analysisPrompt = `Analyze this Reddit post for AI/ML relevance and sentiment:

Title: ${post.title}
Content: ${post.selftext.substring(0, 500)}${post.selftext.length > 500 ? '...' : ''}

Provide a JSON response with:
- relevance_score (0-10, how relevant to AI/ML)
- sentiment (positive/negative/neutral)
- topics (array of main topics)
- summary (brief 2-3 sentence summary)`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: analysisPrompt }],
        max_tokens: 200,
        temperature: 0.3
      });

      let analysis;
      try {
        analysis = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        // Fallback analysis if JSON parsing fails
        analysis = {
          relevance_score: 5,
          sentiment: 'neutral',
          topics: ['AI/ML'],
          summary: 'AI-generated content analysis summary'
        };
      }

      analyzedPosts.push({
        ...post,
        analysis
      });

    } catch (error) {
      console.error(`Failed to analyze post ${post.id}:`, error);

      // Add post without analysis
      analyzedPosts.push({
        ...post,
        analysis: {
          relevance_score: 0,
          sentiment: 'unknown',
          topics: [],
          summary: 'Analysis failed'
        }
      });
    }
  }

  return analyzedPosts;
}

// Store scraped data (in production, save to database)
function storeScrapedData(posts) {
  scrapedDataStore.posts.push(...posts);
  scrapedDataStore.totalScraped += posts.length;
  scrapedDataStore.lastScraped = new Date().toISOString();

  // Keep only recent posts (last 1000)
  if (scrapedDataStore.posts.length > 1000) {
    scrapedDataStore.posts = scrapedDataStore.posts.slice(-1000);
  }

  console.log(`Stored ${posts.length} scraped posts. Total: ${scrapedDataStore.totalScraped}`);
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const startTime = Date.now();

  try {
    // Health check endpoint
    if (req.method === 'GET' && req.url.includes('/health')) {
      return res.status(200).json({
        status: 'healthy',
        lastScraped: scrapedDataStore.lastScraped,
        totalScraped: scrapedDataStore.totalScraped,
        status: scrapedDataStore.status,
        timestamp: new Date().toISOString()
      });
    }

    // Get scraped data endpoint
    if (req.method === 'GET' && req.url.includes('/data')) {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const data = scrapedDataStore.posts
        .slice(offset, offset + limit)
        .map(post => ({
          id: post.id,
          title: post.title,
          score: post.score,
          num_comments: post.num_comments,
          subreddit: post.subreddit,
          created_utc: post.created_utc,
          analysis: post.analysis,
          scraped_at: post.scraped_at
        }));

      return res.status(200).json({
        success: true,
        data,
        total: scrapedDataStore.posts.length,
        limit,
        offset,
        timestamp: new Date().toISOString()
      });
    }

    // Manual scrape trigger (admin only)
    if (req.method === 'POST') {
      // Simple admin check (in production, use proper authentication)
      const authHeader = req.headers.authorization;
      const isAdmin = authHeader === `Bearer ${process.env.ADMIN_JWT_SECRET}`;

      if (!isAdmin) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Admin access required',
          timestamp: new Date().toISOString()
        });
      }

      const { subreddits = scrapedDataStore.subreddits, limit = 10 } = req.body;

      scrapedDataStore.status = 'scraping';
      console.log(`Starting manual scrape for ${subreddits.length} subreddits...`);

      const allPosts = [];

      for (const subreddit of subreddits) {
        try {
          console.log(`Scraping r/${subreddit}...`);
          const posts = await scrapeRedditPosts(subreddit, limit);
          allPosts.push(...posts);

          // Add delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Failed to scrape r/${subreddit}:`, error);
          // Continue with other subreddits
        }
      }

      console.log(`Analyzing ${allPosts.length} posts with AI...`);
      const analyzedPosts = await analyzeContent(allPosts);

      storeScrapedData(analyzedPosts);
      scrapedDataStore.status = 'idle';

      const responseTime = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        message: `Scraped and analyzed ${analyzedPosts.length} posts`,
        data: {
          scraped: allPosts.length,
          analyzed: analyzedPosts.length,
          subreddits: subreddits,
          responseTime
        },
        timestamp: new Date().toISOString()
      });
    }

    // Default response for unsupported methods
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    scrapedDataStore.status = 'error';
    console.error('Scraper API error:', error);

    const responseTime = Date.now() - startTime;

    return res.status(500).json({
      success: false,
      error: 'Scraper operation failed',
      details: error.message,
      responseTime,
      timestamp: new Date().toISOString()
    });
  }
};
