import { format, parseJSON } from "date-fns"
import  {db}  from "./db.js"

const createBooking = async (booking) =>{

    const newBooking = await db.run('INSERT into bookings (booking_email, booking_number, booking_date, players) VALUES ($email, $number, $date, $players)', {
        '$email': booking.email, 
        '$number': Math.floor(100000 + Math.random() * 900000), 
        '$date': format(parseJSON(booking.datetime), 't'), 
        '$players': booking.players
    })

    for (let index = 0; index < booking.lanes; index++) {
        await db.run('INSERT into booking_lanes (booking_id, lane_id) VALUES ($booking_id, $lane_id)', {
            '$booking_id': newBooking.lastID,
            '$lane_id': booking.availableLanes[index].id
        })
    }

    for (let index = 0; index < booking.shoes.length; index++) {
        await db.run('INSERT into shoes (booking_id, size) VALUES ($booking_id, $size)', {
            '$booking_id': newBooking.lastID,
            '$size': booking.shoes[index]
        })
    }

    const price = 120 * booking.players + 100 * booking.lanes
    const bookingNumber = await db.get('SELECT booking_number FROM bookings WHERE id = ?', newBooking.lastID)
    return {
        price: price,
        booking_number: bookingNumber.booking_number
    }
}

const updateBooking = async (booking) =>{
    const existing = await db.get('SELECT * FROM bookings WHERE booking_number = ?', booking.booking_number)
    const updatedBooking = await db.run('UPDATE bookings SET booking_email = $email, booking_date = $date, players = $players WHERE id = $id', {
        '$email': booking.email, 
        '$date': format(parseJSON(booking.datetime), 't'), 
        '$players': booking.players,
        '$id': existing.id
    })
    const existingLanes = await db.all('SELECT id FROM booking_lanes WHERE booking_id = ?', existing.id)
    if(existingLanes.length !== booking.lanes){
        const lane_ids = existingLanes.map((lane) => lane.id)
        await db.run(`DELETE FROM booking_lanes WHERE id IN (${lane_ids.join(',')})`)
        for (let index = 0; index < booking.lanes; index++) {
            await db.run('INSERT into booking_lanes (booking_id, lane_id) VALUES ($booking_id, $lane_id)', {
                '$booking_id': existing.id,
                '$lane_id': booking.availableLanes[index].id
            })
        }
    }

    const existingShoes = await db.all('SELECT * FROM shoes WHERE booking_id = ?', existing.id)
    const sizes = existingShoes.map((shoe) => shoe.size)
    if(sizes.toString()!== booking.shoes.toString()){
        const shoes_ids = existingShoes.map((shoe) => shoe.id)
        await db.run(`DELETE FROM shoes WHERE id IN (${shoes_ids.join(',')})`)
        for (let index = 0; index < booking.shoes.length; index++) {
            await db.run('INSERT into shoes (booking_id, size) VALUES ($booking_id, $size)', {
                '$booking_id': existing.id,
                '$size': booking.shoes[index]
            })
        }
    }

    const price = 120 * booking.players + 100 * booking.lanes
    return {
        price: price,
        booking_number: booking.bookingnumber
    }
}

const getBookingInfo = async (bookingnumber) => {

    const info = await db.get(`select 
    b.id, 
    b.players,
    b.booking_email,
    count(distinct bl.lane_id) as lanes,
    GROUP_CONCAT(s.size) as shoes
    from bookings AS b
    INNER join booking_lanes AS bl on b.id = bl.booking_id
    INNER join shoes AS s on s.booking_id = b.id
    WHERE b.booking_number = ?
    group by b.id`, bookingnumber)
    info.shoes = info.shoes.split(',').splice(0, info.players)
    return info


    //Hur returnerar man detta på ett snyggt sätt?
    // const info = await db.all(`SELECT bookings.booking_number, bookings.booking_date, booking_lanes.lane_id, bookings.players, shoes.size
    // FROM bookings
    // INNER JOIN shoes ON bookings.id = shoes.booking_id
    // INNER JOIN booking_lanes ON bookings.id = booking_lanes.booking_id
    // WHERE bookings.booking_number = ${bookingnumber}`)
    // console.log(info);
}

const deleteBooking = async (bookingNumber) => {
    const deleted = await db.run('DELETE FROM bookings WHERE booking_number = ?', bookingNumber)
    await db.run('DELETE FROM booking_lanes WHERE booking_id = ?', deleted.lastID)
    await db.run('DELETE FROM shoes WHERE booking_id = ?', deleted.lastID)
}

export {createBooking, updateBooking, getBookingInfo, deleteBooking}