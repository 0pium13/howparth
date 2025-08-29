const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/analytics/dashboard
// @desc    Get analytics dashboard data
// @access  Private (Admin)
router.get('/dashboard', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get various analytics data
    const [
      totalUsers,
      newUsers,
      totalPosts,
      publishedPosts,
      totalConversations,
      totalConsultations,
      userAnalytics,
      contentAnalytics
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // New users in period
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Total blog posts
      prisma.blogPost.count(),
      
      // Published posts
      prisma.blogPost.count({
        where: { status: 'PUBLISHED' }
      }),
      
      // Total conversations
      prisma.conversation.count(),
      
      // Total consultations
      prisma.consultation.count(),
      
      // User analytics in period
      prisma.userAnalytics.findMany({
        where: {
          timestamp: {
            gte: startDate
          }
        },
        orderBy: { timestamp: 'desc' }
      }),
      
      // Content analytics in period
      prisma.contentAnalytics.findMany({
        where: {
          timestamp: {
            gte: startDate
          }
        },
        orderBy: { timestamp: 'desc' }
      })
    ]);

    // Process analytics data
    const eventCounts = userAnalytics.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {});

    const topPosts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        views: true,
        likes: true,
        shares: true
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsers,
          totalPosts,
          publishedPosts,
          totalConversations,
          totalConsultations
        },
        period,
        eventCounts,
        topPosts,
        userAnalytics: userAnalytics.length,
        contentAnalytics: contentAnalytics.length
      }
    });

  } catch (error) {
    logger.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
});

// @route   GET /api/analytics/user/:userId
// @desc    Get user-specific analytics
// @access  Private
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    // Check if user can access this data
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this data'
      });
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const [
      userAnalytics,
      blogPosts,
      conversations,
      consultations
    ] = await Promise.all([
      // User analytics
      prisma.userAnalytics.findMany({
        where: {
          userId,
          timestamp: {
            gte: startDate
          }
        },
        orderBy: { timestamp: 'desc' }
      }),
      
      // User's blog posts
      prisma.blogPost.findMany({
        where: {
          authorId: userId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      
      // User's conversations
      prisma.conversation.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      
      // User's consultations
      prisma.consultation.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Process analytics
    const eventCounts = userAnalytics.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {});

    const totalViews = blogPosts.reduce((sum, post) => sum + post.views, 0);
    const totalLikes = blogPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalShares = blogPosts.reduce((sum, post) => sum + post.shares, 0);

    res.json({
      success: true,
      data: {
        period,
        eventCounts,
        blogPosts: {
          count: blogPosts.length,
          totalViews,
          totalLikes,
          totalShares,
          posts: blogPosts
        },
        conversations: {
          count: conversations.length,
          conversations
        },
        consultations: {
          count: consultations.length,
          consultations
        }
      }
    });

  } catch (error) {
    logger.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user analytics'
    });
  }
});

// @route   POST /api/analytics/track
// @desc    Track an analytics event
// @access  Public
router.post('/track', async (req, res) => {
  try {
    const { event, metadata, userId } = req.body;

    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'Event is required'
      });
    }

    // Track user analytics if userId provided
    if (userId) {
      await prisma.userAnalytics.create({
        data: {
          userId,
          event,
          metadata: metadata || {},
          timestamp: new Date()
        }
      });
    }

    // Track content analytics
    await prisma.contentAnalytics.create({
      data: {
        event,
        metadata: metadata || {},
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    logger.error('Analytics tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
});

module.exports = router;
