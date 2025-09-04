import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FloatingEmojis from '../components/FloatingEmojis';
import { Search, Grid, List, ArrowLeft, Sparkles, Clock, Play, X } from 'lucide-react';

const Projects: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isNotified, setIsNotified] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const handleNotifyMe = () => {
    setIsNotified(true);
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Project Update', {
        body: `You'll be notified when ${selectedProject} is ready!`,
        icon: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Project Update', {
            body: `You'll be notified when ${selectedProject} is ready!`,
            icon: '/favicon.ico'
          });
        }
      });
    }
    
    // Show success message
    setTimeout(() => {
      alert(`🎉 Great! You'll be notified when ${selectedProject} is ready to launch!`);
    }, 100);
  };

  const projects = [
    {
      id: 1,
      title: 'AI-Powered E-commerce Platform',
      description: 'A comprehensive e-commerce solution with AI-driven product recommendations, chatbot customer service, and intelligent inventory management.',
      image: '/api/placeholder/400/300',
      technologies: ['React', 'Node.js', 'TensorFlow', 'MongoDB', 'AWS'],
      liveUrl: 'https://example.com',
      instagramUrl: 'https://instagram.com/howparth',
      category: 'ai' as const,
      featured: true,
    },
    {
      id: 4,
      title: 'Real-time Chat Application',
      description: 'Modern chat platform with real-time messaging, file sharing, and video calling capabilities.',
      image: '/api/placeholder/400/300',
      technologies: ['React', 'Socket.io', 'Express', 'MongoDB', 'WebRTC'],
      liveUrl: 'https://example.com',
      instagramUrl: 'https://instagram.com/howparth',
      category: 'web' as const,
      featured: false,
    },
    {
      id: 5,
      title: 'AI Content Generator',
      description: 'Intelligent content creation tool that generates high-quality articles, social media posts, and marketing copy.',
      image: '/api/placeholder/400/300',
      technologies: ['Python', 'OpenAI API', 'FastAPI', 'React', 'PostgreSQL'],
      liveUrl: 'https://example.com',
      instagramUrl: 'https://instagram.com/howparth',
      category: 'ai' as const,
      featured: false,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Projects', count: projects.length },
    { id: 'ai', name: 'AI & ML', count: projects.filter(p => p.category === 'ai').length },
    { id: 'web', name: 'Web Apps', count: projects.filter(p => p.category === 'web').length },
    { id: 'videos', name: 'Product Videos', count: 1 },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // VideoCard Component
  const VideoCard: React.FC<{ video: any; index: number }> = ({ video, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
      onClick={() => setSelectedVideo(video)}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start space-x-4">
        <div className="relative w-16 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          <div className="text-white text-lg">
            {video.thumbnail}
          </div>
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-red-300 transition-colors">
            {video.title}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2 mb-2">
            {video.description}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>⏱️ {video.duration}</span>
            <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
              {video.type}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-16 bg-black relative overflow-hidden">
      
      {/* Floating Emojis in 3D Space */}
      <FloatingEmojis />
      
      {/* Hero Section */}
      <section className="section-padding bg-black relative overflow-hidden">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A showcase of innovative projects that demonstrate my expertise in AI, 
              full-stack development, and creating impactful digital solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="section-padding bg-black border-b border-white/20">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-center justify-between">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative flex-1 max-w-md w-full"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-all bg-black/50 text-white placeholder-gray-400"
              />
            </motion.div>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-wrap gap-1 md:gap-2 justify-center lg:justify-start"
            >
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-black text-white'
                      : 'bg-black/20 text-white hover:bg-white/10 border border-white/20'
                  }`}
                >
                  {category.name} ({category.count})
                </motion.button>
              ))}
            </motion.div>

            {/* View Mode Toggle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-2 bg-black/20 rounded-lg p-1 border border-white/20"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-white hover:text-gray-300'
                }`}
              >
                <Grid className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-white hover:text-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Boxes */}
      <section className="section-padding bg-black">
        <div className="container-custom">
          {selectedCategory === 'videos' ? (
            /* Videos Only View */
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Product Videos
                  </h2>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-4">
                  {/* Video Items */}
                  {[
                    {
                      id: 1,
                      title: "Perfume Sample Video",
                      description: "A sample video showcasing perfume content and presentation",
                      duration: "0:31",
                      videoUrl: "/videos/perfume sample.mp4",
                      thumbnail: "🎬",
                      thumbnailImage: "/thumbnails/perfume-thumbnail.jpg",
                      type: "commercial"
                    }
                  ].map((video, index) => (
                    <VideoCard key={video.id} video={video} index={index} />
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            /* Regular Projects View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            
            {/* Currently Working Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Currently Working
                </h2>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-4">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onClick={() => setSelectedProject(project.title)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="text-white text-lg font-bold">
                          {project.category === 'ai' ? '🤖' : project.category === 'web' ? '🌐' : '📱'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-purple-300 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <span key={tech} className="px-2 py-1 bg-white/10 text-white text-xs rounded-full">
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Product Videos Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Product Videos
                </h2>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-4">
                {/* Video Items */}
                {[
                  {
                    id: 1,
                    title: "Perfume Sample Video",
                    description: "A sample video showcasing perfume content and presentation",
                    duration: "0:31",
                    videoUrl: "/videos/perfume sample.mp4", // Your uploaded video
                    thumbnail: "🎬",
                    thumbnailImage: "/thumbnails/perfume-thumbnail.jpg", // Custom thumbnail image
                    type: "commercial"
                  }
                ].map((video, index) => (
                  <VideoCard key={video.id} video={video} index={index} />
                ))}
              </div>
            </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Premium Coming Soon Page */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring", damping: 20 }}
            className="relative w-full max-w-4xl mx-auto mt-8 mb-8"
          >
            {/* Dynamic Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                {/* Floating Orbs */}
                <motion.div
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-xl"
                />
                <motion.div
                  animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    scale: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded-full blur-xl"
                />
                <motion.div
                  animate={{
                    x: [0, 60, 0],
                    y: [0, -40, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-xl"
                />
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
                
                {/* Radial Gradient Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
              </div>

              {/* Content */}
              <div className="relative z-10 p-4 md:p-6 lg:p-8 text-center flex flex-col justify-start">
                {/* Back Button */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-6 left-6 flex items-center space-x-2 text-white/80 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Back to Projects</span>
                </motion.button>

                {/* Main Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4 mt-6"
                >
                  {/* Project Icon */}
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <Sparkles className="w-12 h-12 text-white" />
                  </motion.div>

                  {/* Project Title */}
                  <div>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
                      {selectedProject}
                    </h1>
                    <div className="flex items-center justify-center space-x-2 text-white/80">
                      <Clock className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-base md:text-lg font-medium">Coming Soon</span>
                    </div>
                  </div>

                  {/* Coming Soon Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-2xl mx-auto"
                  >
                    <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-6">
                      We're crafting something extraordinary! This project is currently in development and will launch soon with cutting-edge features and premium quality.
                    </p>
                    
                    {/* Progress Indicator */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-white/70">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm">In Active Development</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          transition={{ duration: 2, delay: 0.8 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4"
                  >
                    <motion.button
                      whileHover={{ scale: isNotified ? 1 : 1.05, y: isNotified ? 0 : -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNotifyMe}
                      disabled={isNotified}
                      className={`px-6 md:px-8 py-3 md:py-4 font-semibold rounded-xl shadow-xl transition-all duration-300 text-sm md:text-base ${
                        isNotified 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-not-allowed' 
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-2xl'
                      }`}
                    >
                      {isNotified ? '✅ You\'ll Be Notified!' : 'Notify Me When Ready'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedProject(null)}
                      className="px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 text-sm md:text-base"
                    >
                      Explore Other Projects
                    </motion.button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Professional Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring", damping: 20 }}
            className="relative w-full max-w-6xl mx-auto"
          >
            {/* Video Container */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Video Player */}
              <div className="relative w-full aspect-video">
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  poster={selectedVideo.thumbnailImage || `/thumbnails/perfume-thumbnail.jpg`}
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Info */}
              <div className="p-6 bg-gradient-to-r from-gray-900 to-black">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedVideo.title}
                    </h2>
                    <p className="text-gray-300 mb-4">
                      {selectedVideo.description}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedVideo.duration}</span>
                      </span>
                      <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
                        {selectedVideo.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* CTA Section */}
      <section className="section-padding bg-black">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Have a{' '}
              <span className="text-white">
                Project in Mind?
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Let's collaborate to bring your ideas to life with cutting-edge technology 
              and innovative solutions.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black hover:bg-gray-200 font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black shadow-lg hover:shadow-xl"
            >
              Start a Project
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Projects;
