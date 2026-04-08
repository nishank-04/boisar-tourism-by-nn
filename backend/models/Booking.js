const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  bookingType: {
    type: String,
    required: true,
    enum: ['accommodation', 'activity', 'transport', 'guide', 'package']
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  },
  bookingDetails: {
    checkIn: Date,
    checkOut: Date,
    guests: {
      adults: {
        type: Number,
        min: 1,
        default: 1
      },
      children: {
        type: Number,
        min: 0,
        default: 0
      },
      infants: {
        type: Number,
        min: 0,
        default: 0
      }
    },
    rooms: {
      type: Number,
      min: 1,
      default: 1
    },
    activities: [{
      activityId: String,
      name: String,
      date: Date,
      time: String,
      participants: Number,
      price: Number
    }],
    transport: {
      type: String,
      vehicle: String,
      pickup: String,
      dropoff: String,
      date: Date,
      time: String
    },
    specialRequests: String
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    fees: {
      type: Number,
      default: 0
    },
    discounts: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cash'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending'
    },
    transactionId: String,
    paymentId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  confirmationCode: {
    type: String,
    unique: true,
    required: true
  },
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['user', 'admin', 'system']
    },
    reason: String,
    refundEligible: {
      type: Boolean,
      default: true
    },
    refundAmount: Number,
    cancellationFee: {
      type: Number,
      default: 0
    }
  },
  contact: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  notes: {
    internal: String,
    customer: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['id-proof', 'booking-voucher', 'receipt', 'other']
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reviews: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ destination: 1 });
bookingSchema.index({ confirmationCode: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ 'bookingDetails.checkIn': 1 });
bookingSchema.index({ createdAt: -1 });

// Pre-save middleware to generate confirmation code
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.confirmationCode) {
    this.confirmationCode = this.generateConfirmationCode();
  }
  next();
});

// Method to generate confirmation code
bookingSchema.methods.generateConfirmationCode = function() {
  const prefix = 'JH';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Method to calculate total amount
bookingSchema.methods.calculateTotalAmount = function() {
  this.pricing.totalAmount = this.pricing.basePrice + this.pricing.taxes + this.pricing.fees - this.pricing.discounts;
  return this.pricing.totalAmount;
};

// Method to cancel booking
bookingSchema.methods.cancelBooking = function(cancelledBy, reason) {
  this.cancellation.isCancelled = true;
  this.cancellation.cancelledAt = new Date();
  this.cancellation.cancelledBy = cancelledBy;
  this.cancellation.reason = reason;
  this.status = 'cancelled';
  
  // Calculate refund based on cancellation policy
  const daysUntilCheckIn = Math.ceil((this.bookingDetails.checkIn - new Date()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilCheckIn > 7) {
    this.cancellation.refundAmount = this.pricing.totalAmount * 0.9; // 90% refund
    this.cancellation.cancellationFee = this.pricing.totalAmount * 0.1;
  } else if (daysUntilCheckIn > 3) {
    this.cancellation.refundAmount = this.pricing.totalAmount * 0.7; // 70% refund
    this.cancellation.cancellationFee = this.pricing.totalAmount * 0.3;
  } else {
    this.cancellation.refundAmount = this.pricing.totalAmount * 0.5; // 50% refund
    this.cancellation.cancellationFee = this.pricing.totalAmount * 0.5;
  }
  
  return this.save();
};

// Method to mark as completed
bookingSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Static method to find by user
bookingSchema.statics.findByUser = function(userId, limit = 10, skip = 0) {
  return this.find({ user: userId, isActive: true })
    .populate('destination', 'name images location')
    .populate('package', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to find by confirmation code
bookingSchema.statics.findByConfirmationCode = function(code) {
  return this.findOne({ confirmationCode: code, isActive: true })
    .populate('user', 'name email phone')
    .populate('destination', 'name images location contact')
    .populate('package', 'name');
};

// Static method to get booking statistics
bookingSchema.statics.getStatistics = function(startDate, endDate) {
  const matchStage = {
    isActive: true,
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      $lte: endDate || new Date()
    }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageBookingValue: { $avg: '$pricing.totalAmount' },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Booking', bookingSchema);
