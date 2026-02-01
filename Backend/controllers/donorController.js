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

// Add more donor-specific operations here
exports.getDonorProfile = async (req, res) => {
    try {
        // Fetch donor-specific profile information
        res.json({
            message: 'Donor profile',
            user: req.user
        });
    } catch (err) {
        console.error('Donor profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
