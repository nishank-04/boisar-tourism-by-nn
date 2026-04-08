const mongoose = require('mongoose');

const chatbotSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  messages: [{
    userMessage: {
      type: String,
      required: true
    },
    botResponse: {
      type: String,
      required: true
    },
    intent: {
      type: String,
      enum: ['greeting', 'destinations', 'eco_tourism', 'cultural', 'planning', 'booking', 'support', 'general'],
      default: 'general'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  messageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  sessionDuration: {
    type: Number,
    default: 0 // in minutes
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatbotSessionSchema.index({ sessionId: 1 });
chatbotSessionSchema.index({ userId: 1 });
chatbotSessionSchema.index({ createdAt: -1 });
chatbotSessionSchema.index({ lastActivity: -1 });
chatbotSessionSchema.index({ isActive: 1 });

// Method to add message to session
chatbotSessionSchema.methods.addMessage = function(userMessage, botResponse, intent = 'general') {
  this.messages.push({
    userMessage,
    botResponse,
    intent,
    timestamp: new Date()
  });
  this.messageCount += 1;
  this.lastActivity = new Date();
  return this.save();
};

// Method to end session
chatbotSessionSchema.methods.endSession = function() {
  this.isActive = false;
  this.sessionDuration = Math.round((Date.now() - this.createdAt) / (1000 * 60)); // in minutes
  return this.save();
};

// Method to rate session
chatbotSessionSchema.methods.rateSession = function(rating, feedback = '') {
  this.satisfaction = {
    rating,
    feedback,
    ratedAt: new Date()
  };
  return this.save();
};

// Static method to get session statistics
chatbotSessionSchema.statics.getStatistics = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate || new Date()
    }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        totalMessages: { $sum: '$messageCount' },
        averageMessagesPerSession: { $avg: '$messageCount' },
        averageSessionDuration: { $avg: '$sessionDuration' },
        totalUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        totalSessions: 1,
        activeSessions: 1,
        totalMessages: 1,
        averageMessagesPerSession: { $round: ['$averageMessagesPerSession', 2] },
        averageSessionDuration: { $round: ['$averageSessionDuration', 2] },
        uniqueUsers: { $size: '$totalUsers' }
      }
    }
  ]);
};

// Static method to get popular intents
chatbotSessionSchema.statics.getPopularIntents = function(startDate, endDate, limit = 10) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate || new Date()
    }
  };

  return this.aggregate([
    { $match: matchStage },
    { $unwind: '$messages' },
    {
      $group: {
        _id: '$messages.intent',
        count: { $sum: 1 },
        uniqueSessions: { $addToSet: '$_id' }
      }
    },
    {
      $project: {
        intent: '$_id',
        count: 1,
        uniqueSessions: { $size: '$uniqueSessions' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get user satisfaction
chatbotSessionSchema.statics.getSatisfactionStats = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate || new Date()
    },
    'satisfaction.rating': { $exists: true }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$satisfaction.rating' },
        ratingDistribution: {
          $push: '$satisfaction.rating'
        }
      }
    },
    {
      $project: {
        totalRatings: 1,
        averageRating: { $round: ['$averageRating', 2] },
        ratingDistribution: {
          $reduce: {
            input: '$ratingDistribution',
            initialValue: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [
                      {
                        k: { $toString: '$$this' },
                        v: { $add: [{ $ifNull: [{ $getField: { field: { $toString: '$$this' }, input: '$$value' }}, 0] }, 1] }
                      }
                    ]
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

// Static method to find active sessions
chatbotSessionSchema.statics.findActiveSessions = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ lastActivity: -1 })
    .limit(limit)
    .populate('userId', 'name email');
};

// Static method to cleanup old sessions
chatbotSessionSchema.statics.cleanupOldSessions = function(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  return this.updateMany(
    {
      isActive: false,
      lastActivity: { $lt: cutoffDate }
    },
    {
      $set: { isActive: false }
    }
  );
};

module.exports = mongoose.model('ChatbotSession', chatbotSessionSchema);
