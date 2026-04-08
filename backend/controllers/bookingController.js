const Booking = require('../models/Booking');
const Destination = require('../models/Destination');
const User = require('../models/User');

// @desc    Get all bookings for user
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    })
      .populate('destination', 'name images location contact')
      .populate('package', 'name')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const {
      destination,
      bookingType,
      package: packageId,
      bookingDetails,
      contact,
      specialRequests
    } = req.body;

    // Validate destination exists
    const destinationDoc = await Destination.findById(destination);
    if (!destinationDoc || !destinationDoc.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Calculate pricing based on destination and booking details
    let basePrice = 0;
    
    if (bookingType === 'accommodation') {
      // Calculate accommodation pricing
      basePrice = destinationDoc.pricing.entryFee.adult * bookingDetails.guests.adults;
      if (bookingDetails.guests.children > 0) {
        basePrice += destinationDoc.pricing.entryFee.child * bookingDetails.guests.children;
      }
    } else if (bookingType === 'activity') {
      // Calculate activity pricing
      basePrice = bookingDetails.activities.reduce((total, activity) => {
        return total + (activity.price * activity.participants);
      }, 0);
    }

    // Calculate taxes and fees (simplified calculation)
    const taxes = basePrice * 0.18; // 18% GST
    const fees = basePrice * 0.05; // 5% service fee
    const totalAmount = basePrice + taxes + fees;

    const bookingData = {
      user: req.user.id,
      destination,
      bookingType,
      package: packageId,
      bookingDetails,
      contact: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        emergencyContact: contact.emergencyContact
      },
      pricing: {
        basePrice,
        taxes,
        fees,
        totalAmount,
        currency: 'INR'
      },
      payment: {
        method: 'pending',
        status: 'pending'
      },
      notes: {
        customer: specialRequests
      }
    };

    const booking = await Booking.create(bookingData);

    // Populate the booking with destination details
    await booking.populate('destination', 'name images location');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
  try {
    const allowedUpdates = ['bookingDetails', 'contact', 'notes'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, isActive: true },
      updates,
      { new: true, runValidators: true }
    )
      .populate('destination', 'name images location')
      .populate('package', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    await booking.cancelBooking('user', reason);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        confirmationCode: booking.confirmationCode,
        refundAmount: booking.cancellation.refundAmount,
        cancellationFee: booking.cancellation.cancellationFee
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by confirmation code
// @route   GET /api/bookings/confirmation/:code
// @access  Private
exports.getBookingByConfirmationCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const booking = await Booking.findByConfirmationCode(code);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/statistics
// @access  Private/Admin
exports.getBookingStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await Booking.getStatistics(startDate, endDate);

    res.json({
      success: true,
      data: stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        confirmedBookings: 0,
        cancelledBookings: 0
      }
    });
  } catch (error) {
    next(error);
  }
};
