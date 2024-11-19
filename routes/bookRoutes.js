const express = require('express');
const router = express.Router();
const {verifyUser} = require('../middlewares/authMiddleware');
const { bookRoom, getAllRooms, cancelBooking, addExtraTime, getMyBookedRooms } = require('../controllers/bookController');

// Routes for booking rooms
router.post('/bookroom', verifyUser, bookRoom);
router.get('/allrooms', getAllRooms);
router.post('/cancelbooking', verifyUser, cancelBooking);
router.post('/addextratime', verifyUser, addExtraTime);
router.get('/mybookedrooms', verifyUser, getMyBookedRooms);

module.exports = router;
