const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide destination name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['eco-tourism', 'cultural', 'adventure', 'religious', 'historical']
  },
  category: {
    type: String,
    required: true,
    enum: ['National Park', 'Wildlife Sanctuary', 'Waterfall', 'Hill Station', 'Museum', 'Temple', 'Village', 'Lake', 'Cave', 'Fort', 'Beach', 'Trek', 'Heritage Site', 'Village Tourism']
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot be more than 300 characters']
  },
  location: {
    address: String,
    district: {
      type: String,
      required: true
    },
    state: {
      type: String,
      default: 'Maharashtra'
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    region: {
      type: String,
      enum: ['north', 'south', 'east', 'west', 'coastal', 'inland'],
      required: true
    }
  },
  images: [{
    public_id: String,
    url: {
      type: String,
      required: true
    },
    alt: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  highlights: [{
    type: String,
    maxlength: [100, 'Highlight cannot be more than 100 characters']
  }],
  activities: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    duration: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy'
    },
    price: {
      type: Number,
      min: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  facilities: [{
    type: String,
    enum: ['parking', 'restroom', 'restaurant', 'accommodation', 'guide', 'transport', 'first-aid', 'wifi', 'atm', 'souvenir-shop', 'food-stalls', 'food']
  }],
  timings: {
    open: String,
    close: String,
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    seasonal: {
      isSeasonal: Boolean,
      season: String,
      startDate: Date,
      endDate: Date
    }
  },
  pricing: {
    entryFee: {
      adult: {
        type: Number,
        min: 0,
        default: 0
      },
      child: {
        type: Number,
        min: 0,
        default: 0
      },
      senior: {
        type: Number,
        min: 0,
        default: 0
      },
      foreigner: {
        type: Number,
        min: 0,
        default: 0
      }
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  bestTimeToVisit: {
    months: [{
      type: String,
      enum: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    }],
    season: {
      type: String,
      enum: ['summer', 'monsoon', 'winter', 'spring']
    },
    description: String
  },
  accessibility: {
    wheelchair: Boolean,
    elderly: Boolean,
    children: Boolean,
    notes: String
  },
  contact: {
    phone: String,
    email: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: [500, 'Review cannot be more than 500 characters']
    },
    images: [String],
    isVerified: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
destinationSchema.index({ name: 'text', description: 'text', 'location.district': 'text' });
destinationSchema.index({ type: 1, category: 1 });
destinationSchema.index({ 'location.region': 1 });
destinationSchema.index({ isActive: 1, isFeatured: 1 });
destinationSchema.index({ 'ratings.average': -1 });
destinationSchema.index({ slug: 1 });

// Pre-save middleware to generate slug
destinationSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual for primary image
destinationSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Method to calculate average rating
destinationSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.ratings.count = this.reviews.length;
  }
};

// Method to add review
destinationSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  this.calculateAverageRating();
  return this.save();
};

// Method to increment view count
destinationSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to find by region
destinationSchema.statics.findByRegion = function(region) {
  return this.find({ 'location.region': region, isActive: true });
};

// Static method to find featured destinations
destinationSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true }).sort({ 'ratings.average': -1 });
};

// Static method to search destinations
destinationSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $and: [
      { isActive: true },
      { $text: { $search: query } }
    ]
  };

  if (filters.type) {
    searchQuery.$and.push({ type: filters.type });
  }

  if (filters.region) {
    searchQuery.$and.push({ 'location.region': filters.region });
  }

  if (filters.minRating) {
    searchQuery.$and.push({ 'ratings.average': { $gte: filters.minRating } });
  }

  return this.find(searchQuery).sort({ 'ratings.average': -1, viewCount: -1 });
};

module.exports = mongoose.model('Destination', destinationSchema);
