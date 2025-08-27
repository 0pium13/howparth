import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '../components/ProjectCard';
import FloatingEmojis from '../components/FloatingEmojis';
import { Search, Grid, List } from 'lucide-react';

const Projects: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
      id: 2,
      title: 'Smart Healthcare Dashboard',
      description: 'Real-time healthcare monitoring system with predictive analytics for patient care and resource optimization.',
      image: '/api/placeholder/400/300',
      technologies: ['Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
      liveUrl: 'https://example.com',
      instagramUrl: 'https://instagram.com/howparth',
      category: 'ai' as const,
      featured: true,
    },
    {
      id: 3,
      title: 'Mobile Banking App',
      description: 'Secure and intuitive mobile banking application with biometric authentication and real-time transaction monitoring.',
      image: '/api/placeholder/400/300',
      technologies: ['React Native', 'TypeScript', 'Node.js', 'Redis', 'Stripe'],
      liveUrl: 'https://example.com',
      instagramUrl: 'https://instagram.com/howparth',
      category: 'mobile' as const,
      featured: false,
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
    {
      id: 6,
      title: 'E-learning Platform',
      description: 'Comprehensive online learning platform with interactive courses, progress tracking, and AI-powered recommendations.',
      image: '/api/placeholder/400/300',
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'AWS S3'],
      liveUrl: 'https://example.com',
      instagramUrl: 'https://instagram.com/howparth',
      category: 'web' as const,
      featured: false,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Projects', count: projects.length },
    { id: 'ai', name: 'AI & ML', count: projects.filter(p => p.category === 'ai').length },
    { id: 'web', name: 'Web Apps', count: projects.filter(p => p.category === 'web').length },
    { id: 'mobile', name: 'Mobile Apps', count: projects.filter(p => p.category === 'mobile').length },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-16 bg-custom-background relative overflow-hidden">
      {/* Purple Glow Chunks */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-purple-500/50 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              zIndex: Math.floor(Math.random() * 10),
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.6, 0.5],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Floating Emojis in 3D Space */}
      <FloatingEmojis />
      
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-custom-background via-custom-secondary to-custom-background relative overflow-hidden">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-custom-text">
              My{' '}
              <span className="text-custom-accent">
                Projects
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A showcase of innovative projects that demonstrate my expertise in AI, 
              full-stack development, and creating impactful digital solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="section-padding bg-custom-secondary border-b border-custom-accent/30">
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
                className="w-full pl-10 pr-4 py-3 border border-custom-accent/30 rounded-lg focus:ring-2 focus:ring-custom-accent focus:border-transparent transition-all bg-custom-background/50 text-custom-text placeholder-gray-400"
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
                      : 'bg-black/20 text-white hover:bg-black/40 border border-white/20'
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

      {/* Projects Grid */}
      <section className="section-padding bg-secondary-50">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            {filteredProjects.length > 0 ? (
              <motion.div
                key={`${selectedCategory}-${searchTerm}-${viewMode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'
                    : 'space-y-4 md:space-y-6'
                }
              >
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={viewMode === 'list' ? 'w-full' : ''}
                  >
                    <ProjectCard
                      title={project.title}
                      description={project.description}
                      image={project.image}
                      technologies={project.technologies}
                      liveUrl={project.liveUrl}
                      instagramUrl={project.instagramUrl}
                      category={project.category}
                      featured={project.featured}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-secondary-400" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-2">No projects found</h3>
                <p className="text-secondary-600">
                  Try adjusting your search terms or filter criteria.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Have a{' '}
              <span className="text-primary-200">
                Project in Mind?
              </span>
            </h2>
            <p className="text-xl text-white/90">
              Let's collaborate to bring your ideas to life with cutting-edge technology 
              and innovative solutions.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white hover:bg-gray-800 font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
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
