import { addHours, format, parseJSON } from "date-fns"
import  {db}  from "../model/db.js"

export const validateAvailableLanes = async (req, res, next) => {
    const booking = req.body
    const startDate =format(parseJSON(booking.datetime), 't')
    const endDate = format(addHours(parseJSON(booking.datetime), 1), 't')
    let sql = `SELECT id FROM bookings WHERE booking_date BETWEEN '${startDate}' AND '${endDate}'`
    if(booking.bookingnumber){
        sql += ` AND booking_number IS NOT ${booking.bookingnumber}` 
    }
    const existingBookings = await db.all(sql)
    let bookedLanes = []
    for (let index = 0; index < existingBookings.length; index++) {
        const lanes = await db.all('SELECT * FROM booking_lanes WHERE booking_id = $booking_id', {
            $booking_id: existingBookings[index].id
        })
        lanes.forEach(element => {
            bookedLanes.push(element.lane_id)
        });
    }
    let availableLanes = []
    if (bookedLanes.length > 0){
        availableLanes = await db.all(`SELECT id FROM lanes WHERE id NOT IN (${bookedLanes.join(',')})`)
    }
    else{
        availableLanes = await db.all('SELECT id FROM lanes LIMIT $lanes', {
            $lanes: booking.lanes
        })
    }

    if(availableLanes.length === 0 || booking.lanes > availableLanes.length){
        return res.status(400).json({
            success: false,
            message: "no available lanes"
        })
    }
    res.availableLanes = availableLanes
    next()
}

export const validateShoes = (req, res, next) =>{
    const booking = req.body
    if(booking.shoes.length !== booking.players){
        return res.status(400).json({
            success: false,
            message: 'number of shoes does not match players'
        })
    }
    next()
}