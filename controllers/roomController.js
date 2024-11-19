const Room = require('../models/roomModel');
const cloudinary = require('cloudinary').v2;
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100 }); // Cache TTL set to 100 seconds

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: 'dtlohjvcm',
    api_key: '743143472995847',
    api_secret: '9u6xnWJEE4woXHaa_pfWKoj2rx8'
});

// Add new room
exports.addNewRoom = async (req, res) => {
    const { roomNo, roomDetails, Price } = req.body;

    if (!roomNo || !roomDetails || !Price) {
        return res.status(400).json({ success: false, message: 'Please provide all details.' });
    }

    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'No image provided.' });
        }

        let uploadedImage;

        // Upload image to Cloudinary
        const uploadImage = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'rooms' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                stream.end(file.buffer);
            });
        };

        uploadedImage = await uploadImage();

        const newRoom = new Room({
            roomNo,
            roomDetails,
            Price,
            roomPictures: uploadedImage
        });

        cache.flushAll();

        await newRoom.save();
        return res.status(201).json({ success: true, message: "Room Added Successfully" });

    } catch (error) {
        console.error('Error occurred while adding room:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all rooms with pagination and caching
exports.getAllRooms = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    const cacheKey = `rooms_${page}_${limit}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.status(200).json({ success: true, message: cachedData });
    }

    try {
        const rooms = await Room.find()
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Room.countDocuments();
        const pages = Math.ceil(total / limit);

        const response = {
            rooms,
            currentPage: page,
            totalPages: pages,
            totalRooms: total
        };

        cache.set(cacheKey, response);

        return res.status(200).json({ success: true, message: response });

    } catch (error) {
        console.error('Error occurred while fetching rooms:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get single room by room number with caching
exports.getSingleRoom = async (req, res) => {
    const { roomNo } = req.params;
    const cacheKey = `room_${roomNo}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.status(200).json({ success: true, message: cachedData });
    }

    try {
        const room = await Room.findOne({ roomNo });

        if (room) {
            cache.set(cacheKey, room);
            return res.status(200).json({ success: true, message: room });
        } else {
            return res.status(404).json({ success: false, message: "Room not found" });
        }
    } catch (error) {
        console.error('Error occurred while fetching room:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
