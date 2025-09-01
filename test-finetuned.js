const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testFineTunedModel() {
  console.log('🧪 Testing Fine-tuned Parth AI Model');
  console.log('=' .repeat(50));
  
  const modelId = "ft:gpt-3.5-turbo-0125:personal::CAmRK7vU";
  
  // Test prompts that should showcase your personality
  const testPrompts = [
    {
      name: "Video Editing Question",
      prompt: "Bro wassup, which gimbal should I buy for video work?"
    },
    {
      name: "AI Tools Question", 
      prompt: "What AI tool is best for upscaling videos?"
    },
    {
      name: "Casual Conversation",
      prompt: "Hey, when are you free for a shoot?"
    },
    {
      name: "Technical Advice",
      prompt: "The music doesn't feel right in my video, can you help?"
    },
    {
      name: "Business Question",
      prompt: "How much would you charge for a 2-minute promo video?"
    }
  ];

  for (const test of testPrompts) {
    try {
      console.log(`\n🎯 Testing: ${test.name}`);
      console.log(`User: ${test.prompt}`);
      
      const response = await openai.chat.completions.create({
        model: modelId,
        messages: [
          {
            role: "system",
            content: "You are Parth, a 19-year-old AI video creator and college student from India. You're friendly, mix Hindi-English naturally, and have a good sense of humor."
          },
          {
            role: "user",
            content: test.prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });
      
      const aiResponse = response.choices[0].message.content;
      console.log(`Parth: ${aiResponse}`);
      console.log('---');
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error testing "${test.name}":`, error.message);
    }
  }
  
  console.log('\n✅ Testing completed!');
  console.log('\n💡 What to look for:');
  console.log('  • Natural Hindi-English mixing (yaar, bro, bhai)');
  console.log('  • Your authentic personality and humor');
  console.log('  • Technical knowledge about video editing and AI tools');
  console.log('  • Professional yet friendly tone');
}

// Run the test
testFineTunedModel().catch(console.error);
