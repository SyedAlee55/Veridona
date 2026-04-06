// Controller for donor-specific operations
const User = require('../models/User');

exports.getDonorDashboard = async (req, res) => {
    try {
        res.json({
            message: `Hello ${req.user.role}`,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
                walletAddress: req.user.walletAddress || null,
            }
        });
    } catch (err) {
        console.error('Donor dashboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Donor profile
exports.getDonorProfile = async (req, res) => {
    try {
        res.json({
            message: 'Donor profile',
            user: req.user
        });
    } catch (err) {
        console.error('Donor profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Link wallet address to user account
exports.linkWallet = async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
            return res.status(400).json({ message: 'Invalid wallet address' });
        }

        // Check if wallet is already linked to another account
        const existing = await User.findOne({ walletAddress, _id: { $ne: req.user._id } });
        if (existing) {
            return res.status(400).json({ message: 'Wallet already linked to another account' });
        }

        await User.findByIdAndUpdate(req.user._id, { walletAddress });
        res.json({ message: 'Wallet linked successfully', walletAddress });
    } catch (err) {
        console.error('Link wallet error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// NFTs are now read directly from the blockchain on the frontend
// This endpoint returns guidance on how NFTs work
exports.getNFTs = async (req, res) => {
    try {
        res.json({
            message: 'NFTs are on-chain. Connect your wallet on the ClaimNFT page to see your Soulbound Veridona Receipt.',
            nfts: [],
        });
    } catch (err) {
        console.error('Fetch NFTs error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Claim NFT — now handled by the smart contract automatically on first donation
exports.claimNFT = async (req, res) => {
    try {
        res.json({
            message: 'NFT claiming is now automated on-chain. Your Soulbound NFT is minted automatically when you make your first donation via the smart contract.',
        });
    } catch (err) {
        console.error('Claim NFT error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
