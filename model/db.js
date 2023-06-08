import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
sqlite3.verbose()
let db
export async function opendb() {
     await open({
        filename: 'database.sqlite',
        driver: sqlite3.Database
      }).then((database) => {
        db = database
          createTable(db)
      })
}  
export {db}

function createTable(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_email TEXT NOT NULL,
        booking_date DATETIME NOT NULL,
        players INTEGER NOT NULL,
        booking_number INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lanes (
        id INTEGER PRIMARY KEY AUTOINCREMENT
        

    );

    CREATE TABLE IF NOT EXISTS booking_lanes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        lane_id INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        size TEXT NOT NULL
    );

    INSERT OR REPLACE INTO lanes (id) VALUES (0);
    INSERT OR REPLACE INTO lanes (id) VALUES (1);
    INSERT OR REPLACE INTO lanes (id) VALUES (2);
    INSERT OR REPLACE INTO lanes (id) VALUES (3);
    INSERT OR REPLACE INTO lanes (id) VALUES (4);
    INSERT OR REPLACE INTO lanes (id) VALUES (5);
    INSERT OR REPLACE INTO lanes (id) VALUES (6);
    INSERT OR REPLACE INTO lanes (id) VALUES (7);
    `);

}
