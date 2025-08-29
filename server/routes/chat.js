const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const aiService = require('../services/aiService');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateMessage = [
  body('content').trim().isLength({ min: 1, max: 2000 }),
  body('conversationId').optional().isUUID()
];

// @route   POST /api/chat/conversation
// @desc    Create a new conversation
// @access  Private
router.post('/conversation', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user.id,
        sessionId: uuidv4(),
        title: title || 'New Conversation',
        metadata: {
          userAgent: req.get('User-Agent'),
          ip: req.ip
        }
      }
    });

    logger.info(`New conversation created: ${conversation.id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: conversation
    });

  } catch (error) {
    logger.error('Conversation creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    });
  }
});

// @route   GET /api/chat/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId: req.user.id },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { messages: true }
          }
        }
      }),
      prisma.conversation.count({
        where: { userId: req.user.id }
      })
    ]);

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Conversations fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// @route   GET /api/chat/conversation/:id
// @desc    Get a specific conversation with messages
// @access  Private
router.get('/conversation/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    logger.error('Conversation fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation'
    });
  }
});

// @route   POST /api/chat/message
// @desc    Send a message and get AI response
// @access  Private
router.post('/message', authenticateToken, validateMessage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { content, conversationId, attachments = [] } = req.body;

    let conversation;

    // Create new conversation if none provided
    if (!conversationId) {
      conversation = await prisma.conversation.create({
        data: {
          userId: req.user.id,
          sessionId: uuidv4(),
          title: content.substring(0, 50) + '...',
          metadata: {
            userAgent: req.get('User-Agent'),
            ip: req.ip
          }
        }
      });
    } else {
      // Get existing conversation
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: req.user.id
        }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content,
        attachments,
        metadata: {
          timestamp: new Date().toISOString()
        }
      }
    });

    // Get conversation history for context
    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10 // Last 10 messages for context
    });

    // Prepare messages for AI
    const aiMessages = messages.map(msg => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    }));

    // Generate AI response
    const aiResult = await aiService.generateChatResponse(aiMessages);

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: aiResult.error
      });
    }

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: aiResult.response,
        metadata: {
          timestamp: new Date().toISOString(),
          usage: aiResult.usage
        }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    // Track analytics
    await prisma.userAnalytics.create({
      data: {
        userId: req.user.id,
        event: 'chat_message_sent',
        metadata: {
          conversationId: conversation.id,
          messageLength: content.length,
          hasAttachments: attachments.length > 0
        }
      }
    });

    logger.info(`Chat message sent: ${conversation.id} by ${req.user.email}`);

    res.json({
      success: true,
      data: {
        conversation,
        userMessage,
        aiMessage
      }
    });

  } catch (error) {
    logger.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// @route   POST /api/chat/recommendations
// @desc    Get AI tool recommendations based on conversation
// @access  Private
router.post('/recommendations', authenticateToken, async (req, res) => {
  try {
    const { requirements, conversationId } = req.body;

    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'Requirements are required'
      });
    }

    // Get conversation context if provided
    let context = '';
    if (conversationId) {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      context = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    }

    const fullRequirements = context ? `${requirements}\n\nContext from conversation:\n${context}` : requirements;

    const aiResult = await aiService.generateToolRecommendations(fullRequirements);

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: aiResult.error
      });
    }

    // Save recommendation to database
    const recommendation = await prisma.recommendation.create({
      data: {
        userId: req.user.id,
        toolId: 'general', // For general recommendations
        score: 0.8,
        reason: 'AI-generated recommendation',
        metadata: {
          requirements,
          conversationId,
          usage: aiResult.usage
        }
      }
    });

    res.json({
      success: true,
      data: {
        recommendations: aiResult.recommendations,
        recommendationId: recommendation.id
      }
    });

  } catch (error) {
    logger.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    });
  }
});

// @route   DELETE /api/chat/conversation/:id
// @desc    Delete a conversation
// @access  Private
router.delete('/conversation/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Delete conversation (messages will be deleted due to cascade)
    await prisma.conversation.delete({
      where: { id }
    });

    logger.info(`Conversation deleted: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    logger.error('Conversation deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation'
    });
  }
});

// @route   POST /api/chat/export/:id
// @desc    Export conversation as PDF
// @access  Private
router.post('/export/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Generate PDF content
    const pdfContent = {
      title: `Conversation with Parth - ${conversation.title}`,
      date: conversation.createdAt,
      messages: conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt
      }))
    };

    // TODO: Implement PDF generation
    // For now, return the content structure
    res.json({
      success: true,
      data: {
        conversation: pdfContent,
        message: 'PDF export feature coming soon'
      }
    });

  } catch (error) {
    logger.error('Conversation export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export conversation'
    });
  }
});

module.exports = router;
