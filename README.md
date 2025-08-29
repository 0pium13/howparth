# HOWPARTH - AI-Powered Creative Solutions

A comprehensive, full-stack AI-powered website system featuring automated blog generation, AI consultation chat, and complete MCP integration.

## 🚀 Features

### Core System
- **Full-Stack Architecture**: React.js + Node.js + PostgreSQL + Prisma ORM
- **AI Integration**: OpenAI GPT-4 API for content generation and chat
- **Authentication**: JWT-based secure authentication system
- **Real-time Chat**: Socket.IO powered "Talk to Parth" consultation system
- **Analytics**: Comprehensive tracking and reporting system
- **Admin Dashboard**: Complete content and user management

### AI Blog Content System
- **Automated Content Generation**: AI-powered blog post creation
- **Writing Style Training**: Learns and adapts to user's writing style
- **SEO Optimization**: Automatic metadata and keyword generation
- **Social Media Integration**: Cross-platform content publishing
- **Content Pipeline**: Draft, review, and publish workflow

### "Talk to Parth" AI Consultation
- **Intelligent Chat Interface**: Real-time AI consultation system
- **Knowledge Base**: 50+ AI tools with detailed information
- **Smart Recommendations**: Personalized AI tool suggestions
- **Conversation History**: Persistent chat sessions
- **Export Functionality**: PDF export of conversations

### MCP Server Integrations
- **PostgreSQL MCP**: Database management and analytics
- **GitHub MCP**: Version control and deployment automation
- **Browser Tools MCP**: Performance monitoring and optimization
- **Social Media MCP**: Automated posting and engagement tracking

## 🛠️ Tech Stack

### Frontend
- **React.js 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router DOM** for routing
- **Socket.IO Client** for real-time features
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma ORM** for database management
- **JWT** for authentication
- **Socket.IO** for real-time communication
- **OpenAI API** for AI features
- **Winston** for logging

### DevOps & Tools
- **Docker** (optional)
- **GitHub Actions** for CI/CD
- **Vercel/Netlify** for deployment
- **PostgreSQL** for production database

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/howparth.git
cd howparth
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
```
Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/howparth"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="your-openai-api-key"
```

4. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

5. **Start the development server**
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000
```

## 🗄️ Database Schema

The system uses a comprehensive PostgreSQL schema with the following main entities:

- **Users**: Authentication, profiles, preferences
- **Blog Posts**: Content management with AI generation metadata
- **Conversations**: Chat history and AI interactions
- **AI Tools**: Knowledge base of 50+ AI tools
- **Consultations**: Booking and scheduling system
- **Analytics**: User behavior and content performance tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Blog Content
- `POST /api/blog/generate` - Generate AI content
- `POST /api/blog` - Create blog post
- `GET /api/blog` - Get all posts (with pagination)
- `GET /api/blog/:slug` - Get specific post
- `PUT /api/blog/:id` - Update post
- `DELETE /api/blog/:id` - Delete post

### Chat System
- `POST /api/chat/conversation` - Create conversation
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/message` - Send message and get AI response
- `POST /api/chat/recommendations` - Get AI tool recommendations

### AI Tools
- `GET /api/ai-tools` - Get all AI tools
- `GET /api/ai-tools/:slug` - Get specific tool
- `GET /api/ai-tools/categories` - Get tool categories

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/preferences` - Update preferences
- `GET /api/user/notifications` - Get notifications

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/blog-posts` - Get all posts
- `GET /api/admin/categories` - Get categories
- `GET /api/analytics/dashboard` - Analytics dashboard

## 🤖 AI Features

### Content Generation
The system uses OpenAI GPT-4 to generate:
- Blog posts with custom writing styles
- SEO metadata and keywords
- Social media content for multiple platforms
- Email newsletters and summaries

### Chat System
The "Talk to Parth" system provides:
- Real-time AI consultation
- Personalized tool recommendations
- Workflow suggestions
- Implementation guidance

### Writing Style Training
The system learns from:
- User's existing content
- Approved AI-generated content
- Writing preferences and feedback
- Industry-specific terminology

## 📊 Analytics & Performance

### Tracking
- User behavior analytics
- Content performance metrics
- Chat interaction patterns
- Conversion tracking

### Performance Optimization
- Lazy loading and code splitting
- Database query optimization
- Caching strategies
- CDN integration

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting and DDoS protection
- Input validation and sanitization
- CORS protection
- Helmet.js security headers

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
```bash
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
OPENAI_API_KEY="your-openai-api-key"
```

2. **Database Migration**
```bash
npm run db:migrate
```

3. **Build and Deploy**
```bash
npm run build
```

### Docker Deployment (Optional)
```bash
docker build -t howparth .
docker run -p 5000:5000 howparth
```

## 📈 Monitoring & Maintenance

### Health Checks
- `/health` endpoint for system status
- Database connection monitoring
- API response time tracking

### Logging
- Winston logger with file rotation
- Error tracking and alerting
- Performance monitoring

### Backup & Recovery
- Automated database backups
- File system backups
- Disaster recovery procedures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@howparth.com
- Documentation: https://docs.howparth.com

## 🔮 Roadmap

### Phase 2 Features
- [ ] Advanced AI model fine-tuning
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] API rate limiting and monetization
- [ ] Advanced social media automation
- [ ] Video content generation
- [ ] E-commerce integration

### Phase 3 Features
- [ ] AI-powered video editing
- [ ] Advanced workflow automation
- [ ] Enterprise features
- [ ] White-label solutions
- [ ] Advanced MCP integrations
- [ ] AI model marketplace

---

**Built with ❤️ by the HOWPARTH team**
