const BlockchainService = require('../services/blockchainService');
const BlockchainTransaction = require('../models/BlockchainTransaction');
const User = require('../models/User');
const Homestay = require('../models/Homestay');
const Booking = require('../models/Booking');

// @desc    Create blockchain booking transaction
// @route   POST /api/blockchain/booking
// @access  Private
const createBookingTransaction = async (req, res) => {
  try {
    const { bookingId, amount, userAddress } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!bookingId || !amount || !userAddress) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, amount, and user address are required'
      });
    }

    // Validate wallet address
    if (!BlockchainService.isValidAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to process this booking'
      });
    }

    // Create blockchain transaction
    const result = await BlockchainService.createBookingTransaction(
      bookingId,
      amount,
      userAddress
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create blockchain transaction',
        error: result.error
      });
    }

    // Update booking with blockchain transaction
    booking.blockchainTransaction = result.transactionHash;
    booking.paymentStatus = 'blockchain_pending';
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Blockchain transaction created successfully',
      data: {
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        explorerUrl: result.explorerUrl,
        gasUsed: result.gasUsed
      }
    });

  } catch (error) {
    console.error('❌ Create booking transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Verify local guide
// @route   POST /api/blockchain/verify-guide
// @access  Private (Admin only)
const verifyGuide = async (req, res) => {
  try {
    const { guideId, guideAddress, verified } = req.body;

    // Validate inputs
    if (!guideId || !guideAddress || typeof verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Guide ID, address, and verification status are required'
      });
    }

    // Validate wallet address
    if (!BlockchainService.isValidAddress(guideAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    // Check if guide exists
    const guide = await User.findById(guideId);
    if (!guide || guide.role !== 'guide') {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Create blockchain verification
    const result = await BlockchainService.verifyGuide(
      guideId,
      guideAddress,
      verified
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify guide on blockchain',
        error: result.error
      });
    }

    // Update guide verification status
    guide.blockchainVerified = verified;
    guide.verificationHash = result.transactionHash;
    guide.verifiedAt = new Date();
    await guide.save();

    res.status(200).json({
      success: true,
      message: `Guide ${verified ? 'verified' : 'unverified'} successfully`,
      data: {
        guideId: guideId,
        verified: verified,
        transactionHash: result.transactionHash,
        explorerUrl: result.explorerUrl
      }
    });

  } catch (error) {
    console.error('❌ Verify guide error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Verify homestay
// @route   POST /api/blockchain/verify-homestay
// @access  Private (Admin only)
const verifyHomestay = async (req, res) => {
  try {
    const { homestayId, ownerAddress, verified } = req.body;

    // Validate inputs
    if (!homestayId || !ownerAddress || typeof verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Homestay ID, owner address, and verification status are required'
      });
    }

    // Validate wallet address
    if (!BlockchainService.isValidAddress(ownerAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    // Check if homestay exists
    const homestay = await Homestay.findById(homestayId);
    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: 'Homestay not found'
      });
    }

    // Create blockchain verification
    const result = await BlockchainService.verifyHomestay(
      homestayId,
      ownerAddress,
      verified
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify homestay on blockchain',
        error: result.error
      });
    }

    // Update homestay verification status
    homestay.verification.isVerified = verified;
    homestay.verification.verificationDate = new Date();
    homestay.verification.verificationHash = result.transactionHash;
    homestay.status = verified ? 'active' : 'suspended';
    await homestay.save();

    res.status(200).json({
      success: true,
      message: `Homestay ${verified ? 'verified' : 'unverified'} successfully`,
      data: {
        homestayId: homestayId,
        verified: verified,
        transactionHash: result.transactionHash,
        explorerUrl: result.explorerUrl
      }
    });

  } catch (error) {
    console.error('❌ Verify homestay error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Process refund
// @route   POST /api/blockchain/refund
// @access  Private (Admin only)
const processRefund = async (req, res) => {
  try {
    const { bookingId, userAddress, amount } = req.body;

    // Validate inputs
    if (!bookingId || !userAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, user address, and amount are required'
      });
    }

    // Validate wallet address
    if (!BlockchainService.isValidAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create blockchain refund
    const result = await BlockchainService.processRefund(
      bookingId,
      userAddress,
      amount
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to process refund on blockchain',
        error: result.error
      });
    }

    // Update booking status
    booking.paymentStatus = 'refunded';
    booking.refundTransaction = result.transactionHash;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        bookingId: bookingId,
        amount: amount,
        transactionHash: result.transactionHash,
        explorerUrl: result.explorerUrl
      }
    });

  } catch (error) {
    console.error('❌ Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get transaction status
// @route   GET /api/blockchain/transaction/:hash
// @access  Private
const getTransactionStatus = async (req, res) => {
  try {
    const { hash } = req.params;

    // Get transaction from database
    const dbTransaction = await BlockchainTransaction.findOne({
      transactionHash: hash
    });

    if (!dbTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Get blockchain status
    const blockchainStatus = await BlockchainService.getTransactionStatus(hash);

    res.status(200).json({
      success: true,
      data: {
        transaction: dbTransaction.getSummary(),
        blockchainStatus: blockchainStatus,
        isConfirmed: dbTransaction.isConfirmed()
      }
    });

  } catch (error) {
    console.error('❌ Get transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get user's blockchain transactions
// @route   GET /api/blockchain/transactions
// @access  Private
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type } = req.query;

    // Build query
    const query = { userId: userId };
    if (type) {
      query.transactionType = type;
    }

    // Get transactions
    const transactions = await BlockchainTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('bookingId', 'destinationName checkIn checkOut')
      .populate('guideId', 'name email')
      .populate('homestayId', 'name address');

    const total = await BlockchainTransaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions: transactions.map(tx => tx.getSummary()),
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total: total
        }
      }
    });

  } catch (error) {
    console.error('❌ Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get contract balance
// @route   GET /api/blockchain/balance
// @access  Private (Admin only)
const getContractBalance = async (req, res) => {
  try {
    const balance = await BlockchainService.getContractBalance();

    res.status(200).json({
      success: true,
      data: {
        balance: balance,
        currency: 'ETH'
      }
    });

  } catch (error) {
    console.error('❌ Get contract balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Validate wallet address
// @route   POST /api/blockchain/validate-address
// @access  Public
const validateAddress = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const isValid = BlockchainService.isValidAddress(address);

    res.status(200).json({
      success: true,
      data: {
        address: address,
        isValid: isValid
      }
    });

  } catch (error) {
    console.error('❌ Validate address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createBookingTransaction,
  verifyGuide,
  verifyHomestay,
  processRefund,
  getTransactionStatus,
  getUserTransactions,
  getContractBalance,
  validateAddress
};

