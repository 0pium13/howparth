import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Instagram, Eye, Code, Globe, Smartphone } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  instagramUrl?: string;
  category: 'web' | 'mobile' | 'ai' | 'other';
  featured?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  image,
  technologies,
  liveUrl,
  instagramUrl,
  category,
  featured = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const categoryIcons = {
    web: <Globe className="w-4 h-4" />,
    mobile: <Smartphone className="w-4 h-4" />,
    ai: <Code className="w-4 h-4" />,
    other: <Code className="w-4 h-4" />,
  };

  // const categoryColors = {
  //   web: 'bg-blue-100 text-blue-700 border border-blue-200',
  //   mobile: 'bg-green-100 text-green-700 border border-green-200',
  //   ai: 'bg-purple-100 text-purple-700 border border-purple-200',
  //   other: 'bg-gray-100 text-gray-700 border border-gray-200',
  // };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`card overflow-hidden group border-2 border-gradient-to-r from-purple-500 to-blue-500 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col ${featured ? 'ring-2 ring-custom-gold' : ''}`}
    >
      {/* Premium Apple Music Style Thumbnail */}
      <div className="relative overflow-hidden h-48 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ 
            rotate: isHovered ? 360 : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full backdrop-blur-md"
        />
        <motion.div
          animate={{ 
            y: isHovered ? [-10, 10, -10] : [0, 0, 0],
            scale: isHovered ? 1.2 : 1
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-6 w-12 h-12 bg-white/15 rounded-full backdrop-blur-md"
        />
        
        {/* Main Content */}
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full h-full flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: isHovered ? 1.2 : 1,
                rotate: isHovered ? 5 : 0
              }}
              transition={{ duration: 0.3 }}
              className="w-20 h-20 mx-auto mb-3 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30"
            >
              <div className="text-4xl text-white drop-shadow-lg">
                {categoryIcons[category]}
              </div>
            </motion.div>
            <div className="text-white/90 text-sm font-medium tracking-wider uppercase">
              {category}
            </div>
          </div>
        </motion.div>

        {/* Premium Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg">
            <div className="w-3 h-3 bg-white/30 rounded-full" />
            <span className="capitalize tracking-wider font-semibold">{category}</span>
          </span>
        </div>

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 right-4 z-20">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white shadow-xl backdrop-blur-md border border-white/20">
              <div className="w-2 h-2 bg-white/50 rounded-full mr-2 animate-pulse" />
              Featured
            </span>
          </div>
        )}

        {/* Premium Overlay with Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent flex items-center justify-center space-x-6 backdrop-blur-sm"
        >
          {liveUrl && (
            <motion.a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
            >
              <ExternalLink className="w-5 h-5" />
            </motion.a>
          )}
          
          {instagramUrl && (
            <motion.a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
            >
              <Instagram className="w-5 h-5" />
            </motion.a>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl font-bold text-black mb-2"
          >
            {title}
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-700 leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        {/* Technologies */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          {technologies.map((tech, index) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium border border-purple-200"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex space-x-3 pt-2"
        >
          {liveUrl && (
            <motion.a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Live</span>
            </motion.a>
          )}
          
          {instagramUrl && (
            <motion.a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span>View Profile</span>
            </motion.a>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
