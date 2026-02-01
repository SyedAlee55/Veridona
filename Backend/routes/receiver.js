const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const receiverController = require('../controllers/receiverController');

// All routes here require JWT authentication and receiver role
router.use(authenticateJWT, authorizeRole('receiver'));

// Receiver dashboard
router.get('/receiver', receiverController.getReceiverDashboard);

// Receiver profile
router.get('/profile', receiverController.getReceiverProfile);

// Add more receiver-specific routes here
// router.post('/request', receiverController.createRequest);
// router.get('/requests', receiverController.getRequests);

module.exports = router;
