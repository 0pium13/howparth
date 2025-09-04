// Vercel serverless function for community data
const { createClient } = require('@vercel/postgres');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { type, limit = 50, subreddit } = req.query;

      // Mock data for now - in production, this would come from your scraper database
      const mockDiscussions = [
        {
          id: '1',
          title: 'Revolutionary ChatGPT Prompt Engineering Techniques',
          content: 'I discovered these amazing prompt engineering techniques that have completely transformed how I use ChatGPT. The key is understanding the structure and being specific about the output format. Here are the top 5 techniques that have worked best for me:\n\n1. **Chain of Thought Prompting**: Ask the AI to think step by step\n2. **Role-Based Prompting**: Assign specific roles to the AI\n3. **Few-Shot Learning**: Provide examples in your prompts\n4. **Constraint Setting**: Define clear boundaries and requirements\n5. **Output Formatting**: Specify exactly how you want the response structured\n\nThese techniques have improved my AI interactions by 300%!',
          author: 'AIExplorer',
          subreddit: 'PromptEngineering',
          upvotes: 1247,
          comments: 89,
          timestamp: '2 hours ago',
          sentiment: 'positive',
          tags: ['prompt-engineering', 'chatgpt', 'tutorial'],
          trending: true,
          hot: true,
          type: 'tutorial',
          reactions: { likes: 1247, dislikes: 23, fire: 156, lightning: 89 },
          views: 15420,
          created_utc: Math.floor(Date.now() / 1000) - 7200
        },
        {
          id: '2',
          title: 'Stable Diffusion 3.0: Mind-Blowing Results',
          content: 'Just tried the new Stable Diffusion 3.0 and the results are absolutely incredible. The image quality and detail are on another level compared to previous versions. I\'ve been generating images for the past few hours and I\'m consistently amazed by the output quality.\n\nKey improvements I\'ve noticed:\n- Much better text rendering\n- Improved understanding of complex prompts\n- Better consistency across generations\n- Enhanced detail in faces and objects\n\nHere are some of my best results so far...',
          author: 'ArtCreator',
          subreddit: 'StableDiffusion',
          upvotes: 892,
          comments: 67,
          timestamp: '4 hours ago',
          sentiment: 'positive',
          tags: ['stable-diffusion', 'ai-art', 'showcase'],
          trending: true,
          hot: false,
          type: 'showcase',
          media: {
            type: 'image',
            url: '/api/placeholder/800/600',
            thumbnail: '/api/placeholder/400/300'
          },
          reactions: { likes: 892, dislikes: 12, fire: 234, lightning: 67 },
          views: 9876,
          created_utc: Math.floor(Date.now() / 1000) - 14400
        },
        {
          id: '3',
          title: 'OpenAI GPT-5 Rumors: What We Know So Far',
          content: 'There are some interesting rumors circulating about GPT-5. While nothing is confirmed, here\'s what the community has pieced together from various sources:\n\n**Potential Features:**\n- Multimodal capabilities (text, image, audio, video)\n- Improved reasoning and problem-solving\n- Better memory and context retention\n- Enhanced safety and alignment\n- Potential for real-time learning\n\n**Timeline Speculation:**\n- Some sources suggest late 2024 or early 2025\n- Others believe it might be further out\n- OpenAI has been tight-lipped about specifics\n\nWhat are your thoughts on these rumors?',
          author: 'TechWatcher',
          subreddit: 'OpenAI',
          upvotes: 2156,
          comments: 234,
          timestamp: '6 hours ago',
          sentiment: 'neutral',
          tags: ['openai', 'gpt-5', 'discussion'],
          trending: true,
          hot: true,
          type: 'discussion',
          reactions: { likes: 2156, dislikes: 45, fire: 567, lightning: 234 },
          views: 23456,
          created_utc: Math.floor(Date.now() / 1000) - 21600
        },
        {
          id: '4',
          title: 'Local LLM Setup Guide: Run GPT-4 Level Models at Home',
          content: 'I\'ve been experimenting with local LLMs and wanted to share my setup guide for running powerful models on consumer hardware. With the right setup, you can run models that rival GPT-4 in quality!\n\n**Hardware Requirements:**\n- RTX 4090 or similar high-end GPU\n- 32GB+ RAM recommended\n- Fast SSD storage\n\n**Software Setup:**\n1. Install Ollama or LM Studio\n2. Download your preferred model (Llama 3.1 70B, Mixtral 8x7B, etc.)\n3. Configure GPU acceleration\n4. Set up API endpoints\n\n**Performance Tips:**\n- Use quantization to reduce VRAM usage\n- Enable GPU offloading\n- Optimize batch sizes\n\nResults are impressive - getting 90%+ of GPT-4 quality locally!',
          author: 'LocalAIFan',
          subreddit: 'LocalLLaMA',
          upvotes: 567,
          comments: 45,
          timestamp: '8 hours ago',
          sentiment: 'positive',
          tags: ['local-llm', 'tutorial', 'hardware'],
          trending: false,
          hot: true,
          type: 'tutorial',
          reactions: { likes: 567, dislikes: 8, fire: 123, lightning: 45 },
          views: 6789,
          created_utc: Math.floor(Date.now() / 1000) - 28800
        },
        {
          id: '5',
          title: 'AI Ethics Discussion: Where Do We Draw the Line?',
          content: 'As AI becomes more powerful and ubiquitous, I think it\'s important to have open discussions about the ethical implications. There are several areas where I see potential concerns:\n\n**Job Displacement:**\n- How do we handle mass unemployment from AI automation?\n- What retraining programs are needed?\n- Universal Basic Income considerations\n\n**Privacy and Surveillance:**\n- AI-powered surveillance systems\n- Data collection and usage\n- Consent and transparency\n\n**Bias and Fairness:**\n- Algorithmic bias in decision-making\n- Representation in training data\n- Fairness in AI applications\n\n**Control and Alignment:**\n- Who controls powerful AI systems?\n- How do we ensure AI goals align with human values?\n- Preventing misuse and abuse\n\nWhat are your thoughts on these issues?',
          author: 'EthicsExplorer',
          subreddit: 'artificial',
          upvotes: 334,
          comments: 78,
          timestamp: '12 hours ago',
          sentiment: 'neutral',
          tags: ['ai-ethics', 'discussion', 'society'],
          trending: false,
          hot: false,
          type: 'discussion',
          reactions: { likes: 334, dislikes: 23, fire: 45, lightning: 78 },
          views: 4567,
          created_utc: Math.floor(Date.now() / 1000) - 43200
        }
      ];

      const mockTrendingTopics = [
        { topic: 'GPT-5', mentions: 1247, sentiment: 0.8, trend: 'up', subreddits: ['OpenAI', 'ChatGPT', 'MachineLearning'] },
        { topic: 'Prompt Engineering', mentions: 892, sentiment: 0.9, trend: 'up', subreddits: ['PromptEngineering', 'ChatGPT'] },
        { topic: 'Stable Diffusion 3.0', mentions: 567, sentiment: 0.7, trend: 'up', subreddits: ['StableDiffusion', 'AIArt'] },
        { topic: 'AI Ethics', mentions: 445, sentiment: 0.3, trend: 'stable', subreddits: ['MachineLearning', 'artificial'] },
        { topic: 'Local LLM', mentions: 334, sentiment: 0.6, trend: 'down', subreddits: ['LocalLLaMA', 'MachineLearning'] },
        { topic: 'Machine Learning', mentions: 278, sentiment: 0.5, trend: 'stable', subreddits: ['MachineLearning', 'deeplearning'] },
        { topic: 'AI Art', mentions: 189, sentiment: 0.8, trend: 'up', subreddits: ['StableDiffusion', 'AIArt'] },
        { topic: 'ChatGPT', mentions: 156, sentiment: 0.7, trend: 'down', subreddits: ['ChatGPT', 'OpenAI'] }
      ];

      let responseData;

      switch (type) {
        case 'discussions':
          let filteredDiscussions = mockDiscussions;
          
          if (subreddit) {
            filteredDiscussions = filteredDiscussions.filter(d => d.subreddit === subreddit);
          }
          
          responseData = {
            discussions: filteredDiscussions.slice(0, parseInt(limit)),
            total: filteredDiscussions.length,
            timestamp: new Date().toISOString()
          };
          break;
          
        case 'trending':
          responseData = {
            topics: mockTrendingTopics,
            timestamp: new Date().toISOString()
          };
          break;
          
        case 'analytics':
          responseData = {
            totalPosts: mockDiscussions.length,
            totalComments: mockDiscussions.reduce((sum, d) => sum + d.comments, 0),
            trendingTopics: mockTrendingTopics.length,
            activeSubreddits: [...new Set(mockDiscussions.map(d => d.subreddit))].length,
            sentimentBreakdown: {
              positive: mockDiscussions.filter(d => d.sentiment === 'positive').length,
              neutral: mockDiscussions.filter(d => d.sentiment === 'neutral').length,
              negative: mockDiscussions.filter(d => d.sentiment === 'negative').length
            },
            timestamp: new Date().toISOString()
          };
          break;
          
        default:
          responseData = {
            discussions: mockDiscussions.slice(0, parseInt(limit)),
            trendingTopics: mockTrendingTopics,
            analytics: {
              totalPosts: mockDiscussions.length,
              totalComments: mockDiscussions.reduce((sum, d) => sum + d.comments, 0),
              trendingTopics: mockTrendingTopics.length,
              activeSubreddits: [...new Set(mockDiscussions.map(d => d.subreddit))].length
            },
            timestamp: new Date().toISOString()
          };
      }

      res.status(200).json(responseData);
      
    } else if (req.method === 'POST') {
      // Handle reactions, saves, etc.
      const { action, discussionId, data } = req.body;
      
      // In a real implementation, you would update the database here
      // For now, we'll just return a success response
      
      res.status(200).json({
        success: true,
        message: `${action} completed successfully`,
        timestamp: new Date().toISOString()
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Community API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
