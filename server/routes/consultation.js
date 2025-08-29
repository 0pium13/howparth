const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateConsultation = [
  body('type').isIn(['GENERAL', 'TECHNICAL', 'STRATEGY', 'IMPLEMENTATION']),
  body('scheduledAt').isISO8601(),
  body('duration').isInt({ min: 30, max: 180 }),
  body('notes').optional().trim().isLength({ max: 1000 })
];

// @route   POST /api/consultation
// @desc    Book a consultation
// @access  Private
router.post('/', authenticateToken, validateConsultation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { type, scheduledAt, duration, notes } = req.body;

    const consultation = await prisma.consultation.create({
      data: {
        userId: req.user.id,
        type,
        scheduledAt: new Date(scheduledAt),
        duration,
        notes,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    logger.info(`Consultation booked: ${consultation.id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: consultation
    });

  } catch (error) {
    logger.error('Consultation booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to book consultation'
    });
  }
});

// @route   GET /api/consultation
// @desc    Get user's consultations
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { scheduledAt: 'desc' }
      }),
      prisma.consultation.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        consultations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Consultations fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch consultations'
    });
  }
});

// @route   PUT /api/consultation/:id
// @desc    Update consultation
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const consultation = await prisma.consultation.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
      });
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedConsultation
    });

  } catch (error) {
    logger.error('Consultation update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update consultation'
    });
  }
});

// @route   DELETE /api/consultation/:id
// @desc    Cancel consultation
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await prisma.consultation.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
      });
    }

    await prisma.consultation.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      message: 'Consultation cancelled successfully'
    });

  } catch (error) {
    logger.error('Consultation cancellation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel consultation'
    });
  }
});

module.exports = router;
