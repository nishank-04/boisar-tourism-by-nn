const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserBookings,
  getUserTrips,
  getUserStats,
  updateProfile,
  updatePassword
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getUsers);

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, getUserStats);

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
router.get('/bookings', protect, getUserBookings);

// @desc    Get user trips
// @route   GET /api/users/trips
// @access  Private
router.get('/trips', protect, getUserTrips);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @desc    Update user password
// @route   PUT /api/users/update-password
// @access  Private
router.put('/update-password', protect, updatePassword);

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, getUser);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, updateUser);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
