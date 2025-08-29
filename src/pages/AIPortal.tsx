import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, FileText, Target, Zap, Send, Download, Mic, MicOff, Users, Share2, Volume2, VolumeX } from 'lucide-react';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ContentGenerationRequest {
  contentType: string;
  topic: string;
  audience: string;
  tone: string;
  instructions: string;
}

interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  metadata: {
    contentType: string;
    audience: string;
    tone: string;
    wordCount: number;
    qualityScore: number;
    generatedAt: string;
  };
  audioUrl?: string;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  cursor: { x: number; y: number };
  isTyping: boolean;
}

const AIPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('blogs');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [formData, setFormData] = useState<ContentGenerationRequest>({
    contentType: 'blog-post',
    topic: '',
    audience: 'general',
    tone: 'professional',
    instructions: ''
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setFormData(prev => ({
              ...prev,
              instructions: prev.instructions + ' ' + finalTranscript
            }));
          }
        };
      }
    }
  }, []);

  const handleInputChange = (field: keyof ContentGenerationRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to AI service
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockContent: GeneratedContent = {
        id: Date.now().toString(),
        title: `AI-Generated ${formData.contentType.replace('-', ' ')}: ${formData.topic}`,
        content: `This is a comprehensive ${formData.contentType.replace('-', ' ')} about ${formData.topic}. 
        
        The content is tailored for a ${formData.audience} audience and written in a ${formData.tone} tone. 
        
        Key points covered:
        • Introduction to ${formData.topic}
        • Detailed analysis and insights
        • Practical applications and examples
        • Best practices and recommendations
        • Future trends and considerations
        
        This content demonstrates the power of AI-driven content creation, combining human creativity with machine intelligence to produce high-quality, engaging material that resonates with target audiences.`,
        metadata: {
          contentType: formData.contentType,
          audience: formData.audience,
          tone: formData.tone,
          wordCount: 150,
          qualityScore: 92,
          generatedAt: new Date().toISOString()
        }
      };

      setGeneratedContent(mockContent);
      
      // Generate voice if enabled
      if (voiceEnabled) {
        await generateVoice(mockContent.content);
      }
      
    } catch (error) {
      console.error('Content generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVoice = async (text: string) => {
    try {
      // Simulate ElevenLabs API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock audio URL (in production, this would be from ElevenLabs)
      const audioUrl = `data:audio/mp3;base64,mock-audio-data-${Date.now()}`;
      
      setGeneratedContent(prev => prev ? {
        ...prev,
        audioUrl
      } : null);
      
    } catch (error) {
      console.error('Voice generation failed:', error);
    }
  };

  const playAudio = () => {
    if (audioRef.current && generatedContent?.audioUrl) {
      audioRef.current.src = generatedContent.audioUrl;
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
    }
  };

  const startCollaboration = () => {
    setIsCollaborating(true);
    // Simulate adding collaborators
    setCollaborators([
      { id: '1', name: 'Alice', avatar: 'A', cursor: { x: 100, y: 200 }, isTyping: false },
      { id: '2', name: 'Bob', avatar: 'B', cursor: { x: 300, y: 150 }, isTyping: true }
    ]);
  };

  const stopCollaboration = () => {
    setIsCollaborating(false);
    setCollaborators([]);
  };

  const downloadContent = () => {
    if (generatedContent) {
      const blob = new Blob([generatedContent.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedContent.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const tabs = [
    { id: 'blogs', name: 'Blogs', icon: FileText },
    { id: 'strategy', name: 'Strategy', icon: Target },
    { id: 'quality', name: 'Quality', icon: Brain }
  ];

  const contentTypes = [
    { value: 'blog-post', label: 'Blog Post' },
    { value: 'article', label: 'Article' },
    { value: 'social-media', label: 'Social Media Post' },
    { value: 'email', label: 'Email Newsletter' },
    { value: 'report', label: 'Report' }
  ];

  const audiences = [
    { value: 'general', label: 'General Public' },
    { value: 'technical', label: 'Technical Audience' },
    { value: 'business', label: 'Business Professionals' },
    { value: 'academic', label: 'Academic' }
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'conversational', label: 'Conversational' }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AI Content Creation Portal
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Transform your ideas into compelling content with AI-powered generation, voice synthesis, and real-time collaboration.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300"
          >
            <Brain className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">AI-Powered Content Generation</h3>
            <p className="text-gray-400">
              Generate high-quality content tailored to your audience and brand voice using advanced AI models.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300"
          >
            <Volume2 className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Voice Generation</h3>
            <p className="text-gray-400">
              Convert your content into natural-sounding audio using ElevenLabs AI voice synthesis technology.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300"
          >
            <Users className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Real-time Collaboration</h3>
            <p className="text-gray-400">
              Work together with your team in real-time with live cursors, typing indicators, and instant updates.
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content Generation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Content Generation</h2>
            
            <div className="space-y-6">
              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content Type
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) => handleInputChange('contentType', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder="Enter your topic..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Audience
                </label>
                <select
                  value={formData.audience}
                  onChange={(e) => handleInputChange('audience', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {audiences.map((audience) => (
                    <option key={audience.value} value={audience.value}>
                      {audience.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => handleInputChange('tone', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {tones.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                      {tone.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Instructions
                </label>
                <div className="relative">
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    placeholder="Describe your content requirements..."
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                  <button
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`absolute bottom-3 right-3 p-2 rounded-lg transition-colors duration-300 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                {isRecording && (
                  <p className="text-sm text-red-400 mt-2">Recording... Speak now</p>
                )}
              </div>

              {/* Voice Generation Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="voice-enabled"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                />
                <label htmlFor="voice-enabled" className="text-sm font-medium text-gray-300">
                  Generate voice audio
                </label>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateContent}
                disabled={isGenerating || !formData.topic}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Generate Content</span>
                  </>
                )}
              </button>

              {/* Collaboration Button */}
              <button
                onClick={isCollaborating ? stopCollaboration : startCollaboration}
                className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isCollaborating
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>{isCollaborating ? 'Stop Collaboration' : 'Start Collaboration'}</span>
              </button>
            </div>
          </motion.div>

          {/* Generated Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Generated Content</h2>
            
            {generatedContent ? (
              <div className="space-y-6">
                {/* Content Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{generatedContent.title}</h3>
                  <div className="flex items-center space-x-2">
                    {generatedContent.audioUrl && (
                      <button
                        onClick={isAudioPlaying ? stopAudio : playAudio}
                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-300"
                      >
                        {isAudioPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={downloadContent}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-300"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Word Count</p>
                    <p className="text-2xl font-bold">{generatedContent.metadata.wordCount}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Quality Score</p>
                    <p className="text-2xl font-bold text-green-400">{generatedContent.metadata.qualityScore}%</p>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-gray-800/50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {generatedContent.content}
                  </p>
                </div>

                {/* Audio Player */}
                {generatedContent.audioUrl && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-3">Audio Version</h4>
                    <audio
                      ref={audioRef}
                      controls
                      className="w-full"
                      onPlay={() => setIsAudioPlaying(true)}
                      onPause={() => setIsAudioPlaying(false)}
                      onEnded={() => setIsAudioPlaying(false)}
                    >
                      <source src={generatedContent.audioUrl} type="audio/mp3" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Generated content will appear here</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Collaboration Cursors */}
        <AnimatePresence>
          {isCollaborating && collaborators.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50"
            >
              {collaborators.map((collaborator) => (
                <motion.div
                  key={collaborator.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  style={{
                    position: 'absolute',
                    left: collaborator.cursor.x,
                    top: collaborator.cursor.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {collaborator.avatar}
                  </div>
                  <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm">
                    {collaborator.name}
                    {collaborator.isTyping && (
                      <span className="ml-2 text-purple-400">typing...</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold mb-8">Recent Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold mb-2">Sample Content {item}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  This is a sample of previously generated content...
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Blog Post</span>
                  <span>2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIPortal;
