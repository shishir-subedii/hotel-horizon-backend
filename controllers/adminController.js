const Booking = require('../models/bookModel');
const Room = require('../models/roomModel');

const getRoomDetails = async (req, res) => {

    try {
        const rooms = await Room.find({ isBooked: true });
        if (rooms.length <= 0) {
            return res.status(400).json({ success: false, message: "No Rooms Booked" });
        } else {
            return res.status(200).json({ success: true, total: rooms.length, message: rooms });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const getAllIncompleteBookings = async (req, res) => {

    try {
        const allBookings = await Booking.find({ completed: false });
        for (let booking of allBookings) {
            const bookingDate = new Date(booking.to).getTime();
            if (bookingDate < Date.now()) {
                const room = await Room.findOne({ roomNo: booking.roomNo });
                await room.updateOne({ isBooked: false });
                await booking.updateOne({ completed: true, cancelled: false, completedDate: Date.now() });
            }
        }
        const incompleteBookings = await Booking.find({ completed: false });
        if (incompleteBookings.length <= 0) {
            return res.status(400).json({ success: false, message: "No incomplete bookings found" });
        } else {
            return res.status(200).json({ success: true, total: incompleteBookings.length, message: incompleteBookings });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const discardBooking = async (req, res) => {
    const { roomNo } = req.body;
    if (!roomNo) {
        return res.status(400).json({ success: false, message: "Please enter room number" });
    }

    try {
        const room = await Room.findOne({ roomNo: roomNo });
        const booking = await Booking.findOne({ roomNo: roomNo, completed: false });
        if (room && booking) {
            if (!room.isBooked) {
                return res.status(400).json({ success: false, message: "This room is not booked" });
            }
            if (booking.cancelled) {
                return res.status(400).json({ success: false, message: "This booking is already cancelled" });
            } else {
                await room.updateOne({ isBooked: false });
                await Booking.updateMany({ roomNo: roomNo }, { completed: true, cancelled: true, completedDate: Date.now() });
                return res.status(200).json({ success: true, message: "Booking discarded successfully" });
            }
        } else {
            return res.status(400).json({ success: false, message: "Room/booking does not exist" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const completeBooking = async (req, res) => {
    const { roomNo } = req.body;
    if (!roomNo) {
        return res.status(400).json({ success: false, message: "Please enter room number" });
    }

    try {
        const room = await Room.findOne({ roomNo: roomNo });
        if (!room.isBooked) {
            return res.status(400).json({ success: false, message: "This room is not booked" });
        } else {
            await room.updateOne({ isBooked: false });
            await Booking.updateMany({ roomNo: roomNo }, { completed: true, cancelled: false, completedDate: Date.now() });
            return res.status(200).json({ success: true, message: "Booking completed successfully" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const getAllBookings = async (req, res) => {

    try {
        const bookings = await Booking.find().sort({ completed: 1 });
        if (bookings.length > 0) {
            return res.status(200).json({ success: true, total: bookings.length, message: bookings });
        } else {
            return res.status(400).json({ success: false, message: "No bookings found" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const autoCompleteBookings = async (req, res) => {

    try {
        const allBookings = await Booking.find({ completed: false });
        for (let booking of allBookings) {
            const bookingDate = new Date(booking.to).getTime();
            if (bookingDate < Date.now()) {
                const room = await Room.findOne({ roomNo: booking.roomNo });
                await room.updateOne({ isBooked: false });
                await booking.updateOne({ completed: true, cancelled: false, completedDate: Date.now() });
            }
        }
        return res.status(200).json({ success: true, message: "Bookings automatically completed" });
    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const checkIn = async (req, res) => {
    const { roomNo } = req.body;
    if (!roomNo) {
        return res.status(400).json({ success: false, message: "Please enter room number" });
    }

    try {
        const room = await Room.findOne({ roomNo: roomNo });
        if (!room.isBooked) {
            return res.status(400).json({ success: false, message: "This room is not booked" });
        }
        await Booking.updateMany({ roomNo: roomNo }, { checkedIn: true });
        return res.status(200).json({ success: true, message: "Check-in successful" });

    } catch (error) {
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

module.exports = {
    getRoomDetails,
    getAllIncompleteBookings,
    discardBooking,
    completeBooking,
    getAllBookings,
    autoCompleteBookings,
    checkIn
};
