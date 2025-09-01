const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Encryption helper (same as in auth routes)
const encryptData = (data) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@howparth.com' },
      update: {},
      create: {
        email: 'admin@howparth.com',
        username: 'admin',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        subscriptionTier: 'PRO',
        isActive: true,
        emailVerified: true,
      },
    });

    // Create user preferences for admin
    await prisma.userPreferences.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        writingStyle: {
          tone: 'professional',
          style: 'technical',
          audience: 'developers',
        },
        preferredTopics: ['AI', 'Technology', 'Development'],
        notificationSettings: {
          email: true,
          push: true,
        },
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
      },
    });

    // Create test user
    const testPassword = await bcrypt.hash('test123', 12);
    const testUser = await prisma.user.upsert({
      where: { email: 'test@howparth.com' },
      update: {},
      create: {
        email: 'test@howparth.com',
        username: 'testuser',
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        subscriptionTier: 'FREE',
        isActive: true,
        emailVerified: true,
      },
    });

    // Create user preferences for test user
    await prisma.userPreferences.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        writingStyle: {
          tone: 'casual',
          style: 'conversational',
          audience: 'general',
        },
        preferredTopics: ['Content Creation', 'Marketing', 'Business'],
        notificationSettings: {
          email: true,
          push: false,
        },
        theme: 'default',
        language: 'en',
        timezone: 'UTC',
      },
    });

    // Create demo user with MFA enabled
    const demoPassword = await bcrypt.hash('demo123', 12);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@howparth.com' },
      update: {},
      create: {
        email: 'demo@howparth.com',
        username: 'demo',
        password: demoPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: 'USER',
        subscriptionTier: 'PREMIUM',
        isActive: true,
        emailVerified: true,
        mfaEnabled: true,
        mfaSecret: encryptData('JBSWY3DPEHPK3PXP'), // Demo TOTP secret
      },
    });

    // Create user preferences for demo user
    await prisma.userPreferences.upsert({
      where: { userId: demoUser.id },
      update: {},
      create: {
        userId: demoUser.id,
        writingStyle: {
          tone: 'friendly',
          style: 'creative',
          audience: 'customers',
        },
        preferredTopics: ['Creative Writing', 'Social Media', 'Branding'],
        notificationSettings: {
          email: true,
          push: true,
        },
        theme: 'sunset',
        language: 'en',
        timezone: 'UTC',
      },
    });

    // Create sample categories
    const categories = [
      { name: 'AI & Machine Learning', slug: 'ai-machine-learning', color: '#7c3aed' },
      { name: 'Content Creation', slug: 'content-creation', color: '#059669' },
      { name: 'Technology', slug: 'technology', color: '#dc2626' },
      { name: 'Business', slug: 'business', color: '#2563eb' },
      { name: 'Marketing', slug: 'marketing', color: '#ea580c' },
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: {
          name: category.name,
          slug: category.slug,
          description: `Articles about ${category.name.toLowerCase()}`,
          color: category.color,
        },
      });
    }

    // Create sample tags
    const tags = [
      'AI', 'ChatGPT', 'Content Marketing', 'SEO', 'Social Media',
      'Automation', 'Productivity', 'Startup', 'Freelancing', 'Remote Work'
    ];

    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { slug: tag.toLowerCase().replace(/\s+/g, '-') },
        update: {},
        create: {
          name: tag,
          slug: tag.toLowerCase().replace(/\s+/g, '-'),
        },
      });
    }

    // Create sample AI tools
    const aiTools = [
      {
        name: 'ChatGPT',
        slug: 'chatgpt',
        description: 'Advanced language model for conversation and content creation',
        category: 'AI & Machine Learning',
        subcategory: 'Language Models',
        website: 'https://chat.openai.com',
        pricing: { free: true, pro: '$20/month' },
        features: ['Conversation', 'Content Generation', 'Code Assistance'],
        useCases: ['Content Creation', 'Customer Support', 'Programming'],
        difficulty: 'BEGINNER',
        integration: ['API', 'Web Interface', 'Mobile App'],
        alternatives: ['Claude', 'Bard', 'Perplexity'],
      },
      {
        name: 'Midjourney',
        slug: 'midjourney',
        description: 'AI-powered image generation from text descriptions',
        category: 'AI & Machine Learning',
        subcategory: 'Image Generation',
        website: 'https://midjourney.com',
        pricing: { basic: '$10/month', standard: '$30/month' },
        features: ['Text-to-Image', 'Style Transfer', 'High Resolution'],
        useCases: ['Marketing Materials', 'Art Creation', 'Product Design'],
        difficulty: 'INTERMEDIATE',
        integration: ['Discord Bot', 'API'],
        alternatives: ['DALL-E', 'Stable Diffusion', 'Canva AI'],
      },
    ];

    for (const tool of aiTools) {
      await prisma.aITool.upsert({
        where: { slug: tool.slug },
        update: {},
        create: {
          name: tool.name,
          slug: tool.slug,
          description: tool.description,
          category: tool.category,
          subcategory: tool.subcategory,
          website: tool.website,
          pricing: tool.pricing,
          features: tool.features,
          useCases: tool.useCases,
          difficulty: tool.difficulty,
          integration: tool.integration,
          alternatives: tool.alternatives,
        },
      });
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Created users:');
    console.log(`   Admin: admin@howparth.com / admin123`);
    console.log(`   Test: test@howparth.com / test123`);
    console.log(`   Demo: demo@howparth.com / demo123 (MFA enabled)`);
    console.log('\n🔐 Demo MFA Secret: JBSWY3DPEHPK3PXP');
    console.log('   Use this secret in Google Authenticator for testing MFA');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
