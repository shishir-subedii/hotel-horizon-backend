const Booking = require('../models/bookModel');
const Room = require('../models/roomModel');
const User = require('../models/userModel');
const { sendMessageViaEmail } = require('../services/mailService.js');

const bookRoom = async (req, res) => {
    const randomNo = 5000 + (9999 - 5000) * Math.random();
    let randomNumber = Math.round(randomNo);

    const { to, from, roomNo } = req.body;
    if (!to || !from || !roomNo) {
        return res.status(400).json({ success: false, message: "Fill The Data Properly" });
    }
    try {
        const toDate = new Date(to).getTime();
        const fromDate = new Date(from).getTime();

        if (fromDate > toDate) {
            return res.status(400).json({ success: false, message: "From Date Should Be Less Than To Date" });
        }
        if (fromDate > (Date.now() + 86400000)) {
            return res.status(400).json({ success: false, message: "From Date Should Not Be Greater Than Tomorrow" });
        }
        if (fromDate < Date.now()) {
            return res.status(400).json({ success: false, message: "From Date Should Be Greater than now's time" });
        }

        const user = await User.findById(req.user);
        const email = user.email;
        const room = await Room.findOne({ roomNo: roomNo });

        if (room.isBooked) {
            return res.status(400).json({ success: false, message: "Room Already Booked" });
        }

        const book = new Booking({
            to, from, roomNo, email, UserName: user.name, bookId: `${roomNo}_${randomNumber}_${Date.now()}`
        });

        const booked = await book.save();
        if (booked) {
            await room.updateOne({ isBooked: true, bookedTill: to });

            const message = `Dear ${user.name}, You have booked room ${roomNo} in our hotel from ${from} to ${to}. 
                Thank You for using our service. You should pay the price when you come to hotel. 
                You can cancel the booking under 2 hours if you want. If you exceed two hours then you need to call the hotel. 
                You should come to hotel under 24 hours of Check-In date.
                
                From Hotel Horizon`;

            sendMessageViaEmail(email, 'Your Booking Confirmation - Hotel Horizon', message);

            return res.status(201).json({ success: true, message: "Room Booked Successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Room Booking Failed" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const getAllRooms = async (req, res) => {
    const { page, limit } = req.query;
    try {
        const rooms = await Room.find().limit(limit * 1).skip((page - 1) * limit);
        if (rooms.length > 0) {
            return res.status(200).json({ success: true, total: rooms.length, message: "Rooms Fetched Successfully", rooms });
        } else {
            return res.status(404).json({ success: false, message: "No Rooms Found" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const cancelBooking = async (req, res) => {
    const { roomNo } = req.body;
    if (!roomNo) {
        return res.status(400).json({ success: false, message: "Please Enter Room Number" });
    }
    try {
        const room = await Room.findOne({ roomNo });
        const booking = await Booking.findOne({ roomNo, completed: false });
        const user = await User.findOne({ _id: req.user });

        if (room && booking) {
            const bookedDate = new Date(booking.bookedDate).getTime();
            const currentTime = Date.now();

            if ((currentTime - bookedDate) > 7200000) {
                return res.status(400).json({ success: false, message: "You can't cancel it after 2 hours of booking. Please contact the hotel for cancellation." });
            }

            if (!room.isBooked || booking.cancelled) {
                return res.status(400).json({ success: false, message: "This Room is either not booked or already cancelled." });
            }
            if (booking.email !== user.email) {
                return res.status(400).json({ success: false, message: "You didn't book this room." });
            }

            await room.updateOne({ isBooked: false });
            await Booking.updateMany({ roomNo }, { completed: true, cancelled: true, completedDate: Date.now() });
            return res.status(200).json({ success: true, message: "Booking Cancelled Successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Booking Does Not Exist" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const addExtraTime = async (req, res) => {
    const { eTime, roomNo } = req.body;
    if (!eTime || !roomNo) {
        return res.status(400).json({ success: false, message: "Please fill the fields properly" });
    }
    try {
        const room = await Room.findOne({ roomNo });
        const booking = await Booking.findOne({ roomNo, completed: false });

        if (!room.isBooked) {
            return res.status(400).json({ success: false, message: "This room is not booked" });
        }

        if (booking.userId !== req.user) {
            return res.status(400).json({ success: false, message: "You are not authorized" });
        }

        let extraTime = parseInt(booking.extraTime);
        await booking.updateOne({ extraTime: extraTime + eTime });

        const newToDate = new Date(booking.to);
        newToDate.setDate(newToDate.getDate() + eTime);
        await Booking.updateOne({ roomNo }, { to: newToDate });

        return res.status(200).json({ success: true, message: "Extra time added" });
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const getMyBookedRooms = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user });
        const bookedRooms = await Booking.find({ email: user.email, completed: false });
        if (bookedRooms.length > 0) {
            return res.status(200).json({ success: true, message: bookedRooms });
        } else {
            return res.status(400).json({ success: false, message: "You have not booked any room" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

module.exports = {
    bookRoom,
    getAllRooms,
    cancelBooking,
    addExtraTime,
    getMyBookedRooms
};
