#!/usr/bin/env node

/**
 * AI Performance Monitoring Script
 * Tracks response times, quality, and user satisfaction
 */

const monitorAIPerformance = async () => {
  console.log('📊 AI Performance Monitoring');
  console.log('=' .repeat(50));
  
  const performanceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    totalResponseTime: 0,
    personalityScore: 0,
    totalPersonalityScore: 0
  };

  const testPrompts = [
    "Hey bro, which AI tool should I use for videos?",
    "Can you help me with video editing pricing?",
    "What gimbal do you recommend for reels?",
    "I need help with a music video project",
    "When are you free for a shoot?"
  ];

  for (const prompt of testPrompts) {
    try {
      performanceMetrics.totalRequests++;
      const startTime = Date.now();
      
      console.log(`\n🎯 Testing: "${prompt}"`);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: []
        })
      });
      
      const responseTime = Date.now() - startTime;
      performanceMetrics.totalResponseTime += responseTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      performanceMetrics.successfulRequests++;
      
      // Calculate personality score
      const personalityScore = calculatePersonalityScore(data.response);
      performanceMetrics.totalPersonalityScore += personalityScore;
      
      console.log(`✅ Response: ${data.response}`);
      console.log(`⏱️  Response time: ${responseTime}ms`);
      console.log(`🎭 Personality score: ${personalityScore}/10`);
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      performanceMetrics.failedRequests++;
      console.error(`❌ Test failed:`, error.message);
    }
  }
  
  // Calculate final metrics
  performanceMetrics.averageResponseTime = performanceMetrics.totalResponseTime / performanceMetrics.successfulRequests;
  performanceMetrics.personalityScore = performanceMetrics.totalPersonalityScore / performanceMetrics.successfulRequests;
  
  // Display performance summary
  displayPerformanceSummary(performanceMetrics);
};

const calculatePersonalityScore = (response) => {
  const responseLower = response.toLowerCase();
  let score = 0;
  
  // Hindi-English mixing (0-3 points)
  if (responseLower.includes('bro') || responseLower.includes('bhai')) score += 1;
  if (responseLower.includes('yaar')) score += 1;
  if (responseLower.includes('kya') || responseLower.includes('kaisa')) score += 1;
  
  // Technical expertise (0-3 points)
  if (responseLower.includes('kling') || responseLower.includes('runway')) score += 1;
  if (responseLower.includes('davinci') || responseLower.includes('editing')) score += 1;
  if (responseLower.includes('gimbal') || responseLower.includes('camera')) score += 1;
  
  // Casual/friendly tone (0-2 points)
  if (responseLower.includes('cool') || responseLower.includes('awesome')) score += 1;
  if (responseLower.includes('haha') || responseLower.includes('😊')) score += 1;
  
  // Professional knowledge (0-2 points)
  if (responseLower.includes('pricing') || responseLower.includes('cost')) score += 1;
  if (responseLower.includes('shoot') || responseLower.includes('project')) score += 1;
  
  return Math.min(score, 10); // Cap at 10
};

const displayPerformanceSummary = (metrics) => {
  console.log('\n📊 Performance Summary');
  console.log('=' .repeat(30));
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Successful: ${metrics.successfulRequests}`);
  console.log(`Failed: ${metrics.failedRequests}`);
  console.log(`Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%`);
  console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(0)}ms`);
  console.log(`Personality Score: ${metrics.personalityScore.toFixed(1)}/10`);
  
  console.log('\n🎯 Performance Assessment:');
  if (metrics.personalityScore >= 8) {
    console.log('✅ Excellent! AI sounds very much like Parth');
  } else if (metrics.personalityScore >= 6) {
    console.log('👍 Good! AI has captured Parth\'s personality well');
  } else if (metrics.personalityScore >= 4) {
    console.log('⚠️  Fair! Some personality captured, room for improvement');
  } else {
    console.log('❌ Poor! AI doesn\'t sound much like Parth');
  }
  
  console.log('\n💡 Recommendations:');
  if (metrics.averageResponseTime > 5000) {
    console.log('   • Response times are slow, consider optimization');
  }
  if (metrics.personalityScore < 6) {
    console.log('   • Consider retraining with more diverse examples');
    console.log('   • Adjust system prompt for better personality capture');
  }
};

// Run monitoring
monitorAIPerformance().catch(console.error);
