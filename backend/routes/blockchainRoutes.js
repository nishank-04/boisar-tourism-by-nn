const express = require('express');
const router = express.Router();
const {
  createBookingTransaction,
  verifyGuide,
  verifyHomestay,
  processRefund,
  getTransactionStatus,
  getUserTransactions,
  getContractBalance,
  validateAddress
} = require('../controllers/blockchainController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/blockchain/booking
// @desc    Create blockchain booking transaction
// @access  Private
router.post('/booking', protect, createBookingTransaction);

// @route   POST /api/blockchain/verify-guide
// @desc    Verify local guide on blockchain
// @access  Private (Admin only)
router.post('/verify-guide', protect, authorize('admin'), verifyGuide);

// @route   POST /api/blockchain/verify-homestay
// @desc    Verify homestay on blockchain
// @access  Private (Admin only)
router.post('/verify-homestay', protect, authorize('admin'), verifyHomestay);

// @route   POST /api/blockchain/refund
// @desc    Process blockchain refund
// @access  Private (Admin only)
router.post('/refund', protect, authorize('admin'), processRefund);

// @route   GET /api/blockchain/transaction/:hash
// @desc    Get transaction status
// @access  Private
router.get('/transaction/:hash', protect, getTransactionStatus);

// @route   GET /api/blockchain/transactions
// @desc    Get user's blockchain transactions
// @access  Private
router.get('/transactions', protect, getUserTransactions);

// @route   GET /api/blockchain/balance
// @desc    Get contract balance
// @access  Private (Admin only)
router.get('/balance', protect, authorize('admin'), getContractBalance);

// @route   POST /api/blockchain/validate-address
// @desc    Validate wallet address
// @access  Public
router.post('/validate-address', validateAddress);

module.exports = router;

