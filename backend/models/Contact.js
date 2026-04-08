const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid phone number']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'booking', 'complaint', 'suggestion', 'partnership', 'other'],
    default: 'general'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reply: {
    message: String,
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    repliedAt: Date
  },
  tags: [String],
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ category: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });

// Method to mark as read
contactSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Method to add a reply to message
contactSchema.methods.addReply = function(replyMessage, repliedBy) {
  this.reply = {
    message: replyMessage,
    repliedBy,
    repliedAt: new Date()
  };
  this.status = 'replied';
  return this.save();
};

// Method to close message
contactSchema.methods.close = function(closedBy) {
  this.status = 'closed';
  this.isResolved = true;
  this.resolvedAt = new Date();
  this.resolvedBy = closedBy;
  return this.save();
};

// Static method to get statistics
contactSchema.statics.getStatistics = function(startDate, endDate) {
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
        totalMessages: { $sum: 1 },
        newMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
        },
        readMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        repliedMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] }
        },
        closedMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
        },
        urgentMessages: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get messages by status
contactSchema.statics.getByStatus = function(status, limit = 10, skip = 0) {
  return this.find({ status, isActive: true })
    .populate('assignedTo', 'name email')
    .populate('reply.repliedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Contact', contactSchema);
