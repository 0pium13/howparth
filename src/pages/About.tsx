import React from 'react';
import { motion, useInView } from 'framer-motion';
import AnimatedText from '../components/AnimatedText';
import FloatingEmojis from '../components/FloatingEmojis';

import { 
  Brain, 
  Zap, 
  Award, 
  Users, 
  Star,
  CheckCircle,
  Play,
  Palette,
  Video,
  Sparkles
} from 'lucide-react';

const About: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.2,
    margin: '-100px 0px -100px 0px'
  });

  const skills = [
    { name: 'ChatGPT & AI Tools', level: 95, icon: <Brain className="w-5 h-5" />, color: 'from-blue-500 to-purple-600' },
    { name: 'Midjourney & Stable Diffusion', level: 90, icon: <Palette className="w-5 h-5" />, color: 'from-purple-500 to-blue-600' },
    { name: 'DaVinci Resolve', level: 88, icon: <Video className="w-5 h-5" />, color: 'from-orange-500 to-red-600' },
    { name: 'RunwayML & AI Video', level: 85, icon: <Play className="w-5 h-5" />, color: 'from-green-500 to-teal-600' },
    { name: 'Content Automation', level: 92, icon: <Zap className="w-5 h-5" />, color: 'from-yellow-500 to-orange-600' },
    { name: 'Creative Workflows', level: 87, icon: <Sparkles className="w-5 h-5" />, color: 'from-pink-500 to-purple-600' },
  ];

  const aiTools = [
    {
      name: 'Midjourney',
      category: 'Image AI',
      description: 'AI art generation',
      proficiency: 95
    },
    {
      name: 'Stable Diffusion',
      category: 'Image AI',
      description: 'Open source image generation',
      proficiency: 92
    },
    {
      name: 'RunwayML',
      category: 'Video AI',
      description: 'AI video editing',
      proficiency: 90
    },
    {
      name: 'DALL-E',
      category: 'Image AI',
      description: 'Creative image generation',
      proficiency: 88
    },
    {
      name: 'Jasper',
      category: 'Content AI',
      description: 'AI copywriting',
      proficiency: 87
    },
    {
      name: 'Copy.ai',
      category: 'Content AI',
      description: 'Marketing copy generation',
      proficiency: 85
    },
    {
      name: 'Synthesia',
      category: 'Video AI',
      description: 'AI video creation',
      proficiency: 86
    },
    {
      name: 'Descript',
      category: 'Audio AI',
      description: 'Audio editing & transcription',
      proficiency: 89
    },
    {
      name: 'Murf.ai',
      category: 'Audio AI',
      description: 'Text-to-speech synthesis',
      proficiency: 84
    },
    {
      name: 'ElevenLabs',
      category: 'Audio AI',
      description: 'Voice cloning & synthesis',
      proficiency: 91
    },
    {
      name: 'HeyGen',
      category: 'Video AI',
      description: 'AI avatar videos',
      proficiency: 82
    },
    {
      name: 'Pictory',
      category: 'Video AI',
      description: 'Video summarization',
      proficiency: 80
    },
    {
      name: 'InVideo',
      category: 'Video AI',
      description: 'AI video templates',
      proficiency: 78
    },
    {
      name: 'Lumen5',
      category: 'Video AI',
      description: 'Content to video',
      proficiency: 85
    },
    {
      name: 'Canva AI',
      category: 'Design AI',
      description: 'AI design assistant',
      proficiency: 88
    },
    {
      name: 'Adobe Firefly',
      category: 'Design AI',
      description: 'Creative AI suite',
      proficiency: 86
    },
    {
      name: 'Leonardo.ai',
      category: 'Image AI',
      description: '3D & concept art',
      proficiency: 83
    },
    {
      name: 'ChatGPT',
      category: 'Text AI',
      description: 'Advanced language model',
      proficiency: 93
    }
  ];

  const timeline = [
    {
      year: '2023 - Present',
      title: 'AI Creative Specialist & Consultant',
      company: 'Freelance & Client Projects',
      description: 'Leading comprehensive AI content creation projects, mastering 50+ AI tools, and delivering innovative solutions for global clients.',
      achievements: [
        'Mastered 50+ AI tools across text, image, video, and audio generation',
        'Created 200+ AI-generated assets for diverse client portfolios',
        'Increased client ROI by 300% through AI automation workflows',
        'Developed custom AI training programs for creative teams'
      ]
    },
    {
      year: '2022 - 2023',
      title: 'AI Content Creator & Automation Specialist',
      company: 'Digital Content Agency',
      description: 'Specialized in AI-powered content creation, automation workflows, and creative process optimization for enterprise clients.',
      achievements: [
        'Developed comprehensive AI automation workflows for content production',
        'Created viral AI-generated content reaching 1M+ impressions',
        'Built client portfolio of 50+ successful AI projects',
        'Implemented AI tools reducing content creation time by 70%'
      ]
    },
    {
      year: '2021 - 2022',
      title: 'Digital Content Creator',
      company: 'Creative Agency',
      description: 'Started journey into AI technology, learning foundational tools and exploring creative applications in digital content.',
      achievements: [
        'Learned first AI tools including ChatGPT and Midjourney',
        'Created initial AI-generated content for social media campaigns',
        'Built foundational skills in AI-assisted creative workflows',
        'Completed 20+ AI tool certifications and courses'
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechFlow Solutions",
      content: "Parth's AI expertise transformed our content strategy. His mastery of 50+ AI tools helped us create engaging content 10x faster while maintaining quality.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Creative Director",
      company: "Innovate Studios",
      content: "Working with Parth was a game-changer. His DaVinci Resolve skills combined with AI tools created stunning videos that exceeded our expectations.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Founder",
      company: "StartupXYZ",
      content: "Parth's AI automation workflows saved us countless hours. His creative approach to AI implementation is truly innovative and effective.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen pt-16 bg-black relative overflow-hidden">
      {/* Purple Theme Background with 3D Space */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {/* Purple Glow Chunks */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              zIndex: Math.floor(Math.random() * 5),
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10 + i * 0.8,
              repeat: Infinity,
              delay: i * 1.2,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Background Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(147, 51, 234, 0.1) 100%)',
            zIndex: 2
          }}
        />
        
        {/* Floating Geometric Elements */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              zIndex: Math.floor(Math.random() * 3),
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Floating Emojis in 3D Space */}
      <div style={{ zIndex: 3 }}>
        <FloatingEmojis />
      </div>
      
      {/* Hero Section */}
      <section className="py-16 bg-black relative overflow-hidden" style={{ zIndex: 10 }}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 text-center"
            >
              <div className="inline-flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI Creative Specialist</span>
              </div>
              
              <div className="space-y-3">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-5xl md:text-7xl font-bold leading-tight font-accent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent text-center"
                >
                  Meet Parth
                </motion.h1>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-3xl md:text-5xl font-bold leading-tight font-accent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent text-center"
                >
                  AI Creative Specialist
                </motion.h2>
              </div>
              
              <div className="max-w-4xl mx-auto space-y-3">
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  Master of <span className="text-white font-semibold">50+ AI tools</span> including ChatGPT, Midjourney, Stable Diffusion, and RunwayML.
                </p>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  DaVinci Resolve expert for AI-enhanced video production, specializing in content creation, automation, and creative workflows with <span className="text-white font-semibold">3+ years of experience</span> in AI technology implementation.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">3+ Years AI Experience</span>
                </div>
                <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">50+ AI Tools Mastered</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Tools Mastery */}
      <section className="py-16 bg-black" style={{ zIndex: 10 }}>
        <div className="container-custom">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-6 font-accent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent text-center"
            >
              Master of 50+ AI Tools
            </motion.h2>
            <AnimatedText
              text="From content creation to video production, I leverage the latest AI technology to deliver exceptional results."
              type="word"
              animation="fadeIn"
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              stagger={0.05}
              delay={0.6}
            />
          </motion.div>

          {/* AI Tools Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {aiTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.08, 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className="group relative bg-gradient-to-br from-gray-900/60 to-gray-800/60 p-4 rounded-xl border border-white/10 hover:border-purple-500/40 shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm overflow-hidden min-h-[80px] flex flex-col items-center justify-center"
              >
                {/* Soft Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                
                {/* Tool Name */}
                <div className="text-sm font-semibold text-white text-center leading-tight relative z-10 group-hover:text-purple-300 transition-colors duration-300 mb-1">
                  {tool.name}
                </div>
                
                {/* Tool Category */}
                <div className="text-xs text-gray-400 text-center leading-tight relative z-10">
                  {tool.category}
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                
                {/* Animated Glow Ring */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-purple-500/0 group-hover:border-purple-500/30 transition-all duration-300"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(168, 85, 247, 0)",
                      "0 0 0 4px rgba(168, 85, 247, 0.1)",
                      "0 0 0 0 rgba(168, 85, 247, 0)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.1
                  }}
                />
                
                {/* Floating Sparkles */}
                <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                  <motion.div
                    className="absolute top-1 right-1 w-1 h-1 bg-purple-400 rounded-full opacity-60"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                  <motion.div
                    className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full opacity-60"
                    animate={{
                      y: [0, 8, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Skills Section */}
          <div className="space-y-6 md:space-y-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="space-y-2 md:space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                    <div className={`p-1.5 md:p-2 rounded-lg bg-gradient-to-r ${skill.color} flex-shrink-0`}>
                      {skill.icon}
                    </div>
                    <span className="font-medium text-white text-sm md:text-base truncate">{skill.name}</span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-300 flex-shrink-0">{skill.level}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 md:h-3 relative overflow-hidden group cursor-pointer">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isInView ? `${skill.level}%` : 0 }}
                    transition={{ duration: 1.2, delay: index * 0.1 + 0.5 }}
                    className={`h-2 md:h-3 rounded-full bg-gradient-to-r ${skill.color} relative`}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-black" style={{ zIndex: 10 }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <AnimatedText
              text="My AI Journey"
              type="word"
              animation="slideUp"
              className="text-4xl md:text-5xl font-bold text-white mb-6 font-accent"
              stagger={0.1}
              delay={0.2}
            />
            <AnimatedText
              text="From learning my first AI tool to mastering 50+ applications, here's my journey in AI technology."
              type="word"
              animation="fadeIn"
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              stagger={0.05}
              delay={0.6}
            />
          </motion.div>

          <div className="relative">
            {/* Timeline Connector Line */}
            <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-purple-500 via-purple-400 to-transparent hidden lg:block" />
            
            <div className="space-y-20">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Left Column - Timeline Marker & Info */}
                    <div className="lg:w-1/3 lg:pr-8">
                      <div className="flex items-start space-x-6 mb-6">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          </div>
                          {/* Connector dot */}
                          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full border-4 border-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium inline-block mb-3">
                            {item.year}
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3 font-accent leading-tight">
                            {item.title}
                          </h3>
                          {item.company && (
                            <div className="text-purple-400 font-medium text-base mb-4">
                              {item.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column - Description & Achievements */}
                    <div className="lg:w-2/3 lg:pl-8">
                      <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {item.achievements.map((achievement, achievementIndex) => (
                          <motion.div
                            key={achievementIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -20 }}
                            transition={{ duration: 0.4, delay: index * 0.2 + achievementIndex * 0.1 }}
                            className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200 border border-white/10"
                          >
                            <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm leading-relaxed">
                              {achievement}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-black" style={{ zIndex: 10 }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <AnimatedText
              text="What Clients Say"
              type="word"
              animation="slideUp"
              className="text-4xl md:text-5xl font-bold text-white mb-6 font-accent"
              stagger={0.1}
              delay={0.2}
            />
            <AnimatedText
              text="Real feedback from clients who have experienced the power of AI-driven content creation."
              type="word"
              animation="fadeIn"
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              stagger={0.05}
              delay={0.6}
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-sm relative"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: isInView ? 1 : 0,
                        fill: isInView && i < testimonial.rating ? "currentColor" : "none"
                      }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.2 + i * 0.1,
                        ease: "backOut"
                      }}
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          i < testimonial.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="border-t border-white/20 pt-4">
                  <div className="font-semibold text-white font-accent">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Ready to Transform Section */}
          <div className="text-center mt-16 pt-8 pb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight font-accent mb-4">
              Ready to Transform
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight font-accent mb-8">
              Your Content with AI?
            </h2>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-10 rounded-full transition-all duration-200 text-lg shadow-lg hover:shadow-xl">
              Start Your AI Project
            </button>
          </div>
        </div>
      </section>


    </div>
  );
};

export default About;
