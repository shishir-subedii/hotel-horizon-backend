const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookRoutes = require('./routes/bookRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const dbConnect = require('./config/db'); // Ensure the correct path to db.js

dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors());

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/booking', bookRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware should be the last middleware
app.use(errorMiddleware);

// Root route
app.get('/', (req, res) => {
    return res.send('Hotel Horizon Server Started');
});

// Connect to the database
dbConnect(); // Connect to the database here

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} on ${new Date()}`);
});
