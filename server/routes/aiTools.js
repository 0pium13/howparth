const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/ai-tools
// @desc    Get all AI tools
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      difficulty,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { useCases: { hasSome: [search] } }
      ];
    }

    const [tools, total] = await Promise.all([
      prisma.aITool.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.aITool.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        tools,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('AI tools fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI tools'
    });
  }
});

// @route   GET /api/ai-tools/:slug
// @desc    Get a specific AI tool
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const tool = await prisma.aITool.findUnique({
      where: { slug },
      include: {
        recommendations: {
          take: 5,
          orderBy: { score: 'desc' }
        }
      }
    });

    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'AI tool not found'
      });
    }

    res.json({
      success: true,
      data: tool
    });

  } catch (error) {
    logger.error('AI tool fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI tool'
    });
  }
});

// @route   GET /api/ai-tools/categories
// @desc    Get all AI tool categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.aITool.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    logger.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
