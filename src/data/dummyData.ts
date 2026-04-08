export const studentData = {
  name: "Priya Sharma",
  room: "204",
  email: "priya.sharma@hostel.edu",
  phone: "+91 98765 43210",
  course: "B.Tech Computer Science",
  year: "3rd Year",
  attendance: 92,
  pendingComplaints: 2,
  messBalance: 3500,
  photo: "",
};

export const wardenData = {
  name: "Mrs. Mehra",
  email: "mehra@hostel.edu",
  phone: "+91 98765 12345",
};

export const outings = [
  { id: "1", student: "Priya Sharma", room: "204", destination: "City Mall", reason: "Shopping for essentials", from: "2026-04-06T10:00", returnBy: "2026-04-06T18:00", status: "approved" as const, exitTime: "2026-04-06T10:15", returnTime: "2026-04-06T17:45", wardenNote: "" },
  { id: "2", student: "Priya Sharma", room: "204", destination: "Home - Delhi", reason: "Weekend visit", from: "2026-04-04T14:00", returnBy: "2026-04-05T20:00", status: "approved" as const, exitTime: "2026-04-04T14:30", returnTime: "2026-04-05T19:00", wardenNote: "" },
  { id: "3", student: "Priya Sharma", room: "204", destination: "Friend's apartment", reason: "Birthday party", from: "2026-04-08T17:00", returnBy: "2026-04-08T22:00", status: "pending" as const, exitTime: "", returnTime: "", wardenNote: "" },
  { id: "4", student: "Priya Sharma", room: "204", destination: "Night market", reason: "Late night outing", from: "2026-04-02T20:00", returnBy: "2026-04-02T23:00", status: "rejected" as const, exitTime: "", returnTime: "", wardenNote: "Too late. Please request earlier timing." },
  { id: "5", student: "Anita Roy", room: "108", destination: "Hospital", reason: "Medical checkup", from: "2026-04-08T09:00", returnBy: "2026-04-08T13:00", status: "pending" as const, exitTime: "", returnTime: "", wardenNote: "" },
  { id: "6", student: "Sneha Gupta", room: "312", destination: "Library", reason: "Study group", from: "2026-04-08T08:00", returnBy: "2026-04-08T20:00", status: "approved" as const, exitTime: "2026-04-08T08:10", returnTime: "", wardenNote: "" },
];

export const complaints = [
  { id: "1", student: "Priya Sharma", room: "204", category: "Room" as const, description: "AC not working properly, room temperature too high", status: "open" as const, createdAt: "2026-04-07T14:30", photo: "", anonymous: false },
  { id: "2", student: "Priya Sharma", room: "204", category: "Hygiene" as const, description: "Bathroom drain is clogged on 2nd floor", status: "in-progress" as const, createdAt: "2026-04-05T09:00", photo: "", anonymous: false },
  { id: "3", student: "Priya Sharma", room: "204", category: "Food" as const, description: "Dinner quality has been poor this week", status: "resolved" as const, createdAt: "2026-04-01T19:30", photo: "", anonymous: true },
  { id: "4", student: "Anita Roy", room: "108", category: "Safety" as const, description: "Corridor light on 1st floor is broken", status: "open" as const, createdAt: "2026-04-06T22:00", photo: "", anonymous: false },
  { id: "5", student: "Sneha Gupta", room: "312", category: "Room" as const, description: "Window lock is broken", status: "open" as const, createdAt: "2026-04-07T11:00", photo: "", anonymous: false },
];

export const announcements = [
  { id: "1", title: "Hostel Day Celebration", body: "Annual Hostel Day will be celebrated on April 15th. All residents are requested to participate in the cultural events.", date: "2026-04-07", sendToAll: true },
  { id: "2", title: "Water Supply Notice", body: "Water supply will be interrupted on April 10th from 10 AM to 2 PM for maintenance.", date: "2026-04-06", sendToAll: true },
  { id: "3", title: "Mess Menu Updated", body: "New mess menu for April has been uploaded. Check the notice board for details.", date: "2026-04-03", sendToAll: true },
];

export const attendanceData: Record<string, "present" | "absent"> = {};
const startDate = new Date(2026, 2, 1);
for (let i = 0; i < 39; i++) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + i);
  const key = d.toISOString().split("T")[0];
  attendanceData[key] = Math.random() > 0.12 ? "present" : "absent";
}

export const recentAlerts = [
  { id: "1", message: "Priya returned from City Mall", time: "2026-04-06T17:45", type: "info" as const },
  { id: "2", message: "Outing request approved: Home - Delhi", time: "2026-04-04T13:00", type: "success" as const },
  { id: "3", message: "Late return alert: Weekend visit", time: "2026-04-05T20:30", type: "warning" as const },
];

export type Outing = (typeof outings)[number];
export type Complaint = (typeof complaints)[number];
export type Announcement = (typeof announcements)[number];
