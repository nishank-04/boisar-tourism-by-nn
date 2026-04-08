const express = require('express');
const {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  generateItinerary,
  getTripRecommendations,
  shareTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all trips for user
// @route   GET /api/trips
// @access  Private
router.get('/', protect, getTrips);

// @desc    Get trip recommendations
// @route   GET /api/trips/recommendations
// @access  Private
router.get('/recommendations', protect, getTripRecommendations);

// @desc    Generate itinerary
// @route   POST /api/trips/generate-itinerary
// @access  Private
router.post('/generate-itinerary', protect, generateItinerary);

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
router.get('/:id', protect, getTrip);

// @desc    Create trip
// @route   POST /api/trips
// @access  Private
router.post('/', protect, createTrip);

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
router.put('/:id', protect, updateTrip);

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
router.delete('/:id', protect, deleteTrip);

// @desc    Share trip
// @route   POST /api/trips/:id/share
// @access  Private
router.post('/:id/share', protect, shareTrip);

module.exports = router;
