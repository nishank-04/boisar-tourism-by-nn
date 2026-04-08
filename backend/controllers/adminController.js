const User = require('../models/User');
const Destination = require('../models/Destination');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const Contact = require('../models/Contact');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {
      $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate ? new Date(endDate) : new Date()
    };

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
          },
          newUsers: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', dateFilter.$gte] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get destination statistics
    const destinationStats = await Destination.aggregate([
      {
        $group: {
          _id: null,
          totalDestinations: { $sum: 1 },
          activeDestinations: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          featuredDestinations: {
            $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          createdAt: dateFilter,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          averageBookingValue: { $avg: '$pricing.totalAmount' }
        }
      }
    ]);

    // Get trip statistics
    const tripStats = await Trip.aggregate([
      {
        $match: {
          createdAt: dateFilter,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          plannedTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'planned'] }, 1, 0] }
          },
          completedTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          publicTrips: {
            $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Get contact message statistics
    const contactStats = await Contact.aggregate([
      {
        $match: {
          createdAt: dateFilter,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          newMessages: {
            $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
          },
          repliedMessages: {
            $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] }
          },
          urgentMessages: {
            $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        users: userStats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          verifiedUsers: 0,
          newUsers: 0
        },
        destinations: destinationStats[0] || {
          totalDestinations: 0,
          activeDestinations: 0,
          featuredDestinations: 0
        },
        bookings: bookingStats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          averageBookingValue: 0
        },
        trips: tripStats[0] || {
          totalTrips: 0,
          plannedTrips: 0,
          completedTrips: 0,
          publicTrips: 0
        },
        contacts: contactStats[0] || {
          totalMessages: 0,
          newMessages: 0,
          repliedMessages: 0,
          urgentMessages: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private/Admin
exports.getSystemHealth = async (req, res, next) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV,
      database: 'connected',
      services: {
        email: 'operational',
        payment: 'operational',
        storage: 'operational'
      }
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all destinations
// @route   GET /api/admin/destinations
// @access  Private/Admin
exports.getDestinations = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      isActive,
      isFeatured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

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

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getBookings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      bookingType,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };
    if (status) filter.status = status;
    if (bookingType) filter.bookingType = bookingType;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('destination', 'name images location')
      .populate('package', 'name')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all trips
// @route   GET /api/admin/trips
// @access  Private/Admin
exports.getTrips = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      isPublic,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };
    if (status) filter.status = status;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    if (startDate || endDate) {
      filter['duration.startDate'] = {};
      if (startDate) filter['duration.startDate'].$gte = new Date(startDate);
      if (endDate) filter['duration.startDate'].$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trips = await Trip.find(filter)
      .populate('user', 'name email')
      .populate('destinations.destination', 'name images location')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Trip.countDocuments(filter);

    res.json({
      success: true,
      count: trips.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: trips
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue statistics
// @route   GET /api/admin/revenue
// @access  Private/Admin
exports.getRevenueStats = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const dateFilter = {
      $gte: startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      $lte: endDate ? new Date(endDate) : new Date()
    };

    let groupFormat;
    switch (groupBy) {
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        groupFormat = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
        break;
      case 'month':
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      case 'year':
        groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
        break;
      default:
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }

    const revenueStats = await Booking.aggregate([
      {
        $match: {
          createdAt: dateFilter,
          isActive: true,
          'payment.status': 'completed'
        }
      },
      {
        $group: {
          _id: groupFormat,
          totalRevenue: { $sum: '$pricing.totalAmount' },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: '$pricing.totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: revenueStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular destinations
// @route   GET /api/admin/popular-destinations
// @access  Private/Admin
exports.getPopularDestinations = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const dateFilter = {
      $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate ? new Date(endDate) : new Date()
    };

    const popularDestinations = await Booking.aggregate([
      {
        $match: {
          createdAt: dateFilter,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$destination',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          averageRating: { $avg: '$reviews.rating' }
        }
      },
      {
        $lookup: {
          from: 'destinations',
          localField: '_id',
          foreignField: '_id',
          as: 'destination'
        }
      },
      {
        $unwind: '$destination'
      },
      {
        $project: {
          destination: {
            name: '$destination.name',
            images: '$destination.images',
            location: '$destination.location',
            type: '$destination.type'
          },
          totalBookings: 1,
          totalRevenue: 1,
          averageRating: 1
        }
      },
      {
        $sort: { totalBookings: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: popularDestinations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent bookings
// @route   GET /api/admin/recent-bookings
// @access  Private/Admin
exports.getRecentBookings = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const recentBookings = await Booking.find({ isActive: true })
      .populate('user', 'name email')
      .populate('destination', 'name images')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: recentBookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;

    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update destination status
// @route   PUT /api/admin/destinations/:id/status
// @access  Private/Admin
exports.updateDestinationStatus = async (req, res, next) => {
  try {
    const { isActive, isFeatured } = req.body;

    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (isFeatured !== undefined) updates.isFeatured = isFeatured;

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      updates,
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
      message: 'Destination status updated successfully',
      data: destination
    });
  } catch (error) {
    next(error);
  }
};
