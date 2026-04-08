const { ethers } = require('ethers');
const BlockchainTransaction = require('../models/BlockchainTransaction');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.tourismContract = null;
    this.isAvailable = false;
    this.initializeProvider();
  }

  initializeProvider() {
    try {
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
      if (!rpcUrl || rpcUrl.includes('YOUR_INFURA_KEY')) {
        console.warn('⚠️  Blockchain: No RPC URL configured — blockchain features disabled.');
        return;
      }

      // ethers v5/v6 compatible provider initialization
      if (ethers.providers) {
        // ethers v5
        this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      } else {
        // ethers v6
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
      }

      this.isAvailable = true;
      console.log('✅ Blockchain provider initialized');
    } catch (error) {
      console.warn('⚠️  Blockchain provider init failed (non-critical):', error.message);
    }
  }

  getTourismContractABI() {
    return [
      "event BookingCreated(uint256 indexed bookingId, address indexed user, uint256 amount, uint256 timestamp)",
      "event GuideVerified(uint256 indexed guideId, address indexed guide, bool verified, uint256 timestamp)",
      "event PaymentProcessed(uint256 indexed bookingId, address indexed from, address indexed to, uint256 amount)",
      "function createBooking(uint256 _bookingId, uint256 _amount) external payable",
      "function verifyGuide(uint256 _guideId, address _guide, bool _verified) external",
      "function getBookingStatus(uint256 _bookingId) external view returns (bool)",
      "function getContractBalance() external view returns (uint256)"
    ];
  }

  async initializeContracts() {
    try {
      const contractAddress = process.env.TOURISM_CONTRACT_ADDRESS;
      const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

      if (!contractAddress || !privateKey || !this.provider) {
        console.warn('⚠️  Smart contracts not configured — blockchain payments disabled.');
        return;
      }

      // ethers v5/v6 compatible wallet
      const wallet = ethers.Wallet
        ? new ethers.Wallet(privateKey, this.provider)
        : new ethers.Wallet(privateKey, this.provider);

      this.tourismContract = new ethers.Contract(
        contractAddress,
        this.getTourismContractABI(),
        wallet
      );

      console.log('✅ Smart contracts initialized');
    } catch (error) {
      console.warn('⚠️  Contract init failed (non-critical):', error.message);
    }
  }

  _parseEther(amount) {
    // ethers v5/v6 compatible
    if (ethers.utils) return ethers.utils.parseEther(amount.toString());
    return ethers.parseEther(amount.toString());
  }

  _formatEther(amount) {
    if (ethers.utils) return ethers.utils.formatEther(amount);
    return ethers.formatEther(amount);
  }

  _isAddress(address) {
    if (ethers.utils) return ethers.utils.isAddress(address);
    return ethers.isAddress(address);
  }

  async createBookingTransaction(bookingId, amount, userAddress) {
    if (!this.tourismContract) {
      return { success: false, error: 'Blockchain contract not configured' };
    }
    try {
      const tx = await this.tourismContract.createBooking(
        bookingId,
        this._parseEther(amount),
        { value: this._parseEther(amount), gasLimit: 300000 }
      );
      const receipt = await tx.wait();
      await BlockchainTransaction.create({
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        transactionType: 'booking_payment',
        fromAddress: userAddress,
        toAddress: this.tourismContract.address || this.tourismContract.target,
        amount, currency: 'ETH',
        bookingId, status: 'confirmed', confirmations: 1,
        transactionTimestamp: new Date(), confirmedAt: new Date()
      });
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        explorerUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`
      };
    } catch (error) {
      console.error('❌ Booking transaction failed:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyGuide(guideId, guideAddress, verified) {
    if (!this.tourismContract) return { success: false, error: 'Contract not configured' };
    try {
      const tx = await this.tourismContract.verifyGuide(guideId, guideAddress, verified, { gasLimit: 200000 });
      const receipt = await tx.wait();
      return { success: true, transactionHash: tx.hash, verified,
        explorerUrl: `https://sepolia.etherscan.io/tx/${tx.hash}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTransactionStatus(transactionHash) {
    if (!this.provider) return { status: 'unavailable' };
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      if (!receipt) return { status: 'pending' };
      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  isValidAddress(address) {
    try { return this._isAddress(address); } catch { return false; }
  }

  toWei(amount) { return this._parseEther(amount); }
  fromWei(amount) { return this._formatEther(amount); }

  async getContractBalance() {
    if (!this.tourismContract) return 0;
    try {
      const balance = await this.tourismContract.getContractBalance();
      return this._formatEther(balance);
    } catch { return 0; }
  }
}

module.exports = new BlockchainService();
