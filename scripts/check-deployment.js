#!/usr/bin/env node

/**
 * Deployment Status Checker
 * Verifies that the fine-tuned model is properly deployed and working
 */

const checkDeploymentStatus = async () => {
  console.log('🔍 Checking Deployment Status');
  console.log('=' .repeat(50));
  
  try {
    // Check if the website is accessible
    console.log('🌐 Checking website accessibility...');
    const websiteResponse = await fetch('https://howparth.vercel.app');
    
    if (websiteResponse.ok) {
      console.log('✅ Website is accessible');
    } else {
      console.log(`⚠️  Website returned status: ${websiteResponse.status}`);
    }
    
    // Check if the chat API is working
    console.log('\n💬 Testing chat API...');
    const chatResponse = await fetch('https://howparth.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Hey bro, test message",
        conversationHistory: []
      })
    });
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Chat API is working');
      console.log(`📝 Response: ${chatData.response}`);
      
      // Check if it's using the fine-tuned model
      const isUsingFineTunedModel = checkIfUsingFineTunedModel(chatData.response);
      console.log(`🎯 Using fine-tuned model: ${isUsingFineTunedModel ? '✅ YES' : '❌ NO'}`);
      
    } else {
      console.log(`❌ Chat API error: ${chatResponse.status}`);
    }
    
    // Check environment variables
    console.log('\n🔧 Checking environment configuration...');
    console.log('✅ This script assumes environment variables are set in Vercel');
    console.log('   Check Vercel Dashboard → Settings → Environment Variables');
    
    // Display next steps
    displayNextSteps();
    
  } catch (error) {
    console.error('❌ Deployment check failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check Vercel dashboard for deployment status');
    console.log('   2. Verify environment variables are set');
    console.log('   3. Check Vercel function logs for errors');
    console.log('   4. Ensure the fine-tuned model ID is correct');
  }
};

const checkIfUsingFineTunedModel = (response) => {
  // This is a basic check - in production you'd want more sophisticated detection
  const responseLower = response.toLowerCase();
  
  // Look for indicators that suggest the fine-tuned model is working
  const fineTunedIndicators = [
    'bro', 'bhai', 'yaar', // Hindi-English mixing
    'kling', 'runway', 'davinci', // Technical knowledge
    'shoot', 'video', 'editing', // Domain expertise
    'cool', 'awesome', 'sick' // Casual language
  ];
  
  const matches = fineTunedIndicators.filter(indicator => 
    responseLower.includes(indicator)
  );
  
  return matches.length >= 2; // At least 2 indicators suggest fine-tuned model
};

const displayNextSteps = () => {
  console.log('\n🎯 Next Steps:');
  console.log('1. Visit your live website and test the chat manually');
  console.log('2. Try these test conversations:');
  console.log('   • "Hey bro, which AI tool should I use for videos?"');
  console.log('   • "Can you help me with video editing pricing?"');
  console.log('   • "What gimbal do you recommend for reels?"');
  console.log('3. Monitor Vercel logs for any errors');
  console.log('4. Collect user feedback on the new AI personality');
  console.log('5. Run performance monitoring: node scripts/monitor-ai-performance.js');
  
  console.log('\n🚀 Your fine-tuned Parth AI should now be live!');
  console.log('   Users will experience your authentic personality and expertise.');
};

// Run the deployment check
checkDeploymentStatus().catch(console.error);
