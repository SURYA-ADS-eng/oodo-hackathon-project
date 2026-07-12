# oodo-hackathon-project
# AssetFlow — Employee Module Documentation

**Project:** AssetFlow — Enterprise Asset & Resource Management System
**Version:** 1.0
**Frontend Stack:** HTML, CSS, JavaScript

---

## 1. Overview

The Employee Module is the section of AssetFlow that employees use to view their assigned assets, book shared resources, raise maintenance requests, check notifications, and manage their profile.

An employee reaches this module from the landing page's role selection:

```
landing.html
      │
      ▼
employee/employee_dashboard.html
```

---

## 2. Employee Folder Structure

```
employee/
│
├── employee_dashboard.html
├── employee_dashboard.css
├── employee_dashboard.js
│
├── sidebar.html
├── sidebar.js
│
├── book-resources/
│   ├── book-resources.html
│   ├── book-resource.css
│   └── book-resources.js
│
├── my-assets/
│   ├── my-assets.html
│   └── my-assets.css
│
├── notification/
│   ├── notification.html
│   ├── notification.css
│   └── notification.js
│
├── profile/
│   ├── profile.html
│   ├── profile.css
│   └── book-resource.js
│
└── raise-request/
    ├── raise-request.html
    ├── raise-request.css
    └── raise-request.js
```

---

## 3. Employee Dashboard

| File | Path |
|---|---|
| HTML | `employee/employee_dashboard.html` |
| CSS | `employee/employee_dashboard.css` |
| JS | `employee/employee_dashboard.js` |

**Purpose:** Displays employee operational information at a glance.

**Features:**
- Asset summary
- Quick actions
- Notifications
- Recent activities

---

## 4. Sidebar Component

| File | Path |
|---|---|
| HTML | `employee/sidebar.html` |
| JS | `employee/sidebar.js` |

**Purpose:** Reusable navigation component shared across all employee pages.

**Navigation links:**
- Dashboard
- My Assets
- Book Resources
- Raise Maintenance Request
- Notifications
- Profile

---

## 5. My Assets

| File | Path |
|---|---|
| HTML | `employee/my-assets/my-assets.html` |
| CSS | `employee/my-assets/my-assets.css` |

**Purpose:** Displays assets assigned to the logged-in employee.

**Features:**
- Asset cards
- Asset status
- Asset details
- Asset history

**Example card:**
```
Laptop
Asset Tag: AF-0114
Status: Allocated
```

---

## 6. Book Resources

| File | Path |
|---|---|
| HTML | `employee/book-resources/book-resources.html` |
| CSS | `employee/book-resources/book-resource.css` |
| JS | `employee/book-resources/book-resources.js` |

**Purpose:** Lets employees reserve shared organizational resources.

**Bookable resources:**
- Conference rooms
- Vehicles
- Equipment
- Shared laptops

**Features:**
- Availability status
- Upcoming bookings
- Booking request submission

---

## 7. Raise Maintenance Request

| File | Path |
|---|---|
| HTML | `employee/raise-request/raise-request.html` |
| CSS | `employee/raise-request/raise-request.css` |
| JS | `employee/raise-request/raise-request.js` |

**Purpose:** Lets employees report asset issues.

**Request workflow:**

```
Employee Request
      │
      ▼
   Pending
      │
      ▼
   Approved
      │
      ▼
Technician Assigned
      │
      ▼
   Resolved
```

---

## 8. Notifications

| File | Path |
|---|---|
| HTML | `employee/notification/notification.html` |
| CSS | `employee/notification/notification.css` |
| JS | `employee/notification/notification.js` |

**Purpose:** Displays system alerts relevant to the employee.

**Example notification types:**
- Asset Assigned
- Booking Confirmed
- Maintenance Approved
- Overdue Return
- Audit Alert

---

## 9. Profile

| File | Path |
|---|---|
| HTML | `employee/profile/profile.html` |
| CSS | `employee/profile/profile.css` |
| JS | `employee/profile/book-resource.js` |

**Purpose:** Employee profile management.

**Displays:**
- Name
- Email
- Department
- Role

> **Note:** The profile module currently reuses `book-resource.js` as its JS file — likely a naming leftover from the booking module. Consider renaming it to something like `profile.js` for clarity.

---

## 10. Adding a New Employee Page

To extend the module with a new page:

1. Create a new folder under `employee/`:
   ```
   employee/new-module/
       new-module.html
       new-module.css
       new-module.js
   ```
2. Add a navigation link to it inside `employee/sidebar.html`.

---

## 11. Data Handling Notes

- All employee pages currently run on static HTML/CSS with JavaScript dummy data.
- No database or backend is connected yet.
- Planned future integration path:

```
Frontend → REST API → Backend (Spring Boot / Node) → Database
```
