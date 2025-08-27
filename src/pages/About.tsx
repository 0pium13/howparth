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
  Camera,
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
    { name: 'ChatGPT & AI Tools', level: 95, icon: <Brain className="w-5 h-5" />, color: 'from-custom-accent to-purple-400' },
    { name: 'Midjourney & Stable Diffusion', level: 90, icon: <Palette className="w-5 h-5" />, color: 'from-blue-500 to-custom-accent' },
    { name: 'DaVinci Resolve', level: 88, icon: <Video className="w-5 h-5" />, color: 'from-custom-gold to-orange-500' },
    { name: 'RunwayML & AI Video', level: 85, icon: <Play className="w-5 h-5" />, color: 'from-green-500 to-custom-accent' },
    { name: 'Content Automation', level: 92, icon: <Zap className="w-5 h-5" />, color: 'from-custom-gold to-custom-accent' },
    { name: 'Creative Workflows', level: 87, icon: <Sparkles className="w-5 h-5" />, color: 'from-pink-500 to-custom-accent' },
  ];

  const aiTools = [
    'ChatGPT', 'Midjourney', 'Stable Diffusion', 'RunwayML', 'DALL-E', 'Jasper',
    'Copy.ai', 'Synthesia', 'Descript', 'Murf.ai', 'ElevenLabs', 'HeyGen',
    'Pictory', 'InVideo', 'Lumen5', 'Canva AI', 'Adobe Firefly', 'Leonardo.ai'
  ];

  const timeline = [
    {
      year: '2023 - Present',
      title: 'AI Creative Specialist',
      description: 'Leading AI content creation projects, mastering 50+ AI tools, and delivering innovative solutions for clients worldwide.',
      achievements: ['Mastered 50+ AI tools', 'Created 100+ AI-generated assets', 'Increased client ROI by 300%']
    },
    {
      year: '2022 - 2023',
      title: 'AI Content Creator',
      description: 'Specialized in AI-powered content creation, automation workflows, and creative process optimization.',
      achievements: ['Developed AI automation workflows', 'Created viral AI-generated content', 'Built client portfolio of 50+ projects']
    },
    {
      year: '2021 - 2022',
      title: 'Digital Content Creator',
      description: 'Started journey into AI technology, learning foundational tools and exploring creative applications.',
      achievements: ['Learned first AI tools', 'Created initial AI content', 'Built foundational skills']
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center space-x-2 bg-custom-accent/20 text-custom-accent px-4 py-2 rounded-full text-sm font-medium font-accent">
                <Sparkles className="w-4 h-4" />
                <span>AI Creative Specialist</span>
              </div>
              
              <AnimatedText
                text="Meet Parth - AI Creative Specialist"
                type="word"
                animation="slideUp"
                className="text-4xl md:text-6xl font-bold text-custom-text leading-tight font-accent"
                stagger={0.1}
                delay={0.2}
              />
              
              <AnimatedText
                text="Master of 50+ AI tools including ChatGPT, Midjourney, Stable Diffusion, and RunwayML. DaVinci Resolve expert for AI-enhanced video production, specializing in content creation, automation, and creative workflows with 3+ years of experience in AI technology implementation."
                type="word"
                animation="fadeIn"
                className="text-xl text-gray-300 leading-relaxed"
                stagger={0.05}
                delay={0.6}
              />
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-custom-gold" />
                  <span className="text-gray-300">3+ Years AI Experience</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-custom-accent" />
                  <span className="text-gray-300">50+ AI Tools Mastered</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              {/* 3D Purple Glow Behind Photo */}
              <motion.div
                className="absolute -inset-4 w-3/4 h-3/4 bg-purple-500/10 rounded-3xl blur-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  zIndex: -1,
                  left: '12.5%',
                  top: '12.5%',
                }}
              />
              
              {/* Professional Photo Placeholder */}
              <div className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full h-96 bg-gradient-to-br from-custom-accent to-custom-gold rounded-2xl flex items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-custom-accent/20 to-custom-gold/20 backdrop-blur-sm" />
                  <div className="text-center text-custom-text z-10">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-medium font-accent">Professional Photo</p>
                    <p className="text-sm opacity-70">AI Creative Specialist</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Tools Mastery */}
      <section className="section-padding bg-custom-secondary">
        <div className="container-custom">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <AnimatedText
              text="Master of 50+ AI Tools"
              type="word"
              animation="slideUp"
              className="text-4xl md:text-5xl font-bold text-custom-text mb-6 font-accent"
              stagger={0.1}
              delay={0.2}
            />
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
                key={tool}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-custom-background/50 p-3 md:p-4 rounded-lg text-center border border-custom-accent/30 hover:border-custom-accent transition-all duration-0.2 min-h-[60px] flex items-center justify-center"
              >
                <div className="text-xs md:text-sm font-medium text-custom-text leading-tight">{tool}</div>
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
                    <span className="font-medium text-custom-text text-sm md:text-base truncate">{skill.name}</span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-400 flex-shrink-0">{skill.level}%</span>
                </div>
                <div className="w-full bg-custom-background/50 rounded-full h-2 md:h-3 relative overflow-hidden group cursor-pointer">
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
      <section className="section-padding bg-custom-background">
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
              className="text-4xl md:text-5xl font-bold text-custom-text mb-6 font-accent"
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

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col lg:flex-row gap-8 items-start"
              >
                <div className="lg:w-1/4">
                  <div className="bg-gradient-to-r from-custom-accent to-custom-gold text-custom-background px-4 py-2 rounded-full text-sm font-medium inline-block font-accent">
                    {item.year}
                  </div>
                  <h3 className="text-2xl font-bold text-custom-text mt-3 font-accent">{item.title}</h3>
                </div>
                <div className="lg:w-3/4">
                  <p className="text-lg text-gray-300 mb-4 leading-relaxed">{item.description}</p>
                  <div className="space-y-2">
                    {item.achievements.map((achievement, achievementIndex) => (
                      <div key={achievementIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-custom-gold flex-shrink-0" />
                        <span className="text-gray-300">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-custom-secondary">
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
              className="text-4xl md:text-5xl font-bold text-custom-text mb-6 font-accent"
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
                className="bg-custom-background/50 p-6 rounded-xl border border-custom-accent/30 relative"
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
                            ? 'fill-custom-gold text-custom-gold' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="border-t border-custom-accent/30 pt-4">
                  <div className="font-semibold text-custom-text font-accent">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-custom-accent to-custom-gold">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <AnimatedText
              text="Ready to Transform Your Content with AI?"
              type="word"
              animation="slideUp"
              className="text-4xl md:text-5xl font-bold text-custom-background mb-6 font-accent"
              stagger={0.1}
              delay={0.2}
            />
            <AnimatedText
              text="Let's leverage the power of 50+ AI tools to create exceptional content that drives results."
              type="word"
              animation="fadeIn"
              className="text-xl text-custom-background/90 max-w-2xl mx-auto"
              stagger={0.05}
              delay={0.6}
            />
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-custom-background text-custom-accent hover:bg-custom-secondary font-semibold py-4 px-8 rounded-full transition-all duration-0.2 font-accent"
            >
              Start Your AI Project
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
