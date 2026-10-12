const form = document.getElementById("bookingForm");
const message = document.getElementById("message");
const reservationsBox = document.getElementById("reservations");
const dateInput = document.getElementById("date");
const today = new Date();
dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.className = "";
  message.textContent = "Checking table availability...";
  const data = Object.fromEntries(new FormData(form).entries());
  data.guests = Number(data.guests);
  try {
    const response = await fetch("/api/reservations", {
      method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Unable to reserve.");
    message.className = "success";
    message.innerHTML = `<strong>${result.message}</strong><br>Reservation ID: ${result.booking.id}<br>Table: ${result.booking.tableNumber} · Guests: ${result.booking.guests}`;
    form.reset();
    dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    loadReservations();
  } catch (error) {
    message.className = "error";
    message.textContent = error.message;
  }
});

async function loadReservations() {
  try {
    const response = await fetch("/api/reservations");
    const items = await response.json();
    reservationsBox.innerHTML = "";
    if (!items.length) {
      reservationsBox.textContent = "No reservations yet. Create a demo booking above.";
      return;
    }
    items.slice().reverse().slice(0,8).forEach(item => {
      const row = document.createElement("div");
      row.className = "booking-row";
      const left = document.createElement("div");
      left.textContent = `${item.customerName} · ${item.guests} guest(s)`;
      const detail = document.createElement("small");
      detail.textContent = `${item.date} at ${item.time} · Table ${item.tableNumber} · ${item.id}`;
      left.appendChild(detail);
      const right = document.createElement("div");
      right.className = "status";
      right.textContent = item.status;
      row.append(left, right);
      reservationsBox.appendChild(row);
    });
  } catch {
    reservationsBox.textContent = "Could not load reservations.";
  }
}
document.getElementById("refresh").addEventListener("click", loadReservations);
loadReservations();
