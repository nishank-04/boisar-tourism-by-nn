const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  getBookingByConfirmationCode,
  getBookingStatistics
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all bookings for user
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, getBookings);

// @desc    Get booking statistics
// @route   GET /api/bookings/statistics
// @access  Private/Admin
router.get('/statistics', protect, authorize('admin'), getBookingStatistics);

// @desc    Get booking by confirmation code
// @route   GET /api/bookings/confirmation/:code
// @access  Private
router.get('/confirmation/:code', protect, getBookingByConfirmationCode);

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, getBooking);

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, createBooking);

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
router.put('/:id', protect, updateBooking);

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
