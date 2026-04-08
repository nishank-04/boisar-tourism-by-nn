const User = require('../models/User');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');

// @desc    Get all users
// @route   GET /api/users
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

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
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

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can access this profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user profile'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    // Check if user can update this profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user profile'
      });
    }

    const allowedUpdates = [
      'name', 'phone', 'address', 'preferences', 'emergencyContact',
      'socialProfiles', 'avatar'
    ];

    // Admin can update more fields
    if (req.user.role === 'admin') {
      allowedUpdates.push('role', 'isActive', 'isEmailVerified');
    }

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

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
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let filter = { user: req.user.id, isActive: true };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('destination', 'name images location')
      .populate('package', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

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

// @desc    Get user trips
// @route   GET /api/users/trips
// @access  Private
exports.getUserTrips = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let filter = { user: req.user.id, isActive: true };
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate('destinations.destination', 'name images location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

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

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      { $match: { user: userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$pricing.totalAmount' },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get trip statistics
    const tripStats = await Trip.aggregate([
      { $match: { user: userId, isActive: true } },
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
          totalDays: { $sum: '$duration.days' }
        }
      }
    ]);

    // Get recent activity
    const recentBookings = await Booking.find({ user: userId, isActive: true })
      .populate('destination', 'name images')
      .sort({ createdAt: -1 })
      .limit(3);

    const recentTrips = await Trip.find({ user: userId, isActive: true })
      .populate('destinations.destination', 'name images')
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      success: true,
      data: {
        bookings: bookingStats[0] || {
          totalBookings: 0,
          totalSpent: 0,
          confirmedBookings: 0,
          cancelledBookings: 0
        },
        trips: tripStats[0] || {
          totalTrips: 0,
          plannedTrips: 0,
          completedTrips: 0,
          totalDays: 0
        },
        recentActivity: {
          bookings: recentBookings,
          trips: recentTrips
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (Personal info & Preferences)
// @route   PUT /api/users/profile
// @access  Private
// AFTER
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const allowedUpdates = [
      'name', 'email', 'phone', 'address', 'preferences', 'emergencyContact',
      'socialProfiles', 'avatar', 'notifications'
    ];


    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
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
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/users/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
