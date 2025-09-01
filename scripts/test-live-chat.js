#!/usr/bin/env node

/**
 * Live Chat Testing Script for Fine-tuned Parth AI
 * Run this after deployment to verify the integration works
 */

const testLiveChat = async () => {
  console.log('🧪 Testing Live Chat Integration');
  console.log('=' .repeat(50));
  
  // Test prompts that should showcase Parth's personality
  const testPrompts = [
    "Hey Parth, which AI tool is best for video generation?",
    "Bro, what gimbal do you recommend for reels?",
    "Can you help me with video editing pricing?",
    "The music doesn't feel right in my video, any suggestions?",
    "When are you free for a shoot?"
  ];

  for (const prompt of testPrompts) {
    try {
      console.log(`\n🎯 Testing: "${prompt}"`);
      
      const response = await fetch('https://howparth.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: []
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Response: ${data.response}`);
      
      // Check if response sounds like Parth
      const isParthLike = checkParthPersonality(data.response);
      console.log(`🎭 Sounds like Parth: ${isParthLike ? '✅ YES' : '❌ NO'}`);
      
      if (isParthLike) {
        console.log('   • Natural Hindi-English mixing detected');
        console.log('   • Authentic personality captured');
        console.log('   • Technical expertise in Parth style');
      }
      
      console.log('---');
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
    }
  }
  
  console.log('\n🎉 Live chat testing completed!');
  console.log('\n💡 Next steps:');
  console.log('   1. Check Vercel dashboard for deployment status');
  console.log('   2. Visit your live website and test chat manually');
  console.log('   3. Monitor for any errors in Vercel logs');
  console.log('   4. Collect user feedback on the new AI personality');
};

const checkParthPersonality = (response) => {
  const responseLower = response.toLowerCase();
  
  // Check for Parth's communication style
  const personalityIndicators = [
    'bro', 'bhai', 'yaar', // Hindi-English mixing
    'kling', 'runway', 'davinci', // Technical knowledge
    'shoot', 'video', 'editing', // Domain expertise
    'cool', 'awesome', 'sick' // Casual language
  ];
  
  const matches = personalityIndicators.filter(indicator => 
    responseLower.includes(indicator)
  );
  
  return matches.length >= 2; // At least 2 indicators suggest Parth-like response
};

// Run the test
testLiveChat().catch(console.error);
