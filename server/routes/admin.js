const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, subscriptionTier } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (subscriptionTier) {
      where.subscriptionTier = subscriptionTier;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          subscriptionTier: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              blogPosts: true,
              conversations: true,
              consultations: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Admin users fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// @route   PUT /api/admin/user/:id
// @desc    Update user (admin only)
// @access  Private (Admin)
router.put('/user/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionTier: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    logger.info(`User updated by admin: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Admin user update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// @route   GET /api/admin/blog-posts
// @desc    Get all blog posts (admin only)
// @access  Private (Admin)
router.get('/blog-posts', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, author } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (author) {
      where.author = {
        username: author
      };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          categories: true,
          tags: true
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
    logger.error('Admin blog posts fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts'
    });
  }
});

// @route   DELETE /api/admin/blog-post/:id
// @desc    Delete blog post (admin only)
// @access  Private (Admin)
router.delete('/blog-post/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.blogPost.delete({
      where: { id }
    });

    logger.info(`Blog post deleted by admin: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    logger.error('Admin blog post deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete blog post'
    });
  }
});

// @route   GET /api/admin/categories
// @desc    Get all categories (admin only)
// @access  Private (Admin)
router.get('/categories', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { blogPosts: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    logger.error('Admin categories fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// @route   POST /api/admin/category
// @desc    Create category (admin only)
// @access  Private (Admin)
router.post('/category', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color
      }
    });

    logger.info(`Category created by admin: ${category.id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: category
    });

  } catch (error) {
    logger.error('Admin category creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
});

module.exports = router;
