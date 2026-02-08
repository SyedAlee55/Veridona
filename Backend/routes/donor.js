const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const donorController = require('../controllers/donorController');

// All routes here require JWT authentication and donor role
router.use(authenticateJWT, authorizeRole('donor'));

// Donor dashboard
router.get('/', donorController.getDonorDashboard);

// Donor profile
router.get('/profile', donorController.getDonorProfile);

// Add more donor-specific routes here
// router.post('/donate', donorController.makeDonation);
// router.get('/donations', donorController.getDonations);

module.exports = router;
