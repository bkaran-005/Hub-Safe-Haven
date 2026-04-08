
# HostelHub — Girls' Hostel Management System

## Overview
A mobile-first React app with dark theme and 3 role-based dashboards (Resident, Warden, Parent), each with bottom tab navigation and role-specific accent colors.

## Design System
- **Dark theme** base with role-specific accents:
  - Resident: Blue (#185FA5)
  - Warden: Green (#3B6D11)
  - Parent: Amber (#BA7517)
- Status badges: pending=amber, approved=green, rejected=red, resolved=blue
- Mobile-first layout, bottom tab navigation, lucide-react icons

## Pages & Features

### Login Screen
- 3 tappable role cards (Student, Warden, Parent) with role-colored accents
- Email + password fields, Login button
- Stores selected role in state, routes to correct dashboard

### Resident (Student) Dashboard
- **Home**: Greeting header with room badge, 3 stat cards (attendance, complaints, mess balance), quick action buttons, recent activity feed
- **Outings**: List of past requests with status pills, FAB for new request. Request form modal with reason, destination, date/time pickers
- **My QR Code**: Large centered QR code with outing details
- **Complaints**: Category filter chips, complaint cards with status timeline, FAB for new complaint. Complaint form with category dropdown, description, photo upload preview, anonymous toggle
- **Mess**: Mess balance and payment placeholder
- **Profile**: Student profile info

### Warden Dashboard
- **Home**: Summary cards with badges (pending outings, open complaints, students out), late return alert banner, recent activity
- **Outings**: Pending/History tabs, approve/reject buttons, reject reason modal
- **Gate Scan**: Simulated camera viewfinder with scan overlay, mock scan result card with student info
- **Complaints**: List with SLA timer badges, tap to update status
- **Announcements**: List of announcements, new announcement form

### Parent Dashboard
- **Home**: Child info card, last seen status (inside/outside with color), recent alerts
- **Outings**: Timeline of approved outings with timestamps, late return highlights
- **Attendance**: Calendar heatmap (present/absent), monthly percentage, export button

### Shared Components
- Bottom tab navigation (role-aware)
- Status badge component
- Notification bell with unread count
- Loading skeleton screens
- All screens use realistic dummy data (Priya Sharma, Room 204, Mrs. Mehra)

## Technical Approach
- React Router for role-based routing (`/student/*`, `/warden/*`, `/parent/*`)
- Context for auth/role state
- All dummy data hardcoded — no backend needed
- QR code via `qrcode.react` library
- Tailwind dark theme with CSS variables for role accents
- Fully responsive, mobile-first design
