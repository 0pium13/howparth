import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const messageTemplates = [
    {
      title: 'Project Inquiry',
      subject: 'Project Collaboration Opportunity',
      message: 'Hi HOWPARTH,\n\nI came across your portfolio and I\'m interested in discussing a potential project collaboration. I\'d love to learn more about your development process and how we might work together.\n\nBest regards,',
    },
    {
      title: 'Job Opportunity',
      subject: 'Job Opportunity - [Position Title]',
      message: 'Hi HOWPARTH,\n\nI\'m reaching out regarding a job opportunity that I think would be a great fit for your skills and experience. Would you be interested in discussing this further?\n\nBest regards,',
    },
    {
      title: 'Technical Consultation',
      subject: 'Technical Consultation Request',
      message: 'Hi HOWPARTH,\n\nI\'m looking for technical consultation on a project I\'m working on. Your expertise in AI and full-stack development would be invaluable.\n\nBest regards,',
    },
    {
      title: 'General Inquiry',
      subject: 'General Inquiry',
      message: 'Hi HOWPARTH,\n\nI\'d like to get in touch to discuss [your topic of interest].\n\nBest regards,',
    },
  ];

  const handleTemplateSelect = (template: typeof messageTemplates[0]) => {
    setFormData({
      ...formData,
      subject: template.subject,
      message: template.message,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-black">Message Sent!</h3>
        <p className="text-black">
          Thank you for reaching out. I'll get back to you as soon as possible.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSubmitted(false)}
          className="btn-primary"
        >
          Send Another Message
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Message Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-black">Quick Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {messageTemplates.map((template, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTemplateSelect(template)}
              className="p-3 text-left bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors border border-secondary-200"
            >
              <div className="font-medium text-black">{template.title}</div>
              <div className="text-sm text-black truncate">{template.subject}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Contact Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-black mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="What's this about?"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            placeholder="Tell me more about your project or inquiry..."
          />
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-secondary-200"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Mail className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-black">Email</div>
            <div className="text-black">contact@howparth.com</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Phone className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-black">Phone</div>
            <div className="text-black">+917709225795</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <MapPin className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-black">Location</div>
            <div className="text-black">Nagpur, India</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactForm;
