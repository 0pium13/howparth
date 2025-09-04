const Sentiment = require('sentiment');
const natural = require('natural');

class SentimentAnalyzer {
  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // AI-specific sentiment words
    this.aiSentimentWords = {
      positive: [
        'amazing', 'incredible', 'revolutionary', 'breakthrough', 'innovative',
        'powerful', 'impressive', 'game-changing', 'cutting-edge', 'advanced',
        'sophisticated', 'intelligent', 'brilliant', 'genius', 'outstanding',
        'excellent', 'perfect', 'flawless', 'superior', 'exceptional',
        'mind-blowing', 'jaw-dropping', 'stunning', 'remarkable', 'phenomenal'
      ],
      negative: [
        'terrible', 'awful', 'horrible', 'disappointing', 'frustrating',
        'broken', 'buggy', 'unreliable', 'slow', 'inefficient',
        'outdated', 'primitive', 'basic', 'limited', 'restricted',
        'confusing', 'complicated', 'overcomplicated', 'unintuitive',
        'useless', 'worthless', 'garbage', 'trash', 'rubbish'
      ]
    };

    // Add AI-specific words to sentiment analysis
    this.enhanceSentimentDictionary();
  }

  enhanceSentimentDictionary() {
    // Add positive AI terms
    this.aiSentimentWords.positive.forEach(word => {
      this.sentiment.registerLanguage('en', {
        labels: { [word]: 3 }
      });
    });

    // Add negative AI terms
    this.aiSentimentWords.negative.forEach(word => {
      this.sentiment.registerLanguage('en', {
        labels: { [word]: -3 }
      });
    });
  }

  analyze(text) {
    if (!text || typeof text !== 'string') {
      return { score: 0, label: 'neutral', confidence: 0 };
    }

    // Clean and preprocess text
    const cleanedText = this.preprocessText(text);
    
    // Get sentiment analysis
    const result = this.sentiment.analyze(cleanedText);
    
    // Calculate confidence based on score magnitude and word count
    const confidence = this.calculateConfidence(result.score, result.words.length);
    
    // Determine label
    const label = this.getSentimentLabel(result.score, confidence);
    
    // Extract key topics and emotions
    const topics = this.extractTopics(cleanedText);
    const emotions = this.extractEmotions(cleanedText);
    
    return {
      score: result.score,
      label: label,
      confidence: confidence,
      topics: topics,
      emotions: emotions,
      wordCount: result.words.length,
      positiveWords: result.positive,
      negativeWords: result.negative
    };
  }

  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  calculateConfidence(score, wordCount) {
    if (wordCount === 0) return 0;
    
    // Base confidence on score magnitude relative to word count
    const normalizedScore = Math.abs(score) / wordCount;
    
    // Higher confidence for more extreme scores
    if (normalizedScore > 0.5) return 0.9;
    if (normalizedScore > 0.3) return 0.7;
    if (normalizedScore > 0.1) return 0.5;
    return 0.3;
  }

  getSentimentLabel(score, confidence) {
    if (confidence < 0.3) return 'neutral';
    
    if (score > 2) return 'very_positive';
    if (score > 0) return 'positive';
    if (score < -2) return 'very_negative';
    if (score < 0) return 'negative';
    
    return 'neutral';
  }

  extractTopics(text) {
    const tokens = this.tokenizer.tokenize(text);
    const topics = [];
    
    // AI-related keywords
    const aiKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'gpt', 'chatgpt', 'openai', 'stable diffusion',
      'prompt', 'prompting', 'model', 'algorithm', 'training', 'dataset',
      'fine-tuning', 'llm', 'large language model', 'transformer',
      'nlp', 'natural language processing', 'computer vision', 'cv'
    ];
    
    aiKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        topics.push(keyword);
      }
    });
    
    return [...new Set(topics)]; // Remove duplicates
  }

  extractEmotions(text) {
    const emotions = [];
    
    // Emotion keywords
    const emotionMap = {
      excitement: ['excited', 'thrilled', 'amazing', 'incredible', 'wow'],
      frustration: ['frustrated', 'annoying', 'broken', 'buggy', 'hate'],
      curiosity: ['curious', 'interesting', 'wonder', 'question', 'how'],
      satisfaction: ['satisfied', 'happy', 'love', 'perfect', 'great'],
      confusion: ['confused', 'unclear', 'complicated', 'complex', 'hard']
    };
    
    Object.entries(emotionMap).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        emotions.push(emotion);
      }
    });
    
    return emotions;
  }

  // Analyze batch of texts
  analyzeBatch(texts) {
    return texts.map(text => this.analyze(text));
  }

  // Get sentiment trends over time
  getSentimentTrends(analyses, timeWindow = 24) {
    const now = Date.now();
    const windowMs = timeWindow * 60 * 60 * 1000; // Convert hours to milliseconds
    
    const recentAnalyses = analyses.filter(analysis => 
      analysis.timestamp && (now - analysis.timestamp) < windowMs
    );
    
    if (recentAnalyses.length === 0) {
      return { trend: 'neutral', change: 0, count: 0 };
    }
    
    const avgScore = recentAnalyses.reduce((sum, analysis) => 
      sum + analysis.score, 0) / recentAnalyses.length;
    
    // Calculate trend direction
    const positiveCount = recentAnalyses.filter(a => a.score > 0).length;
    const negativeCount = recentAnalyses.filter(a => a.score < 0).length;
    
    let trend = 'neutral';
    if (positiveCount > negativeCount * 1.5) trend = 'positive';
    else if (negativeCount > positiveCount * 1.5) trend = 'negative';
    
    return {
      trend: trend,
      averageScore: avgScore,
      positiveRatio: positiveCount / recentAnalyses.length,
      negativeRatio: negativeCount / recentAnalyses.length,
      count: recentAnalyses.length
    };
  }
}

module.exports = SentimentAnalyzer;
