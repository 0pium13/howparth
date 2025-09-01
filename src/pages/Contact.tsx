import React from 'react';
import { motion } from 'framer-motion';
import ContactForm from '../components/ContactForm';
import FloatingEmojis from '../components/FloatingEmojis';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Instagram, 
  Twitter,
  CheckCircle
} from 'lucide-react';

const Contact: React.FC = () => {
  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      value: 'contact@howparth.com',
      description: 'Send me an email anytime',
      action: 'mailto:contact@howparth.com',
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone',
      value: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 6pm',
      action: 'tel:+15551234567',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Location',
      value: 'Nagpur, India',
      description: 'Available for remote work',
      action: null,
    },
  ];

  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/howparth',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'hover:text-blue-600',
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/howparth',
      icon: <Instagram className="w-5 h-5" />,
      color: 'hover:text-pink-600',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/howparth',
      icon: <Twitter className="w-5 h-5" />,
      color: 'hover:text-blue-400',
    },
  ];

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    // Here you would typically send the data to your backend
  };

  return (
    <div className="min-h-screen pt-16 bg-black relative overflow-hidden">
      {/* Remove purple glow chunks - clean black background */}
      
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
              Let's Connect
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to start your next project? I'm here to help bring your ideas to life 
              with cutting-edge technology and innovative solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section-padding bg-black relative overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="card p-4 md:p-6 text-center group border-2 border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mx-auto mb-3 md:mb-4 group-hover:bg-gray-200 transition-colors"
                >
                  {info.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-black mb-2">
                  {info.title}
                </h3>
                {info.action ? (
                  <a
                    href={info.action}
                    className="text-black hover:text-gray-600 font-medium text-lg block mb-2 transition-colors"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-black font-medium text-lg mb-2">
                    {info.value}
                  </p>
                )}
                <p className="text-gray-600">
                  {info.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="section-padding bg-black">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="card p-8 bg-white border border-gray-200"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-black mb-4">
                  Send a Message
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and I'll get back to you as soon as possible.
                </p>
              </div>
              <ContactForm onSubmit={handleFormSubmit} />
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Quick Response */}
              <div className="card p-6 bg-white border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">
                      Quick Response
                    </h3>
                    <p className="text-gray-600">
                      I typically respond to all inquiries within 24 hours during business days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="card p-6 bg-white border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">
                      Availability
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Currently available for new projects and collaborations.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monday - Friday:</span>
                        <span className="font-medium text-black">9:00 AM - 6:00 PM PST</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weekends:</span>
                        <span className="font-medium text-black">By appointment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="card p-6 bg-white border border-gray-200">
                <h3 className="text-xl font-bold text-black mb-4">
                  Connect on Social Media
                </h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 bg-gray-100 rounded-lg text-gray-600 transition-colors ${social.color}`}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="card p-6 bg-white border border-gray-200">
                <h3 className="text-xl font-bold text-black mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      question: 'What types of projects do you work on?',
                      answer: 'I specialize in AI-powered applications, full-stack web development, and mobile apps.',
                    },
                    {
                      question: 'Do you work with startups?',
                      answer: 'Yes! I love working with startups and helping bring innovative ideas to life.',
                    },
                    {
                      question: 'What is your typical project timeline?',
                      answer: 'Project timelines vary based on complexity, typically ranging from 2-8 weeks.',
                    },
                  ].map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h4 className="font-semibold text-black mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
              Ready to{' '}
              <span className="text-white">
                Get Started?
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Let's discuss your project requirements and create something amazing together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
              >
                Schedule a Call
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
              >
                View Portfolio
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
