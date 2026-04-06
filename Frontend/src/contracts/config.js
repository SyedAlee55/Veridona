// Contract addresses on Sepolia testnet
// These should be updated after each deployment

export const CONTRACT_ADDRESSES = {
    DONATION_MODULE: import.meta.env.VITE_DONATION_MODULE_ADDRESS || '',
    DONATION_RECEIPT: import.meta.env.VITE_DONATION_RECEIPT_ADDRESS || '',
};

// Sepolia chain ID
export const CHAIN_ID = 11155111;

// Block explorer URL
export const BLOCK_EXPLORER_URL = 'https://sepolia.etherscan.io';

export const getExplorerTxUrl = (txHash) => `${BLOCK_EXPLORER_URL}/tx/${txHash}`;
export const getExplorerAddressUrl = (address) => `${BLOCK_EXPLORER_URL}/address/${address}`;
