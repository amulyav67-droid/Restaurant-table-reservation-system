# Restaurant Table Reservation System (TableEase)

## Technologies
- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express.js
- Storage: local JSON file (`data/reservations.json`)
- API: REST-style JSON endpoints

## Requirements
- Node.js 18+ recommended
- Internet connection only for downloading the Express dependency

## Run
1. Extract the ZIP.
2. Open a terminal in this folder.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000` in a browser.

## Main API endpoints
- `GET /api/reservations` — list bookings
- `POST /api/reservations` — validate, check availability, assign table, save booking
- `PATCH /api/reservations/:id/cancel` — cancel a booking

## Demo business rules
- 1–2 guests: four 2-seat tables
- 3–4 guests: three 4-seat tables
- 5–8 guests: one large table
- Each reservation occupies its table for 90 minutes
- Phone must be exactly 10 digits; guest count must be 1–8; date/time must be in the future.

## Limitations
This is an academic demo. JSON file storage is not suitable for simultaneous production traffic; it has no authentication, payment, email/SMS integration, or database transaction locking. A production version should use a database such as PostgreSQL/MySQL and secure admin access.
