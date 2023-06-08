import { Router } from "express";
import { createBooking, updateBooking } from "../model/bookingModel.js";
import { validateAvailableLanes, validateShoes } from "../middleware/bookingValidation.js";
const router = Router()


router.post('/bookings', validateAvailableLanes, validateShoes, async (req, res) => {
    const booking = req.body;
    booking.availableLanes = res.availableLanes
    const newBooking = await createBooking(booking)
    res.json({ success: true, ...newBooking})
})

router.put('/bookings', validateAvailableLanes, validateShoes, async (req, res) => {
    const booking = req.body;
    booking.availableLanes = res.availableLanes
    const newBooking = await updateBooking(booking)
    res.json({ success: true, ...newBooking})
})

export default router