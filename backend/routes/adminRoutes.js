const express = require('express');
const {
  getDashboardStats,
  getUsers,
  getDestinations,
  getBookings,
  getTrips,
  updateUserStatus,
  updateDestinationStatus,
  getRevenueStats,
  getPopularDestinations,
  getRecentBookings,
  getSystemHealth
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', getDashboardStats);

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private/Admin
router.get('/health', getSystemHealth);

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', getUsers);

// @desc    Get all destinations
// @route   GET /api/admin/destinations
// @access  Private/Admin
router.get('/destinations', getDestinations);

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get('/bookings', getBookings);

// @desc    Get all trips
// @route   GET /api/admin/trips
// @access  Private/Admin
router.get('/trips', getTrips);

// @desc    Get revenue statistics
// @route   GET /api/admin/revenue
// @access  Private/Admin
router.get('/revenue', getRevenueStats);

// @desc    Get popular destinations
// @route   GET /api/admin/popular-destinations
// @access  Private/Admin
router.get('/popular-destinations', getPopularDestinations);

// @desc    Get recent bookings
// @route   GET /api/admin/recent-bookings
// @access  Private/Admin
router.get('/recent-bookings', getRecentBookings);

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', updateUserStatus);

// @desc    Update destination status
// @route   PUT /api/admin/destinations/:id/status
// @access  Private/Admin
router.put('/destinations/:id/status', updateDestinationStatus);

module.exports = router;
