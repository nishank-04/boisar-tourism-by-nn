const express = require('express');
const {
  processMessage,
  getQuickReplies,
  getChatbotAnalytics,
  saveChatbotSession
} = require('../controllers/chatbotController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Process chatbot message
// @route   POST /api/chatbot/message
// @access  Public
router.post('/message', optionalAuth, processMessage);

// @desc    Get quick replies
// @route   GET /api/chatbot/quick-replies
// @access  Public
router.get('/quick-replies', getQuickReplies);

// @desc    Get chatbot analytics
// @route   GET /api/chatbot/analytics
// @access  Private/Admin
router.get('/analytics', protect, getChatbotAnalytics);

// @desc    Save chatbot session
// @route   POST /api/chatbot/session
// @access  Public
router.post('/session', optionalAuth, saveChatbotSession);

module.exports = router;
