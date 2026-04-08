const Destination = require('../models/Destination');
const { validationResult } = require('express-validator');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
exports.getDestinations = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      region,
      category,
      minRating,
      sortBy = 'ratings.average',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (region) filter['location.region'] = region;
    if (category) filter.category = category;
    if (minRating) filter['ratings.average'] = { $gte: parseFloat(minRating) };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const destinations = await Destination.find(filter)
      .select('-reviews')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Destination.countDocuments(filter);

    res.json({
      success: true,
      count: destinations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: destinations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
exports.getDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate('reviews.user', 'name avatar')
      .populate('reviews', '-user');

    if (!destination || !destination.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search destinations
// @route   GET /api/destinations/search
// @access  Public
exports.searchDestinations = async (req, res, next) => {
  try {
    const {
      q,
      type,
      region,
      minRating,
      page = 1,
      limit = 10
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filters = {
      type,
      region,
      minRating: minRating ? parseFloat(minRating) : undefined
    };

    const destinations = await Destination.search(q, filters)
      .select('-reviews')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured destinations
// @route   GET /api/destinations/featured
// @access  Public
exports.getFeaturedDestinations = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;

    const destinations = await Destination.findFeatured()
      .select('-reviews')
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get destinations by region
// @route   GET /api/destinations/region/:region
// @access  Public
exports.getDestinationsByRegion = async (req, res, next) => {
  try {
    const { region } = req.params;
    const { limit = 10 } = req.query;

    const validRegions = ['north', 'south', 'east', 'west'];
    if (!validRegions.includes(region)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid region. Must be one of: north, south, east, west'
      });
    }

    const destinations = await Destination.findByRegion(region)
      .select('-reviews')
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review to destination
// @route   POST /api/destinations/:id/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment, images } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Check if user already reviewed this destination
    const existingReview = destination.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this destination'
      });
    }

    const reviewData = {
      user: req.user.id,
      rating: parseInt(rating),
      comment: comment || '',
      images: images || []
    };

    await destination.addReview(reviewData);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        review: reviewData,
        averageRating: destination.ratings.average,
        totalReviews: destination.ratings.count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for destination
// @route   GET /api/destinations/:id/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const destination = await Destination.findById(req.params.id)
      .populate('reviews.user', 'name avatar')
      .select('reviews ratings');

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Sort reviews
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = destination.reviews
      .sort((a, b) => {
        if (sortBy === 'createdAt') {
          return sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
        }
        if (sortBy === 'rating') {
          return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
        }
        return 0;
      })
      .slice((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit));

    res.json({
      success: true,
      count: reviews.length,
      total: destination.reviews.length,
      averageRating: destination.ratings.average,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment view count
// @route   GET /api/destinations/:id/view
// @access  Public
exports.incrementViewCount = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (destination) {
      await destination.incrementViewCount();
    }
    next();
  } catch (error) {
    next(error);
  }
};

// @desc    Create destination
// @route   POST /api/destinations
// @access  Private/Admin
exports.createDestination = async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: destination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private/Admin
exports.updateDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.json({
      success: true,
      message: 'Destination updated successfully',
      data: destination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private/Admin
exports.deleteDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
