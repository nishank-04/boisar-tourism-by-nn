const express = require('express');
const { body } = require('express-validator');
const {
  sendContactMessage,
  getContactMessages,
  updateContactMessage,
  deleteContactMessage
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Send contact message
// @route   POST /api/contact
// @access  Public
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid phone number'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
], sendContactMessage);

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getContactMessages);

// @desc    Update contact message
// @route   PUT /api/contact/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), updateContactMessage);

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

module.exports = router;
