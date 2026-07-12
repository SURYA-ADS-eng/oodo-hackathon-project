# AssetFlow

AssetFlow is a lightweight Enterprise Asset & Resource Management System MVP designed to demonstrate core ERP-style workflows for managing departments, employees, assets, allocations, resource bookings, maintenance, audits, and notifications.

## Overview

This project provides a browser-based prototype for:
- organization setup and employee directory management
- asset registration and lifecycle tracking
- allocation and transfer workflows
- shared resource booking with overlap validation
- maintenance request handling
- audit cycle planning and discrepancy tracking
- dashboard KPIs and notifications

## Tech Stack

- HTML, CSS, JavaScript
- Flask
- SQLite

## Project Structure

- `index.html` — app shell and authentication UI
- `styles.css` — layout and styling
- `app.js` — frontend logic and UI interactions
- `app.py` — Flask backend and SQLite API routes
- `requirements.txt` — Python dependencies

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SURYA-ADS-eng/oodo-hackathon-project
cd admin employee
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the backend

```bash
python app.py
```

The API will be available at:
- http://127.0.0.1:8001

### 4. Serve the frontend

Open the frontend in a browser using a simple static server, for example:

```bash
python -m http.server 8000
```

Then visit:
- http://127.0.0.1:8000/index.html

## Demo Login

A starter admin account is included for the prototype:
- Email: `admin@assetflow.com`
- Password: `admin123`

## Notes

This repository currently contains a functional MVP / proof-of-concept implementation focused on demonstrating the core user experience and workflow model. It is intended as a foundation for a fuller ERP-style product.

## Future Enhancements

Potential next steps include:
- real authentication and role-based access control
- richer approval workflows
- persistent reporting and analytics
- Odoo-style modular architecture
- REST API expansion and test coverage
