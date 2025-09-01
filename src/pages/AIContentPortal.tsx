import React, { useState } from 'react';

const AIContentPortal = () => {
  const [selectedContentType, setSelectedContentType] = useState('video_prompts');
  const [selectedPlatform, setSelectedPlatform] = useState('runway');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('commercial');
  const [tone, setTone] = useState('cinematic');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  const contentTypes = {
    video_prompts: 'Video Generation Prompts',
    image_prompts: 'Image Generation Prompts', 
    json_prompts: 'JSON Video Prompts',
    motion_prompts: 'Motion Graphics Prompts',
    commercial_prompts: 'Commercial Video Prompts'
  };

  const platforms = {
    runway: 'Runway ML',
    luma: 'Luma AI', 
    kling: 'Kling AI',
    sora: 'OpenAI Sora',
    veo: 'Google Veo',
    midjourney: 'Midjourney',
    dalle: 'DALL-E 3',
    ideogram: 'Ideogram',
    flux: 'Flux'
  };

  const generateContent = async () => {
    // Simple content generation based on type and platform
    let content = '';
    
    if (selectedContentType === 'video_prompts') {
      content = `Video Prompt for ${selectedPlatform}:\n\nTopic: ${topic}\nStyle: ${tone}\nAudience: ${targetAudience}\n\n${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}`;
    } else if (selectedContentType === 'image_prompts') {
      content = `Image Prompt for ${selectedPlatform}:\n\nSubject: ${topic}\nStyle: ${tone}\nTarget: ${targetAudience}\n\n${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}`;
    } else {
      content = `Generated content for ${selectedContentType} using ${selectedPlatform}:\n\nTopic: ${topic}\nStyle: ${tone}\nAudience: ${targetAudience}\n\n${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}`;
    }
    
    setGeneratedContent(content);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            AI Video & Image Generation Portal
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Create professional video and image prompts for Runway, Luma, Kling, Sora, Midjourney, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-white">Video & Image Prompt Generation</h2>
              
              {/* Content Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
                <select 
                  value={selectedContentType}
                  onChange={(e) => setSelectedContentType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.entries(contentTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Platform</label>
                <select 
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.entries(platforms).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Topic Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Topic/Idea</label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your topic or idea..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white h-24 resize-none"
                  style={{ 
                    outline: 'none',
                    position: 'relative',
                    zIndex: 1000
                  }}
                />
              </div>

              {/* Target Audience */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                <select 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="commercial">Commercial/Advertising</option>
                  <option value="cinematic">Cinematic/Film</option>
                  <option value="social_media">Social Media Content</option>
                  <option value="product">Product Showcase</option>
                  <option value="artistic">Artistic/Creative</option>
                </select>
              </div>

              {/* Tone Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="cinematic">Cinematic</option>
                  <option value="commercial">Commercial</option>
                  <option value="artistic">Artistic</option>
                  <option value="realistic">Realistic</option>
                  <option value="dramatic">Dramatic</option>
                </select>
              </div>

              {/* Additional Instructions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Additional Instructions</label>
                <textarea 
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="Any specific requirements or constraints..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white h-20 resize-none"
                  style={{ 
                    outline: 'none',
                    position: 'relative',
                    zIndex: 1000
                  }}
                />
              </div>

              {/* Generate Button */}
              <button 
                onClick={generateContent}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Generate Content
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 h-full">
              <h2 className="text-2xl font-bold mb-6 text-white">Generated Content</h2>
              
              <div className="h-96 overflow-y-auto">
                {generatedContent ? (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                      {generatedContent}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-lg">Generated content will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentPortal;
