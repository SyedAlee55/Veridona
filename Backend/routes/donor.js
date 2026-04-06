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

const contactController = require('../controllers/contact.controller');

// Add more donor-specific routes here
// router.post('/donate', donorController.makeDonation);
// router.get('/donations', donorController.getDonations);

// Contact route
router.post('/contact', contactController.sendContactEmail);

// Wallet linking route
router.post('/link-wallet', donorController.linkWallet);

// NFT routes
router.get('/nfts', donorController.getNFTs);
router.post('/claim-nft/:nftId', donorController.claimNFT);

module.exports = router;
