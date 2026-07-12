import os
import sqlite3
from flask import Flask, jsonify, request, render_template_string

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), 'assetflow.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        department_id INTEGER DEFAULT 1,
        status TEXT DEFAULT 'Active'
    );
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        head_id INTEGER,
        parent_id INTEGER,
        status TEXT DEFAULT 'Active'
    );
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        warranty TEXT
    );
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        department_id INTEGER,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'Active'
    );
    CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category_id INTEGER,
        serial TEXT,
        acquisition_date TEXT,
        acquisition_cost REAL,
        condition TEXT,
        location TEXT,
        shared INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Available',
        department_id INTEGER,
        holder_id INTEGER,
        notes TEXT
    );
    CREATE TABLE IF NOT EXISTS allocations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER,
        employee_id INTEGER,
        department_id INTEGER,
        expected_return_date TEXT,
        status TEXT DEFAULT 'Active',
        condition_notes TEXT
    );
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resource_name TEXT NOT NULL,
        booker_id INTEGER,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT DEFAULT 'Upcoming'
    );
    CREATE TABLE IF NOT EXISTS maintenance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER,
        requested_by INTEGER,
        issue TEXT,
        priority TEXT,
        status TEXT DEFAULT 'Pending',
        approval TEXT DEFAULT 'Pending',
        technician TEXT,
        created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS audits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        scope TEXT,
        date_range TEXT,
        auditor_ids TEXT,
        status TEXT DEFAULT 'Open',
        discrepancies TEXT
    );
    CREATE TABLE IF NOT EXISTS transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER,
        from_employee_id INTEGER,
        to_employee_id INTEGER,
        status TEXT DEFAULT 'Requested'
    );
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        created_at TEXT
    );
    ''')
    conn.commit()
    conn.close()


init_db()


@app.route('/')
def index():
    return render_template_string(open(os.path.join(os.path.dirname(__file__), 'index.html')).read())


@app.route('/api/seed', methods=['POST'])
def seed_demo():
    conn = get_db()
    conn.execute("DELETE FROM users")
    conn.execute("DELETE FROM departments")
    conn.execute("DELETE FROM categories")
    conn.execute("DELETE FROM employees")
    conn.execute("DELETE FROM assets")
    conn.execute("DELETE FROM allocations")
    conn.execute("DELETE FROM bookings")
    conn.execute("DELETE FROM maintenance")
    conn.execute("DELETE FROM audits")
    conn.execute("DELETE FROM transfers")
    conn.execute("DELETE FROM notifications")
    conn.execute("INSERT INTO users (name, email, password, role, department_id, status) VALUES (?, ?, ?, ?, ?, ?)", ('Admin User', 'admin@assetflow.com', 'admin123', 'Admin', 1, 'Active'))
    conn.execute("INSERT INTO departments (name, head_id, parent_id, status) VALUES (?, ?, ?, ?)", ('Operations', 1, None, 'Active'))
    conn.execute("INSERT INTO categories (name, warranty) VALUES (?, ?)", ('Electronics', '12 months'))
    conn.execute("INSERT INTO employees (name, email, department_id, role, status) VALUES (?, ?, ?, ?, ?)", ('Admin User', 'admin@assetflow.com', 1, 'Admin', 'Active'))
    conn.execute("INSERT INTO assets (tag, name, category_id, serial, acquisition_date, acquisition_cost, condition, location, shared, status, department_id, holder_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ('AF-0001', 'Dell Latitude 7440', 1, 'SN-1001', '2025-10-02', 1420, 'Good', 'Office 2', 0, 'Available', 1, None, ''))
    conn.execute("INSERT INTO allocations (asset_id, employee_id, department_id, expected_return_date, status, condition_notes) VALUES (?, ?, ?, ?, ?, ?)", (1, None, 1, '2026-07-20', 'Returned', 'Checked in clean'))
    conn.execute("INSERT INTO bookings (resource_name, booker_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)", ('Boardroom B2', 1, '2026-07-12T09:00', '2026-07-12T10:00', 'Upcoming'))
    conn.execute("INSERT INTO maintenance (asset_id, requested_by, issue, priority, status, approval, technician, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (1, 1, 'Battery replacement', 'High', 'Resolved', 'Approved', 'Mina', '2026-07-01'))
    conn.execute("INSERT INTO audits (name, scope, date_range, auditor_ids, status, discrepancies) VALUES (?, ?, ?, ?, ?, ?)", ('Quarterly Audit', 'Operations', '2026-07-01 to 2026-07-14', '1', 'Closed', '[]'))
    conn.execute("INSERT INTO transfers (asset_id, from_employee_id, to_employee_id, status) VALUES (?, ?, ?, ?)", (1, 1, 1, 'Approved'))
    conn.execute("INSERT INTO notifications (message, created_at) VALUES (?, ?)", ('Asset AF-0001 assigned to Operations', '2026-07-10'))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/login', methods=['POST'])
def login():
    payload = request.json or {}
    email = payload.get('email')
    password = payload.get('password')
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE email=? AND password=?', (email, password)).fetchone()
    conn.close()
    if not user:
        return jsonify({'ok': False, 'message': 'Invalid credentials'}), 401
    return jsonify({'ok': True, 'user': dict(user)})


@app.route('/api/departments', methods=['GET', 'POST'])
def departments():
    conn = get_db()
    if request.method == 'GET':
        rows = conn.execute('SELECT * FROM departments ORDER BY id').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    payload = request.json or {}
    conn.execute('INSERT INTO departments (name, head_id, parent_id, status) VALUES (?, ?, ?, ?)', (payload['name'], payload.get('head_id'), payload.get('parent_id'), payload.get('status', 'Active')))
    conn.commit()
    row = conn.execute('SELECT * FROM departments ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route('/api/categories', methods=['GET', 'POST'])
def categories():
    conn = get_db()
    if request.method == 'GET':
        rows = conn.execute('SELECT * FROM categories ORDER BY id').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    payload = request.json or {}
    conn.execute('INSERT INTO categories (name, warranty) VALUES (?, ?)', (payload['name'], payload.get('warranty')))
    conn.commit()
    row = conn.execute('SELECT * FROM categories ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route('/api/employees', methods=['GET', 'POST'])
def employees():
    conn = get_db()
    if request.method == 'GET':
        rows = conn.execute('SELECT * FROM employees ORDER BY id').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    payload = request.json or {}
    conn.execute('INSERT INTO employees (name, email, department_id, role, status) VALUES (?, ?, ?, ?, ?)', (payload['name'], payload['email'], payload.get('department_id'), payload.get('role', 'Employee'), payload.get('status', 'Active')))
    conn.commit()
    row = conn.execute('SELECT * FROM employees ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route('/api/assets', methods=['GET', 'POST'])
def assets():
    conn = get_db()
    if request.method == 'GET':
        rows = conn.execute('SELECT * FROM assets ORDER BY id').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    payload = request.json or {}
    conn.execute('INSERT INTO assets (tag, name, category_id, serial, acquisition_date, acquisition_cost, condition, location, shared, status, department_id, holder_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', (
        payload['tag'], payload['name'], payload.get('category_id'), payload.get('serial'), payload.get('acquisition_date'), payload.get('acquisition_cost', 0), payload.get('condition'), payload.get('location'), int(payload.get('shared', 0)), payload.get('status', 'Available'), payload.get('department_id'), payload.get('holder_id'), payload.get('notes', '')
    ))
    conn.commit()
    row = conn.execute('SELECT * FROM assets ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route('/api/allocations', methods=['GET', 'POST'])
def allocations():
    conn = get_db()
    if request.method == 'GET':
        rows = conn.execute('SELECT * FROM allocations ORDER BY id').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    payload = request.json or {}
    conn.execute('INSERT INTO allocations (asset_id, employee_id, department_id, expected_return_date, status, condition_notes) VALUES (?, ?, ?, ?, ?, ?)', (payload['asset_id'], payload.get('employee_id'), payload.get('department_id'), payload.get('expected_return_date'), payload.get('status', 'Active'), payload.get('condition_notes', '')))
    conn.commit()
    row = conn.execute('SELECT * FROM allocations ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route('/api/bookings', methods=['GET', 'POST'])
def bookings():
    conn = get_db()
    if request.method == 'GET':
        rows = conn.execute('SELECT * FROM bookings ORDER BY id').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    payload = request.json or {}
    conn.execute('INSERT INTO bookings (resource_name, booker_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)', (payload['resource_name'], payload.get('booker_id'), payload.get('start_time'), payload.get('end_time'), payload.get('status', 'Upcoming')))
    conn.commit()
    row = conn.execute('SELECT * FROM bookings ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route('/api/maintenance', methods=['GET', 'POST'])
def maintenance():
    conn = get_db()
    if request.method == 'GET':
        rows = conn.execute('SELECT * FROM maintenance ORDER BY id').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    payload = request.json or {}
    conn.execute('INSERT INTO maintenance (asset_id, requested_by, issue, priority, status, approval, technician, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', (payload['asset_id'], payload.get('requested_by'), payload.get('issue'), payload.get('priority'), payload.get('status', 'Pending'), payload.get('approval', 'Pending'), payload.get('technician', 'Unassigned'), payload.get('created_at')))
    conn.commit()
    row = conn.execute('SELECT * FROM maintenance ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route('/api/audits', methods=['GET', 'POST'])
def audits():
    conn = get_db()
    if request.method == 'GET':
        rows = conn.execute('SELECT * FROM audits ORDER BY id').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    payload = request.json or {}
    conn.execute('INSERT INTO audits (name, scope, date_range, auditor_ids, status, discrepancies) VALUES (?, ?, ?, ?, ?, ?)', (payload['name'], payload.get('scope'), payload.get('date_range'), ','.join(map(str, payload.get('auditor_ids', []))), payload.get('status', 'Open'), payload.get('discrepancies', '[]')))
    conn.commit()
    row = conn.execute('SELECT * FROM audits ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route('/api/transfers', methods=['GET', 'POST'])
def transfers():
    conn = get_db()
    if request.method == 'GET':
        rows = conn.execute('SELECT * FROM transfers ORDER BY id').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    payload = request.json or {}
    conn.execute('INSERT INTO transfers (asset_id, from_employee_id, to_employee_id, status) VALUES (?, ?, ?, ?)', (payload['asset_id'], payload.get('from_employee_id'), payload.get('to_employee_id'), payload.get('status', 'Requested')))
    conn.commit()
    row = conn.execute('SELECT * FROM transfers ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route('/api/notifications', methods=['GET'])
def notifications():
    conn = get_db()
    rows = conn.execute('SELECT * FROM notifications ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8001)
