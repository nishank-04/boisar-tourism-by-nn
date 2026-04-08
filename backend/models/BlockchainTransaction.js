const mongoose = require('mongoose');

const blockchainTransactionSchema = new mongoose.Schema({
  // Transaction Details
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  blockHash: {
    type: String,
    required: true
  },
  
  // Transaction Type
  transactionType: {
    type: String,
    enum: ['booking_payment', 'guide_verification', 'homestay_verification', 'refund', 'commission'],
    required: true
  },
  
  // Parties Involved
  fromAddress: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  
  // Financial Details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'ETH'
  },
  gasUsed: {
    type: Number
  },
  gasPrice: {
    type: Number
  },
  
  // Related Entities
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  homestayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homestay'
  },
  
  // Smart Contract Details
  contractAddress: {
    type: String,
    required: true
  },
  contractMethod: {
    type: String,
    required: true
  },
  
  // Status and Verification
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'reverted'],
    default: 'pending'
  },
  confirmations: {
    type: Number,
    default: 0
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Timestamps
  transactionTimestamp: {
    type: Date,
    required: true
  },
  confirmedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
blockchainTransactionSchema.index({ transactionHash: 1 });
blockchainTransactionSchema.index({ fromAddress: 1 });
blockchainTransactionSchema.index({ toAddress: 1 });
blockchainTransactionSchema.index({ bookingId: 1 });
blockchainTransactionSchema.index({ status: 1 });
blockchainTransactionSchema.index({ transactionType: 1 });

// Virtual for transaction URL
blockchainTransactionSchema.virtual('explorerUrl').get(function() {
  const network = process.env.BLOCKCHAIN_NETWORK || 'sepolia';
  return `https://${network}.etherscan.io/tx/${this.transactionHash}`;
});

// Method to check if transaction is confirmed
blockchainTransactionSchema.methods.isConfirmed = function() {
  return this.status === 'confirmed' && this.confirmations >= 12;
};

// Method to get transaction summary
blockchainTransactionSchema.methods.getSummary = function() {
  return {
    hash: this.transactionHash,
    type: this.transactionType,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    confirmations: this.confirmations,
    explorerUrl: this.explorerUrl
  };
};

module.exports = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);

