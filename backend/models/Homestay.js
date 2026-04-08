const mongoose = require('mongoose');

const homestaySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerPhone: {
    type: String,
    required: true
  },
  ownerEmail: {
    type: String,
    required: true
  },
  
  // Location Details
  address: {
    street: String,
    city: String,
    district: String,
    state: {
      type: String,
      default: 'Boisar'
    },
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Property Details
  propertyType: {
    type: String,
    enum: ['traditional_hut', 'modern_home', 'farmhouse', 'treehouse', 'eco_lodge'],
    required: true
  },
  capacity: {
    adults: {
      type: Number,
      required: true,
      min: 1
    },
    children: {
      type: Number,
      default: 0
    }
  },
  rooms: {
    total: {
      type: Number,
      required: true
    },
    available: {
      type: Number,
      required: true
    }
  },
  
  // Amenities
  amenities: [{
    name: String,
    icon: String,
    available: {
      type: Boolean,
      default: true
    }
  }],
  
  // Pricing
  pricing: {
    perNight: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    includes: [String], // e.g., ['meals', 'transportation', 'guide']
    extraCharges: [{
      name: String,
      amount: Number
    }]
  },
  
  // Blockchain Verification
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationHash: String, // Blockchain transaction hash
    verificationLevel: {
      type: String,
      enum: ['basic', 'premium', 'certified'],
      default: 'basic'
    },
    documents: [{
      type: {
        type: String,
        enum: ['property_deed', 'license', 'insurance', 'safety_certificate']
      },
      hash: String, // IPFS hash
      verified: Boolean
    }]
  },
  
  // Reviews and Ratings
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Images
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Availability
  availability: [{
    date: Date,
    available: {
      type: Boolean,
      default: true
    },
    price: Number
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },
  
  // Blockchain Integration
  blockchain: {
    contractAddress: String,
    tokenId: String,
    nftMetadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  
  // Local Experience
  localExperiences: [{
    name: String,
    description: String,
    duration: String,
    price: Number,
    includes: [String]
  }],
  
  // Cultural Information
  culturalInfo: {
    localLanguage: [String],
    culturalPractices: [String],
    localCuisine: [String],
    festivals: [String]
  }
}, {
  timestamps: true
});

// Indexes
homestaySchema.index({ owner: 1 });
homestaySchema.index({ 'address.city': 1 });
homestaySchema.index({ 'address.district': 1 });
homestaySchema.index({ status: 1 });
homestaySchema.index({ 'verification.isVerified': 1 });
homestaySchema.index({ averageRating: -1 });
homestaySchema.index({ 'address.coordinates': '2dsphere' });

// Virtual for verification status
homestaySchema.virtual('isFullyVerified').get(function() {
  return this.verification.isVerified && 
         this.verification.verificationLevel === 'certified' &&
         this.status === 'active';
});

// Method to calculate average rating
homestaySchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.reviews.length;
    this.totalReviews = this.reviews.length;
  }
  return this.averageRating;
};

// Method to add review
homestaySchema.methods.addReview = function(userId, rating, comment) {
  this.reviews.push({
    user: userId,
    rating: rating,
    comment: comment,
    verified: true // Blockchain verified
  });
  this.calculateAverageRating();
  return this.save();
};

// Method to check availability
homestaySchema.methods.isAvailable = function(checkIn, checkOut) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
    const availability = this.availability.find(av => 
      av.date.toDateString() === d.toDateString()
    );
    if (!availability || !availability.available) {
      return false;
    }
  }
  return true;
};

module.exports = mongoose.model('Homestay', homestaySchema);

