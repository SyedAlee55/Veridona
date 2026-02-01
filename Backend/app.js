const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donor');
const receiverRoutes = require('./routes/receiver');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport Config
require('./config/passport')(passport);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/receiver', receiverRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;
