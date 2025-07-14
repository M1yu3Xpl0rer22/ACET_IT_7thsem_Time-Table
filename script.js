// Lecture time slots (24-hour format for logic)
const timeSlots = [
    { start: "10:30", end: "12:30" },
    { start: "12:30", end: "13:00" },
    { start: "13:00", end: "14:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "15:30" },
    { start: "15:30", end: "16:30" },
    { start: "16:30", end: "17:30" },
    { start: "17:30", end: "18:00" }
];

// Convert 24-hour time string (e.g., "14:00") to 12-hour format with AM/PM
function to12HourFormat(time24) {
    const [hour, minute] = time24.split(":").map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function updateTimeAndHighlight() {
    const now = new Date();

    // Format current time in 12-hour IST
    const options = { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', hour12: true };
    const formatter = new Intl.DateTimeFormat('en-IN', options);
    const currentTimeFormatted = formatter.format(now);

    const hour24 = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false });
    const minute = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata", minute: "2-digit" });
    const currentMinutes = parseInt(hour24) * 60 + parseInt(minute);

    // Display current time
    const currentTimeElem = document.getElementById("current-time");
    const currentSlotElem = document.getElementById("current-slot");

    if (currentTimeElem) currentTimeElem.textContent = currentTimeFormatted;

    let currentSlotIndex = -1;

    timeSlots.forEach((slot, index) => {
        const [startHour, startMin] = slot.start.split(":").map(Number);
        const [endHour, endMin] = slot.end.split(":").map(Number);

        const startMins = startHour * 60 + startMin;
        const endMins = endHour * 60 + endMin;

        if (currentMinutes >= startMins && currentMinutes < endMins) {
            currentSlotIndex = index;
        }
    });

    // Clear previous highlights
    document.querySelectorAll(".timetable td, .timetable th").forEach(cell => {
        cell.classList.remove("highlight-slot");
    });

    // Highlight the current column and update slot display
    if (currentSlotIndex >= 0) {
        const colIndex = currentSlotIndex + 2;
        const selector = `.timetable tr td:nth-child(${colIndex}), .timetable tr th:nth-child(${colIndex})`;

        document.querySelectorAll(selector).forEach(cell => {
            cell.classList.add("highlight-slot");
        });

        if (currentSlotElem) {
            const start12 = to12HourFormat(timeSlots[currentSlotIndex].start);
            const end12 = to12HourFormat(timeSlots[currentSlotIndex].end);
            currentSlotElem.textContent = `${start12} - ${end12}`;
        }
    } else {
        if (currentSlotElem) {
            currentSlotElem.textContent = "No Lecture Currently";
        }
    }
}

// Run on load and update every minute
updateTimeAndHighlight();
setInterval(updateTimeAndHighlight, 60000);
