const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Trip title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  duration: {
    days: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  groupSize: {
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
  budget: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  interests: [{
    type: String,
    enum: ['wildlife', 'trekking', 'photography', 'waterfalls', 'camping', 'birdwatching', 'tribal', 'dance', 'handicrafts', 'cuisine', 'village', 'music']
  }],
  accommodation: {
    type: String,
    enum: ['homestay', 'hotel', 'resort', 'camping'],
    required: true
  },
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    activities: [{
      time: String,
      activity: {
        type: String,
        required: true
      },
      location: {
        type: String,
        required: true
      },
      duration: String,
      description: String,
      cost: {
        type: Number,
        default: 0
      },
      bookingRequired: {
        type: Boolean,
        default: false
      },
      isBooked: {
        type: Boolean,
        default: false
      },
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      }
    }],
    meals: [{
      type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snacks']
      },
      time: String,
      location: String,
      description: String,
      cost: {
        type: Number,
        default: 0
      }
    }],
    accommodation: {
      name: String,
      location: String,
      type: String,
      cost: {
        type: Number,
        default: 0
      },
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      }
    },
    transport: [{
      type: String,
      from: String,
      to: String,
      time: String,
      duration: String,
      cost: {
        type: Number,
        default: 0
      },
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      }
    }],
    notes: String
  }],
  destinations: [{
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true
    },
    visitDate: Date,
    duration: String,
    priority: {
      type: String,
      enum: ['must-see', 'optional', 'if-time-permits'],
      default: 'must-see'
    }
  }],
  estimatedCost: {
    accommodation: {
      type: Number,
      default: 0
    },
    activities: {
      type: Number,
      default: 0
    },
    transport: {
      type: Number,
      default: 0
    },
    meals: {
      type: Number,
      default: 0
    },
    miscellaneous: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'planned', 'booked', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareCode: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [String],
  notes: {
    personal: String,
    packing: [String],
    important: [String]
  },
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
tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ status: 1 });
tripSchema.index({ isPublic: 1 });
tripSchema.index({ shareCode: 1 });
tripSchema.index({ 'duration.startDate': 1 });
tripSchema.index({ tags: 1 });

// Pre-save middleware to calculate end date and total cost
tripSchema.pre('save', function(next) {
  // Calculate end date
  if (this.duration.startDate && this.duration.days) {
    this.duration.endDate = new Date(this.duration.startDate);
    this.duration.endDate.setDate(this.duration.endDate.getDate() + this.duration.days - 1);
  }

  // Calculate total estimated cost
  if (this.estimatedCost) {
    this.estimatedCost.total = 
      this.estimatedCost.accommodation +
      this.estimatedCost.activities +
      this.estimatedCost.transport +
      this.estimatedCost.meals +
      this.estimatedCost.miscellaneous;
  }

  next();
});

// Method to generate share code
tripSchema.methods.generateShareCode = function() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.shareCode = code;
  return code;
};

// Method to calculate total cost
tripSchema.methods.calculateTotalCost = function() {
  this.estimatedCost.total = 
    this.estimatedCost.accommodation +
    this.estimatedCost.activities +
    this.estimatedCost.transport +
    this.estimatedCost.meals +
    this.estimatedCost.miscellaneous;
  
  return this.estimatedCost.total;
};

// Method to add activity to itinerary
tripSchema.methods.addActivity = function(day, activity) {
  const dayIndex = this.itinerary.findIndex(item => item.day === day);
  if (dayIndex !== -1) {
    this.itinerary[dayIndex].activities.push(activity);
  }
  return this.save();
};

// Method to update trip status
tripSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Static method to find by user
tripSchema.statics.findByUser = function(userId, limit = 10, skip = 0) {
  return this.find({ user: userId, isActive: true })
    .populate('destinations.destination', 'name images location')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to find by share code
tripSchema.statics.findByShareCode = function(shareCode) {
  return this.findOne({ shareCode, isPublic: true, isActive: true })
    .populate('user', 'name')
    .populate('destinations.destination', 'name images location');
};

// Static method to find public trips
tripSchema.statics.findPublic = function(limit = 10, skip = 0) {
  return this.find({ isPublic: true, isActive: true })
    .populate('user', 'name')
    .populate('destinations.destination', 'name images location')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Trip', tripSchema);
