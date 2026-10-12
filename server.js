// Restaurant Table Reservation System - Node.js + Express
// Educational mini-project. Uses a local JSON file for storage.
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "reservations.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readReservations() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}
function saveReservations(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

// Business logic: validate request, check table/time conflicts, assign a table.
function reserveTable(input) {
  const { customerName, phone, date, time, guests } = input;
  if (!customerName || !phone || !date || !time || !guests) {
    return { error: "Please fill in all required fields." };
  }
  if (!/^[0-9]{10}$/.test(String(phone))) {
    return { error: "Phone number must contain exactly 10 digits." };
  }
  const guestCount = Number(guests);
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 8) {
    return { error: "Guests must be between 1 and 8." };
  }

  const requestedDateTime = new Date(`${date}T${time}:00`);
  if (Number.isNaN(requestedDateTime.getTime())) {
    return { error: "Please choose a valid date and time." };
  }
  if (requestedDateTime < new Date()) {
    return { error: "Reservation date/time must be in the future." };
  }

  const reservations = readReservations();
  // Demo policy: each booking occupies a table for 90 minutes.
  const requestedStart = requestedDateTime.getTime();
  const requestedEnd = requestedStart + 90 * 60 * 1000;
  const overlapping = reservations.filter(r => {
    if (r.date !== date || r.status === "Cancelled") return false;
    const start = new Date(`${r.date}T${r.time}:00`).getTime();
    const end = start + 90 * 60 * 1000;
    return requestedStart < end && requestedEnd > start;
  });

  // Demo restaurant inventory: 4 tables for 2 guests, 3 for 4 guests, 1 for 6–8.
  const capacity = guestCount <= 2 ? 2 : guestCount <= 4 ? 4 : 8;
  const maxTables = capacity === 2 ? 4 : capacity === 4 ? 3 : 1;
  const usedTables = new Set(overlapping.filter(r => r.tableCapacity === capacity).map(r => r.tableNumber));
  let tableNumber = null;
  for (let i = 1; i <= maxTables; i++) {
    if (!usedTables.has(i)) { tableNumber = i; break; }
  }
  if (tableNumber === null) {
    return { error: "Sorry, no table is available at this time. Please select another time." };
  }

  const booking = {
    id: `RES-${Date.now()}`,
    customerName: String(customerName).trim(),
    phone: String(phone),
    date, time, guests: guestCount,
    tableCapacity: capacity,
    tableNumber,
    status: "Confirmed",
    createdAt: new Date().toISOString()
  };
  reservations.push(booking);
  saveReservations(reservations);
  return { booking };
}

app.get("/api/reservations", (req, res) => {
  res.json(readReservations());
});

app.post("/api/reservations", (req, res) => {
  const result = reserveTable(req.body);
  if (result.error) return res.status(400).json({ message: result.error });
  res.status(201).json({ message: "Reservation confirmed!", booking: result.booking });
});

app.patch("/api/reservations/:id/cancel", (req, res) => {
  const reservations = readReservations();
  const booking = reservations.find(r => r.id === req.params.id);
  if (!booking) return res.status(404).json({ message: "Reservation not found." });
  booking.status = "Cancelled";
  saveReservations(reservations);
  res.json({ message: "Reservation cancelled.", booking });
});

app.listen(PORT, () => console.log(`Restaurant reservation app running at http://localhost:${PORT}`));
