const express = require('express');
const router = express.Router();
const { verifyUser, verifyAdmin } = require('../middlewares/authMiddleware');
const { getRoomDetails, getAllIncompleteBookings, discardBooking, completeBooking, checkIn, getAllBookings, autoCompleteBookings } = require('../controllers/adminController');

// Routes for admin pages
router.get('/getroomdetails', verifyUser, verifyAdmin, getRoomDetails);
router.get('/allincompletebookings', verifyUser, verifyAdmin, getAllIncompleteBookings);
router.post('/discardbooking', verifyUser, verifyAdmin, discardBooking);
router.post('/completebook', verifyUser, verifyAdmin, completeBooking);
router.get('/getallbookings', verifyUser, verifyAdmin, getAllBookings);
router.post('/checkin', verifyUser, verifyAdmin, checkIn);
router.patch('/autocomplete', verifyUser, verifyAdmin, autoCompleteBookings);

module.exports = router;
