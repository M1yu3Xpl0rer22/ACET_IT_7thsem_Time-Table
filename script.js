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

// Subject-to-teacher map (expand as needed)
const teacherMap = {
  "DW&M": "N. B. Mapari",
  "DW&M(A)": "N. B. Mapari",
  "DW&M(B)": "N. B. Mapari",
  "DW&M(C)": "N. B. Mapari",
  "BCF": "D. D. Shipne",
  "BCF(A)": "D. D. Shipne",
  "BCF(B)": "D. D. Shipne",
  "BCF(C)": "D. D. Shipne",
  "ES": "N. B. Mapari",
  "ES(A)": "V. D. Parihar",
  "ES(B)": "V. D. Parihar",
  "ES(C)": "V. D. Parihar",
  "MC": "P. T. Talole",
  "CC": "V. D. Parihar",
  "BSF": "Unknown", // Add real name if known
  "Library": "Library Staff",
  "Project": "Respective Guides",
  "Seminar": "Respective Guides",
  "NPTEL/Swayam/Guest Lect.": "Online / Guest Faculty"
};


// NEW FUNCTION: Display current ongoing slot info
function displayCurrentSlotInfo() {
  const testMode = false; // Set to false to use real time
  const now = new Date();
  if (testMode) {
    now.setHours(11); // 11 AM
    now.setMinutes(30); // 11:30 AM
    now.setSeconds(0);
  }

  const hour24 = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false });
  const minute = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata", minute: "2-digit" });
  const currentMinutes = parseInt(hour24) * 60 + parseInt(minute);

  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "Asia/Kolkata"
  });

  let currentSlotIndex = -1;
  let currentSlotInfo = null;

  // Find current time slot
  timeSlots.forEach((slot, index) => {
    const [sh, sm] = slot.start.split(":").map(Number);
    const [eh, em] = slot.end.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    if (currentMinutes >= startMins && currentMinutes < endMins) {
      currentSlotIndex = index;
      const start12 = to12HourFormat(slot.start);
      const end12 = to12HourFormat(slot.end);
      currentSlotInfo = {
        timeSlot: `${start12} - ${end12}`,
        startTime: slot.start,
        endTime: slot.end
      };
    }
  });

  // Get current day's schedule and find all batches for this subject
  let currentSubject = null;
  if (currentSlotInfo && timetableData[currentDay]) {
    const daySchedule = timetableData[currentDay];
    const currentTimeSlot = `${currentSlotInfo.startTime}-${currentSlotInfo.endTime}`;
    
    // Find all sessions in this time slot across all days to get all batches
    const allBatchesForSlot = new Set();
    let subjectCode = null;
    let teacherName = null;
    
    // Check current day first
    const currentSession = daySchedule.find(session => 
      session.time === currentTimeSlot && session.type !== 'break'
    );
    
    if (currentSession) {
      subjectCode = currentSession.subject.split('(')[0];
      teacherName = teacherMap[currentSession.subject] || teacherMap[subjectCode] || "Unknown";
      
      // Find all batches for this subject across all days
      Object.values(timetableData).forEach(dayData => {
        dayData.forEach(session => {
          if (session.type === 'practical' && session.subject.startsWith(subjectCode)) {
            const batch = session.subject.includes('(') ? session.subject.match(/\(([^)]+)\)/)[1] : '';
            if (batch) {
              allBatchesForSlot.add(batch);
            }
          }
        });
      });
      
      const batches = Array.from(allBatchesForSlot).sort();
      currentSubject = { 
        subject: subjectCode, 
        teacher: teacherName,
        batches: batches
      };
    }
  }

 
  
  slotInfoHTML += '</div>';
  
  // Insert the slot info after the current time display
  const currentTimeContainer = document.getElementById("current-time")?.parentElement;
  if (currentTimeContainer) {
    // Remove existing slot info if it exists
    const existingSlotInfo = document.getElementById("current-slot-info");
    if (existingSlotInfo) {
      existingSlotInfo.remove();
    }
    
    // Insert new slot info
    currentTimeContainer.insertAdjacentHTML('afterend', slotInfoHTML);
  }
}

