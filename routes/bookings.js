import { Router } from "express";
import { createBooking, getBookingInfo, updateBooking, deleteBooking } from "../model/bookingModel.js";
import { validateAvailableLanes, validateExistingBooking, validateShoes } from "../middleware/bookingValidation.js";
const router = Router()


router.post('/bookings', validateAvailableLanes, validateShoes, async (req, res) => {
    const booking = req.body;
    booking.availableLanes = res.availableLanes
    const newBooking = await createBooking(booking)
    res.json({ success: true, ...newBooking})
})

router.put('/bookings', validateExistingBooking, validateAvailableLanes, validateShoes, async (req, res) => {
    const booking = req.body;
    booking.availableLanes = res.availableLanes
    const newBooking = await updateBooking(booking)
    res.json({ success: true, ...newBooking})
})

router.get('/bookings', validateExistingBooking, async (req, res) => {
    const bookingNumber = req.body.booking_number
    const bookingInformation = await getBookingInfo(bookingNumber)
    res.json({ success: true, ...bookingInformation})
})

router.delete('/bookings', validateExistingBooking, async (req, res) => {
    const bookingNumber = req.body.booking_number
    await deleteBooking(bookingNumber)
    res.json({
        success: true
    })
})

export default router