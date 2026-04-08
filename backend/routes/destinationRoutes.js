const express = require('express');
const {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  searchDestinations,
  getDestinationsByRegion,
  getFeaturedDestinations,
  addReview,
  getReviews,
  incrementViewCount
} = require('../controllers/destinationController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
router.get('/', optionalAuth, getDestinations);

// @desc    Search destinations
// @route   GET /api/destinations/search
// @access  Public
router.get('/search', optionalAuth, searchDestinations);

// @desc    Get featured destinations
// @route   GET /api/destinations/featured
// @access  Public
router.get('/featured', optionalAuth, getFeaturedDestinations);

// @desc    Get destinations by region
// @route   GET /api/destinations/region/:region
// @access  Public
router.get('/region/:region', optionalAuth, getDestinationsByRegion);

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
router.get('/:id', optionalAuth, incrementViewCount, getDestination);

// @desc    Add review to destination
// @route   POST /api/destinations/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, addReview);

// @desc    Get reviews for destination
// @route   GET /api/destinations/:id/reviews
// @access  Public
router.get('/:id/reviews', getReviews);

// @desc    Create destination
// @route   POST /api/destinations
// @access  Private/Admin
router.post('/', protect, authorize('admin'), createDestination);

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), updateDestination);

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteDestination);

module.exports = router;
