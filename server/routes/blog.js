const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const aiService = require('../services/aiService');
const { logger } = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateBlogPost = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('content').trim().isLength({ min: 1 }),
  body('excerpt').optional().trim().isLength({ max: 500 }),
  body('targetAudience').optional().isIn(['beginner', 'intermediate', 'advanced', 'general']),
  body('contentTone').optional().isIn(['professional', 'casual', 'technical', 'conversational']),
  body('keywords').optional().isArray(),
  body('categoryIds').optional().isArray(),
  body('tagIds').optional().isArray()
];

// @route   POST /api/blog/generate
// @desc    Generate blog content with AI
// @access  Private
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const {
      topic,
      writingStyle = 'professional',
      targetAudience = 'general',
      contentTone = 'informative',
      maxTokens = 2000
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    // Get user's writing style preferences
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user.id },
      select: { writingStyle: true }
    });

    const aiResult = await aiService.generateBlogContent(topic, {
      writingStyle: userPreferences?.writingStyle || writingStyle,
      targetAudience,
      tone: contentTone,
      maxTokens
    });

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: aiResult.error
      });
    }

    // Generate SEO metadata
    const seoResult = await aiService.generateSEOMetadata(topic, aiResult.content);

    res.json({
      success: true,
      data: {
        content: aiResult.content,
        seo: seoResult.success ? seoResult.seoData : null,
        usage: aiResult.usage
      }
    });

  } catch (error) {
    logger.error('Blog generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Content generation failed'
    });
  }
});

// @route   POST /api/blog
// @desc    Create a new blog post
// @access  Private
router.post('/', authenticateToken, validateBlogPost, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      content,
      excerpt,
      featuredImage,
      status = 'DRAFT',
      targetAudience,
      contentTone,
      keywords = [],
      categoryIds = [],
      tagIds = [],
      scheduledAt,
      aiGenerated = false,
      promptUsed
    } = req.body;

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (existingPost) {
      return res.status(400).json({
        success: false,
        error: 'A post with this title already exists'
      });
    }

    // Create blog post
    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        targetAudience,
        contentTone,
        keywords,
        aiGenerated,
        promptUsed,
        authorId: req.user.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        categories: {
          connect: categoryIds.map(id => ({ id }))
        },
        tags: {
          connect: tagIds.map(id => ({ id }))
        }
      },
      include: {
        categories: true,
        tags: true,
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    logger.info(`Blog post created: ${blogPost.id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: blogPost
    });

  } catch (error) {
    logger.error('Blog post creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create blog post'
    });
  }
});

// @route   GET /api/blog
// @desc    Get all blog posts (with pagination and filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'PUBLISHED',
      category,
      tag,
      search,
      author
    } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      status: status === 'ALL' ? undefined : status
    };

    if (category) {
      where.categories = {
        some: {
          slug: category
        }
      };
    }

    if (tag) {
      where.tags = {
        some: {
          slug: tag
        }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (author) {
      where.author = {
        username: author
      };
    }

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          categories: true,
          tags: true,
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Blog posts fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts'
    });
  }
});

// @route   GET /api/blog/:slug
// @desc    Get a single blog post by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        categories: true,
        tags: true,
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    logger.error('Blog post fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog post'
    });
  }
});

// @route   PUT /api/blog/:id
// @desc    Update a blog post
// @access  Private (Author or Admin)
router.put('/:id', authenticateToken, validateBlogPost, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if user can edit this post
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    if (existingPost.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to edit this post'
      });
    }

    // Update post
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        categories: true,
        tags: true,
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    logger.info(`Blog post updated: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      data: updatedPost
    });

  } catch (error) {
    logger.error('Blog post update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update blog post'
    });
  }
});

// @route   DELETE /api/blog/:id
// @desc    Delete a blog post
// @access  Private (Author or Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can delete this post
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    if (existingPost.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }

    // Delete post
    await prisma.blogPost.delete({
      where: { id }
    });

    logger.info(`Blog post deleted: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    logger.error('Blog post deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete blog post'
    });
  }
});

// @route   POST /api/blog/:id/publish
// @desc    Publish a blog post
// @access  Private (Author or Admin)
router.post('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    if (existingPost.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to publish this post'
      });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      include: {
        categories: true,
        tags: true,
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    logger.info(`Blog post published: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      data: updatedPost
    });

  } catch (error) {
    logger.error('Blog post publish error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish blog post'
    });
  }
});

module.exports = router;
