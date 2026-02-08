// Load environment variables FIRST before any other imports
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db.js');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