function to12HourFormat(time24) {
  const [hour, minute] = time24.split(":").map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function updateTimeAndHighlight()  {
  const testMode = false; // Set to false to use real time
  const now = new Date();
  if (testMode) {
    now.setHours(14); // 2 PM
    now.setMinutes(10); // 2:15 PM
    now.setSeconds(0);
  }

  const options = { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', hour12: true };
  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const currentTimeFormatted = formatter.format(now);

  const hour24 = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false });
  const minute = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata", minute: "2-digit" });
  const currentMinutes = parseInt(hour24) * 60 + parseInt(minute);

  const currentTimeElem = document.getElementById("current-time");
  const currentSlotElem = document.getElementById("current-slot");

  if (currentTimeElem) currentTimeElem.textContent = currentTimeFormatted;

  let currentSlotIndex = -1;
  timeSlots.forEach((slot, index) => {
    const [sh, sm] = slot.start.split(":").map(Number);
    const [eh, em] = slot.end.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    if (currentMinutes >= startMins && currentMinutes < endMins) {
      currentSlotIndex = index;
    }
  });

  document.querySelectorAll(".timetable td, .timetable th").forEach(cell =>
    cell.classList.remove("highlight-slot")
  );

  // Remove previous teacher display
  const oldTeacherDisplay = document.getElementById("teacher-display");
  if (oldTeacherDisplay) oldTeacherDisplay.remove();

  if (currentSlotIndex >= 0) {
    const col = currentSlotIndex + 2;
    const selector = `.timetable tbody tr`;

    const currentDay = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata"
    });

    let foundCell = null;

    document.querySelectorAll(selector).forEach((row) => {
      const dayCell = row.querySelector("td:first-child");
      if (dayCell && dayCell.textContent.trim().toLowerCase() === currentDay.toLowerCase()) {
        const targetCell = row.querySelector(`td:nth-child(${col})`);
        if (targetCell) {
          targetCell.classList.add("highlight-slot");
          foundCell = targetCell;
        }
      }
    });

    document.querySelector(`.timetable th:nth-child(${col})`)?.classList.add("highlight-slot");

    if (currentSlotElem) {
      const start12 = to12HourFormat(timeSlots[currentSlotIndex].start);
      const end12 = to12HourFormat(timeSlots[currentSlotIndex].end);
      currentSlotElem.textContent = `${start12} - ${end12}`;
    }

    // Show Teacher Info
    if (foundCell) {
      const text = foundCell.textContent.trim().split(/[\/(]/)[0]; // clean e.g., "DW&M(A)"
      const subject = text.toUpperCase();
      const teacherName = teacherMap[subject] || "Unknown";

      const teacherDisplay = document.createElement("div");
      teacherDisplay.id = "teacher-display";
      teacherDisplay.style.textAlign = "center";
      teacherDisplay.style.marginTop = "10px";
      teacherDisplay.style.fontWeight = "bold";
      teacherDisplay.innerHTML = `Subject: <span style="color:#1e3c72">${subject}</span> | Teacher: <span style="color:#1e3c72">${teacherName}</span>`;
      currentSlotElem.parentElement.appendChild(teacherDisplay);
    }
  } else {
    if (currentSlotElem) currentSlotElem.textContent = "No Lecture Currently";
  }
}

updateTimeAndHighlight();

setInterval(updateTimeAndHighlight, 60000);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/ACET_IT_7thsem_Time-Table/service-worker.js')
      .then(reg => console.log("✅ Service Worker registered"))
      .catch(err => console.error("❌ SW registration failed:", err));
}

function getTodayDate() {
    const today = new Date().toLocaleDateString('en-GB', { timeZone: "Asia/Kolkata" });
    return today.replaceAll('/', '-'); // e.g. 15-07-2025
}

function markResponse(attended) {
    const sid = localStorage.getItem("studentID");
    const name = localStorage.getItem("studentName");
    if (!sid || !name) {
        alert("Please login as student to mark attendance.");
        return;
    }
    const today = getTodayDate();
    const key = `response_${today}_${sid}`;

    localStorage.setItem(key, JSON.stringify({
        student: name,
        id: sid,
        attended: attended,
        time: new Date().toLocaleTimeString('en-IN', { timeZone: "Asia/Kolkata" })
    }));

    alert("Your response has been recorded.");
}

// ----- On Page Load -----
window.addEventListener('load', () => {
    updateTimeAndHighlight();
    setInterval(updateTimeAndHighlight, 60000);
    
    // NEW: Display current slot info on page load
    displayCurrentSlotInfo();

    if (localStorage.getItem("isAdmin") === "true") {
        loadAdminResponses();
    }
});

const validStudentIDs = Array.from({length: 70}, (_, i) => {
  // Generate IDs like S01, S02 ... S70
  return `S${String(i+1).padStart(2, '0')}`;
});

function updateLoginUI() {
  const sid = localStorage.getItem("studentID");
  const name = localStorage.getItem("studentName");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const loginSection = document.getElementById("login-section");
  const logoutSection = document.getElementById("logout-section");
  const loggedName = document.getElementById("logged-in-name");
  const loggedID = document.getElementById("logged-in-id");

  if (isAdmin) {
    loginSection.style.display = "none";
    logoutSection.style.display = "block";
    loggedName.textContent = "Admin";
    loggedID.textContent = "-";
  } else if (sid && name) {
    loginSection.style.display = "none";
    logoutSection.style.display = "block";
    loggedName.textContent = name;
    loggedID.textContent = sid;
  } else {
    loginSection.style.display = "block";
    logoutSection.style.display = "none";
  }
}