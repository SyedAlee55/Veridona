// Controller for donor-specific operations
exports.getDonorDashboard = async (req, res) => {
    try {
        res.json({
            message: `Hello ${req.user.role}`,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role
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

// Fetch available and claimed NFTs for donor
exports.getNFTs = async (req, res) => {
    try {
        // Dummy data for now
        const nfts = [
            { id: 'nft1', name: 'Life Saver Gold Certificate', eligibleDate: '2024-03-01', claimed: false },
            { id: 'nft2', name: 'Blood Hero Badge', eligibleDate: '2024-02-15', claimed: true },
            { id: 'nft3', name: 'Veridona Supporter Certificate', eligibleDate: '2024-01-10', claimed: true },
        ];
        res.json({ nfts });
    } catch (err) {
        console.error('Fetch NFTs error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Claim a specific NFT
exports.claimNFT = async (req, res) => {
    try {
        const { nftId } = req.params;
        // Logic to link NFT to user in database would go here
        res.json({
            message: 'NFT claimed successfully!',
            nftId: nftId,
            status: 'claimed'
        });
    } catch (err) {
        console.error('Claim NFT error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
