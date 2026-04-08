// Web3 Integration for Boisar Tourism Platform
class Web3Integration {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.userAccount = null;
    this.isConnected = false;
    this.contractAddress = '0x...'; // Your deployed contract address
    this.contractABI = [
      // Contract ABI will be loaded from backend
    ];
  }

  // Initialize Web3 connection
  async initialize() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        this.web3 = new Web3(window.ethereum);
        console.log('✅ Web3 initialized with MetaMask');
        return true;
      } else {
        console.warn('⚠️ MetaMask not detected');
        this.showMetaMaskInstallPrompt();
        return false;
      }
    } catch (error) {
      console.error('❌ Web3 initialization failed:', error);
      return false;
    }
  }

  // Connect to MetaMask
  async connectWallet() {
    try {
      if (!this.web3) {
        await this.initialize();
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        this.userAccount = accounts[0];
        this.isConnected = true;
        console.log('✅ Wallet connected:', this.userAccount);
        
        // Update UI
        this.updateWalletUI();
        
        return {
          success: true,
          account: this.userAccount
        };
      } else {
        throw new Error('No accounts found');
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Disconnect wallet
  disconnectWallet() {
    this.userAccount = null;
    this.isConnected = false;
    this.updateWalletUI();
    console.log('🔌 Wallet disconnected');
  }

  // Update wallet UI
  updateWalletUI() {
    const walletButton = document.getElementById('walletButton');
    const walletAddress = document.getElementById('walletAddress');
    const walletStatus = document.getElementById('walletStatus');

    if (this.isConnected && this.userAccount) {
      if (walletButton) {
        walletButton.textContent = 'Disconnect Wallet';
        walletButton.onclick = () => this.disconnectWallet();
        walletButton.className = 'btn btn-outline-danger';
      }
      
      if (walletAddress) {
        walletAddress.textContent = this.formatAddress(this.userAccount);
        walletAddress.style.display = 'block';
      }
      
      if (walletStatus) {
        walletStatus.textContent = 'Connected';
        walletStatus.className = 'text-success';
      }
    } else {
      if (walletButton) {
        walletButton.textContent = 'Connect Wallet';
        walletButton.onclick = () => this.connectWallet();
        walletButton.className = 'btn btn-primary';
      }
      
      if (walletAddress) {
        walletAddress.style.display = 'none';
      }
      
      if (walletStatus) {
        walletStatus.textContent = 'Not Connected';
        walletStatus.className = 'text-danger';
      }
    }
  }

  // Format wallet address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Show MetaMask install prompt
  showMetaMaskInstallPrompt() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">MetaMask Required</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>To use blockchain features, please install MetaMask:</p>
            <a href="https://metamask.io/download/" target="_blank" class="btn btn-primary">
              Install MetaMask
            </a>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
      document.body.removeChild(modal);
    });
  }

  // Create booking transaction
  async createBookingTransaction(bookingId, amount) {
    try {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      // Get contract ABI from backend
      const response = await fetch('/api/blockchain/contract-abi');
      const { abi } = await response.json();
      
      this.contract = new this.web3.eth.Contract(abi, this.contractAddress);

      // Convert amount to Wei
      const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');

      // Create transaction
      const tx = await this.contract.methods.createBooking(
        bookingId,
        amountWei
      ).send({
        from: this.userAccount,
        value: amountWei,
        gas: 300000
      });

      console.log('✅ Booking transaction created:', tx.transactionHash);

      // Save transaction to backend
      const saveResponse = await fetch('/api/blockchain/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: amount,
          userAddress: this.userAccount,
          transactionHash: tx.transactionHash
        })
      });

      const result = await saveResponse.json();

      if (result.success) {
        this.showTransactionSuccess(tx.transactionHash);
        return {
          success: true,
          transactionHash: tx.transactionHash,
          explorerUrl: `https://sepolia.etherscan.io/tx/${tx.transactionHash}`
        };
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('❌ Booking transaction failed:', error);
      this.showTransactionError(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Show transaction success
  showTransactionSuccess(transactionHash) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-success">✅ Transaction Successful</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Your booking transaction has been processed successfully!</p>
            <p><strong>Transaction Hash:</strong></p>
            <code>${transactionHash}</code>
            <br><br>
            <a href="https://sepolia.etherscan.io/tx/${transactionHash}" target="_blank" class="btn btn-outline-primary">
              View on Etherscan
            </a>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
      document.body.removeChild(modal);
    });
  }

  // Show transaction error
  showTransactionError(errorMessage) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">❌ Transaction Failed</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Your transaction could not be processed:</p>
            <p class="text-danger">${errorMessage}</p>
            <p>Please try again or contact support if the problem persists.</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
      document.body.removeChild(modal);
    });
  }

  // Get transaction status
  async getTransactionStatus(transactionHash) {
    try {
      const response = await fetch(`/api/blockchain/transaction/${transactionHash}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Failed to get transaction status:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's transactions
  async getUserTransactions() {
    try {
      const response = await fetch('/api/blockchain/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Failed to get user transactions:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate address
  async validateAddress(address) {
    try {
      const response = await fetch('/api/blockchain/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Failed to validate address:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen for account changes
  setupAccountListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.userAccount = accounts[0];
          this.updateWalletUI();
        } else {
          this.disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed:', chainId);
        // Reload page to ensure proper network
        window.location.reload();
      });
    }
  }
}

// Initialize Web3 integration
const web3Integration = new Web3Integration();

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await web3Integration.initialize();
  web3Integration.setupAccountListener();
  web3Integration.updateWalletUI();
});

// Export for global use
window.web3Integration = web3Integration;

