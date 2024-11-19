const express = require('express');
const router = express.Router();
const {verifyUser, verifyAdmin} = require('../middlewares/authMiddleware');
const multer = require('multer');
const { addNewRoom, getAllRooms, getSingleRoom } = require('../controllers/roomController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes for rooms
router.post('/newroom', verifyUser, verifyAdmin, upload.single('roomPictures'), addNewRoom);
router.get('/allrooms', getAllRooms);
router.get('/singleroom/:roomNo', getSingleRoom);

module.exports = router;
