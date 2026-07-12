const STORAGE_KEY = 'assetflow-state';
const API_BASE = 'http://127.0.0.1:8001';

const defaultState = () => ({
  currentUser: null,
  activeView: 'dashboard',
  users: [
    { id: 1, name: 'Admin User', email: 'admin@assetflow.com', password: 'admin123', role: 'Admin', departmentId: 1, status: 'Active' }
  ],
  departments: [
    { id: 1, name: 'Operations', headId: 1, parentId: null, status: 'Active' }
  ],
  categories: [
    { id: 1, name: 'Electronics', warranty: '12 months' }
  ],
  employees: [
    { id: 1, name: 'Admin User', email: 'admin@assetflow.com', departmentId: 1, role: 'Admin', status: 'Active' }
  ],
  assets: [
    { id: 1, tag: 'AF-0001', name: 'Dell Latitude 7440', categoryId: 1, serial: 'SN-1001', acquisitionDate: '2025-10-02', acquisitionCost: 1420, condition: 'Good', location: 'Office 2', shared: false, status: 'Available', departmentId: 1, holderId: null, notes: '' }
  ],
  allocations: [
    { id: 1, assetId: 1, employeeId: null, departmentId: 1, expectedReturnDate: '2026-07-20', status: 'Returned', conditionNotes: 'Checked in clean' }
  ],
  bookings: [
    { id: 1, resourceName: 'Boardroom B2', bookerId: 1, start: '2026-07-12T09:00', end: '2026-07-12T10:00', status: 'Upcoming' }
  ],
  maintenance: [
    { id: 1, assetId: 1, requestedBy: 1, issue: 'Battery replacement', priority: 'High', status: 'Resolved', approval: 'Approved', technician: 'Mina', createdAt: '2026-07-01' }
  ],
  audits: [
    { id: 1, name: 'Quarterly Audit', scope: 'Operations', dateRange: '2026-07-01 to 2026-07-14', auditorIds: [1], status: 'Closed', discrepancies: [] }
  ],
  transfers: [
    { id: 1, assetId: 1, fromEmployeeId: 1, toEmployeeId: 1, status: 'Approved' }
  ],
  notifications: [
    { id: 1, message: 'Asset AF-0001 assigned to Operations', createdAt: '2026-07-10' }
  ],
  nextAssetNumber: 2,
  nextBookingNumber: 2,
  nextAuditNumber: 2,
  nextTransferNumber: 2,
  nextMaintenanceNumber: 2,
  nextNotificationNumber: 2
});

let state = loadState();

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultState();
  } catch {
    return defaultState();
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Request failed');
  }
  return response.json();
}

async function hydrateFromApi() {
  try {
    const [departments, categories, employees, assets, allocations, bookings, maintenance, audits, transfers, notifications] = await Promise.all([
      fetchJson('/api/departments'),
      fetchJson('/api/categories'),
      fetchJson('/api/employees'),
      fetchJson('/api/assets'),
      fetchJson('/api/allocations'),
      fetchJson('/api/bookings'),
      fetchJson('/api/maintenance'),
      fetchJson('/api/audits'),
      fetchJson('/api/transfers', { method: 'GET' }),
      fetchJson('/api/notifications')
    ]);
    state.departments = departments;
    state.categories = categories;
    state.employees = employees;
    state.assets = assets;
    state.allocations = allocations;
    state.bookings = bookings;
    state.maintenance = maintenance;
    state.audits = audits;
    state.transfers = transfers;
    state.notifications = notifications;
    state.users = [{ id: 1, name: 'Admin User', email: 'admin@assetflow.com', password: 'admin123', role: 'Admin', departmentId: 1, status: 'Active' }];
    persist();
  } catch (error) {
    console.warn('API unavailable, using local state', error);
  }
}

function ensureSeed() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    state = defaultState();
    persist();
  }
}

ensureSeed();

function getCurrentUser() {
  return state.users.find((u) => u.id === state.currentUser?.id) || state.currentUser;
}

function getEmployeeName(id) {
  const emp = state.employees.find((entry) => entry.id === id);
  return emp ? emp.name : 'Unassigned';
}

function getDepartmentName(id) {
  const dep = state.departments.find((entry) => entry.id === id);
  return dep ? dep.name : 'Unknown';
}

function getCategoryName(id) {
  const cat = state.categories.find((entry) => entry.id === id);
  return cat ? cat.name : 'Unknown';
}

function formatDate(value) {
  if (!value) return '—';
  return value.split('T')[0];
}

function showAuth() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app-shell').classList.add('hidden');
}

function showApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
}

async function render() {
  const current = getCurrentUser();
  if (!current) {
    showAuth();
    return;
  }
  await hydrateFromApi();
  showApp();
  document.getElementById('user-pill').textContent = `${current.name} · ${current.role}`;
  document.getElementById('page-title').textContent = viewTitle(state.activeView);
  document.getElementById('page-subtitle').textContent = viewSubtitle(state.activeView);
  document.getElementById('sidebar-nav').innerHTML = buildNav();
  document.getElementById('main-content').innerHTML = renderView();
}

function buildNav() {
  const current = getCurrentUser();
  const items = [
    { key: 'dashboard', label: 'Dashboard', roles: ['Admin','Asset Manager','Department Head','Employee'] },
    { key: 'org', label: 'Organization Setup', roles: ['Admin'] },
    { key: 'assets', label: 'Assets', roles: ['Admin','Asset Manager','Department Head','Employee'] },
    { key: 'allocations', label: 'Allocation & Transfer', roles: ['Admin','Asset Manager','Department Head','Employee'] },
    { key: 'bookings', label: 'Resource Booking', roles: ['Admin','Asset Manager','Department Head','Employee'] },
    { key: 'maintenance', label: 'Maintenance', roles: ['Admin','Asset Manager','Department Head','Employee'] },
    { key: 'audits', label: 'Audit', roles: ['Admin','Asset Manager'] },
    { key: 'reports', label: 'Reports', roles: ['Admin','Asset Manager','Department Head'] },
    { key: 'notifications', label: 'Logs & Notifications', roles: ['Admin','Asset Manager','Department Head','Employee'] }
  ];
  return items.filter((item) => item.roles.includes(current.role)).map((item) => `
    <button class="nav-btn ${state.activeView === item.key ? 'active' : ''}" data-action="switch-view" data-view="${item.key}">
      ${item.label}
    </button>
  `).join('');
}

function viewTitle(view) {
  const map = {
    dashboard: 'Dashboard',
    org: 'Organization Setup',
    assets: 'Asset Directory',
    allocations: 'Allocation & Transfer',
    bookings: 'Resource Booking',
    maintenance: 'Maintenance Management',
    audits: 'Audit Cycles',
    reports: 'Reports & Analytics',
    notifications: 'Activity Logs & Notifications'
  };
  return map[view] || 'AssetFlow';
}

function viewSubtitle(view) {
  const map = {
    dashboard: 'Real-time operations snapshot',
    org: 'Master data and role assignments',
    assets: 'Register and track assets centrally',
    allocations: 'Prevent conflicts and process returns',
    bookings: 'Reserve shared resources without overlaps',
    maintenance: 'Route requests through approval',
    audits: 'Verify assets and log discrepancies',
    reports: 'Operational insight and exportable summaries',
    notifications: 'Who did what and when'
  };
  return map[view] || 'AssetFlow';
}

function renderView() {
  switch (state.activeView) {
    case 'dashboard': return renderDashboard();
    case 'org': return renderOrganization();
    case 'assets': return renderAssets();
    case 'allocations': return renderAllocations();
    case 'bookings': return renderBookings();
    case 'maintenance': return renderMaintenance();
    case 'audits': return renderAudits();
    case 'reports': return renderReports();
    case 'notifications': return renderNotifications();
    default: return renderDashboard();
  }
}

function renderDashboard() {
  const available = state.assets.filter((asset) => asset.status === 'Available').length;
  const allocated = state.assets.filter((asset) => asset.status === 'Allocated').length;
  const maintenance = state.maintenance.filter((item) => item.status !== 'Resolved').length;
  const activeBookings = state.bookings.filter((item) => item.status === 'Upcoming' || item.status === 'Ongoing').length;
  const pendingTransfers = state.transfers.filter((item) => item.status === 'Requested').length;
  const overdue = state.allocations.filter((item) => item.status === 'Active' && item.expectedReturnDate && item.expectedReturnDate < new Date().toISOString().split('T')[0]).length;

  return `
    <div class="grid grid-3">
      <div class="card"><h4>Assets Available</h4><div class="stat-number">${available}</div><div class="muted">Ready for allocation</div></div>
      <div class="card"><h4>Assets Allocated</h4><div class="stat-number">${allocated}</div><div class="muted">Currently in circulation</div></div>
      <div class="card"><h4>Maintenance Today</h4><div class="stat-number">${maintenance}</div><div class="muted">In-flight requests</div></div>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <h3 class="section-title">Quick actions</h3>
        <div class="inline-actions">
          <button data-action="quick-action" data-view="assets">Register Asset</button>
          <button data-action="quick-action" data-view="bookings">Book Resource</button>
          <button data-action="quick-action" data-view="maintenance">Raise Maintenance</button>
        </div>
      </div>
      <div class="card">
        <h3 class="section-title">Overdue returns</h3>
        <div class="list">
          ${overdue > 0 ? state.allocations.filter((item) => item.status === 'Active').map((item) => `<div class="list-item">${getEmployeeName(item.employeeId)} · ${getAssetTag(item.assetId)} · Due ${item.expectedReturnDate}</div>`).join('') : '<div class="list-item">No overdue returns at the moment.</div>'}
        </div>
      </div>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <h3 class="section-title">Pending transfers</h3>
        <div class="list">${pendingTransfers > 0 ? '<div class="list-item">Transfer requests require approval.</div>' : '<div class="list-item">No pending transfer requests.</div>'}</div>
      </div>
      <div class="card">
        <h3 class="section-title">Upcoming bookings</h3>
        <div class="list">${state.bookings.slice(0, 3).map((booking) => `<div class="list-item">${booking.resourceName} · ${formatDate(booking.start)} ${booking.start.split('T')[1]}</div>`).join('')}</div>
      </div>
    </div>
  `;
}

function renderOrganization() {
  const current = getCurrentUser();
  if (current.role !== 'Admin') return '<div class="card">Admin access is required for organization setup.</div>';
  return `
    <div class="grid grid-2">
      <div class="form-card">
        <h3 class="section-title">Department management</h3>
        <form id="department-form" class="stacked-form">
          <label>Name<input name="name" required /></label>
          <label>Parent department<select name="parentId"><option value="">None</option>${state.departments.map((dep) => `<option value="${dep.id}">${dep.name}</option>`).join('')}</select></label>
          <label>Department head<select name="headId">${state.employees.map((emp) => `<option value="${emp.id}">${emp.name}</option>`).join('')}</select></label>
          <label>Status<select name="status"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>
          <button type="submit">Create department</button>
        </form>
        <div class="list">${state.departments.map((dep) => `<div class="list-item">${dep.name} · Head ${getEmployeeName(dep.headId)} · ${dep.status}</div>`).join('')}</div>
      </div>
      <div class="form-card">
        <h3 class="section-title">Asset category management</h3>
        <form id="category-form" class="stacked-form">
          <label>Name<input name="name" required /></label>
          <label>Warranty/notes<textarea name="warranty" rows="3"></textarea></label>
          <button type="submit">Create category</button>
        </form>
        <div class="list">${state.categories.map((cat) => `<div class="list-item">${cat.name} · ${cat.warranty}</div>`).join('')}</div>
      </div>
    </div>
    <div class="form-card">
      <h3 class="section-title">Employee directory and role assignment</h3>
      <form id="employee-form" class="form-grid">
        <label class="full">Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Department<select name="departmentId">${state.departments.map((dep) => `<option value="${dep.id}">${dep.name}</option>`).join('')}</select></label>
        <label>Role<select name="role"><option>Employee</option><option>Department Head</option><option>Asset Manager</option></select></label>
        <label>Status<select name="status"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>
        <button type="submit" class="full">Create employee</button>
      </form>
      <div class="table-card">
        <table>
          <thead><tr><th>Name</th><th>Department</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>${state.employees.map((person) => `<tr><td>${person.name}</td><td>${getDepartmentName(person.departmentId)}</td><td>${person.role}</td><td>${person.status}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAssets() {
  return `
    <div class="grid grid-2">
      <div class="form-card">
        <h3 class="section-title">Register asset</h3>
        <form id="asset-form" class="form-grid">
          <label>Name<input name="name" required /></label>
          <label>Category<select name="categoryId">${state.categories.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join('')}</select></label>
          <label>Serial number<input name="serial" required /></label>
          <label>Acquisition date<input type="date" name="acquisitionDate" required /></label>
          <label>Acquisition cost<input type="number" name="acquisitionCost" required /></label>
          <label>Condition<select name="condition"><option>Good</option><option>Fair</option><option>Needs Review</option></select></label>
          <label>Location<input name="location" required /></label>
          <label>Status<select name="status"><option>Available</option><option>Allocated</option><option>Reserved</option><option>Under Maintenance</option><option>Lost</option><option>Retired</option><option>Disposed</option></select></label>
          <label class="full">Notes<textarea name="notes" rows="3"></textarea></label>
          <label class="full"><input type="checkbox" name="shared" /> Shared / bookable resource</label>
          <button type="submit" class="full">Register asset</button>
        </form>
      </div>
      <div class="table-card">
        <h3 class="section-title">Asset directory</h3>
        <table>
          <thead><tr><th>Tag</th><th>Name</th><th>Category</th><th>Status</th><th>Location</th></tr></thead>
          <tbody>${state.assets.map((asset) => `<tr><td>${asset.tag}</td><td>${asset.name}</td><td>${getCategoryName(asset.categoryId)}</td><td>${asset.status}</td><td>${asset.location}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAllocations() {
  return `
    <div class="grid grid-2">
      <div class="form-card">
        <h3 class="section-title">Allocate asset</h3>
        <form id="allocation-form" class="form-grid">
          <label>Asset<select name="assetId">${state.assets.filter((asset) => asset.status === 'Available').map((asset) => `<option value="${asset.id}">${asset.tag} · ${asset.name}</option>`).join('')}</select></label>
          <label>Employee<select name="employeeId">${state.employees.map((emp) => `<option value="${emp.id}">${emp.name}</option>`).join('')}</select></label>
          <label>Department<select name="departmentId">${state.departments.map((dep) => `<option value="${dep.id}">${dep.name}</option>`).join('')}</select></label>
          <label>Expected return date<input type="date" name="expectedReturnDate" /></label>
          <button type="submit" class="full">Allocate</button>
        </form>
      </div>
      <div class="card">
        <h3 class="section-title">Transfer requests</h3>
        <div class="list">${state.transfers.map((transfer) => `<div class="list-item">${getAssetTag(transfer.assetId)} · ${transfer.status}</div>`).join('')}</div>
      </div>
    </div>
    <div class="table-card">
      <h3 class="section-title">Allocation history</h3>
      <table>
        <thead><tr><th>Asset</th><th>Assigned to</th><th>Department</th><th>Expected return</th><th>Status</th></tr></thead>
        <tbody>${state.allocations.map((entry) => `<tr><td>${getAssetTag(entry.assetId)}</td><td>${entry.employeeId ? getEmployeeName(entry.employeeId) : 'Department'}</td><td>${getDepartmentName(entry.departmentId)}</td><td>${entry.expectedReturnDate || '—'}</td><td>${entry.status}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  `;
}

function renderBookings() {
  return `
    <div class="grid grid-2">
      <div class="form-card">
        <h3 class="section-title">Book a shared resource</h3>
        <form id="booking-form" class="form-grid">
          <label>Resource<input name="resourceName" required /></label>
          <label>Booker<select name="bookerId">${state.employees.map((emp) => `<option value="${emp.id}">${emp.name}</option>`).join('')}</select></label>
          <label>Start<input type="datetime-local" name="start" required /></label>
          <label>End<input type="datetime-local" name="end" required /></label>
          <button type="submit" class="full">Create booking</button>
        </form>
      </div>
      <div class="card">
        <h3 class="section-title">Calendar view</h3>
        <div class="list">${state.bookings.map((booking) => `<div class="list-item">${booking.resourceName} · ${booking.start.replace('T',' ')} → ${booking.end.replace('T',' ')} · ${booking.status}</div>`).join('')}</div>
      </div>
    </div>
  `;
}

function renderMaintenance() {
  return `
    <div class="grid grid-2">
      <div class="form-card">
        <h3 class="section-title">Raise maintenance request</h3>
        <form id="maintenance-form" class="form-grid">
          <label>Asset<select name="assetId">${state.assets.map((asset) => `<option value="${asset.id}">${asset.tag} · ${asset.name}</option>`).join('')}</select></label>
          <label>Priority<select name="priority"><option>Low</option><option>Medium</option><option>High</option></select></label>
          <label class="full">Issue<textarea name="issue" rows="3" required></textarea></label>
          <button type="submit" class="full">Submit request</button>
        </form>
      </div>
      <div class="table-card">
        <h3 class="section-title">Maintenance queue</h3>
        <table>
          <thead><tr><th>Asset</th><th>Issue</th><th>Status</th><th>Priority</th></tr></thead>
          <tbody>${state.maintenance.map((item) => `<tr><td>${getAssetTag(item.assetId)}</td><td>${item.issue}</td><td>${item.status}</td><td>${item.priority}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAudits() {
  return `
    <div class="grid grid-2">
      <div class="form-card">
        <h3 class="section-title">Create audit cycle</h3>
        <form id="audit-form" class="form-grid">
          <label>Name<input name="name" required /></label>
          <label>Scope<input name="scope" required /></label>
          <label>Date range<input name="dateRange" required /></label>
          <label>Auditors<select name="auditorIds" multiple>${state.employees.map((emp) => `<option value="${emp.id}">${emp.name}</option>`).join('')}</select></label>
          <button type="submit" class="full">Create audit cycle</button>
        </form>
      </div>
      <div class="card">
        <h3 class="section-title">Cycle overview</h3>
        <div class="list">${state.audits.map((audit) => `<div class="list-item">${audit.name} · ${audit.scope} · ${audit.status}</div>`).join('')}</div>
      </div>
    </div>
  `;
}

function renderReports() {
  const totalAssets = state.assets.length;
  const availableAssets = state.assets.filter((asset) => asset.status === 'Available').length;
  const maintenanceRequests = state.maintenance.length;
  const bookingCount = state.bookings.length;
  return `
    <div class="grid grid-3">
      <div class="card"><h4>Assets in portfolio</h4><div class="stat-number">${totalAssets}</div></div>
      <div class="card"><h4>Available today</h4><div class="stat-number">${availableAssets}</div></div>
      <div class="card"><h4>Bookings logged</h4><div class="stat-number">${bookingCount}</div></div>
    </div>
    <div class="card">
      <h3 class="section-title">Operational summary</h3>
      <p>Maintenance requests: ${maintenanceRequests}</p>
      <p>Department-wise allocation summary is available for export through the data layer.</p>
      <button data-action="export-report">Export report JSON</button>
    </div>
  `;
}

function renderNotifications() {
  return `
    <div class="card">
      <h3 class="section-title">Notification center</h3>
      <div class="list">${state.notifications.map((note) => `<div class="list-item">${note.message} · ${note.createdAt}</div>`).join('')}</div>
    </div>
  `;
}

function getAssetTag(assetId) {
  const asset = state.assets.find((entry) => entry.id === assetId);
  return asset ? asset.tag : 'Unknown';
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const user = state.users.find((entry) => entry.email === email && entry.password === password);
  if (!user) {
    alert('Please use admin@assetflow.com / admin123 or create an employee account.');
    return;
  }
  state.currentUser = { id: user.id, role: user.role };
  persist();
  render();
}

function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  if (!name || !email || !password) return;
  const employeeId = state.employees.length + 1;
  const userId = state.users.length + 1;
  const employee = { id: employeeId, name, email, departmentId: 1, role: 'Employee', status: 'Active' };
  const user = { id: userId, name, email, password, role: 'Employee', departmentId: 1, status: 'Active' };
  state.employees.push(employee);
  state.users.push(user);
  state.notifications.push({ id: state.nextNotificationNumber++, message: `${name} created an employee account`, createdAt: new Date().toISOString().split('T')[0] });
  persist();
  alert('Account created. You can sign in as an Employee and be promoted by Admin in Organization Setup.');
  document.getElementById('signup-form').reset();
}

function handleDepartmentSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const dep = {
    id: state.departments.length + 1,
    name: form.elements.name.value.trim(),
    headId: Number(form.elements.headId.value),
    parentId: form.elements.parentId.value ? Number(form.elements.parentId.value) : null,
    status: form.elements.status.value
  };
  state.departments.push(dep);
  state.notifications.push({ id: state.nextNotificationNumber++, message: `Department ${dep.name} created`, createdAt: new Date().toISOString().split('T')[0] });
  persist();
  render();
}

function handleCategorySubmit(event) {
  event.preventDefault();
  const form = event.target;
  const cat = { id: state.categories.length + 1, name: form.elements.name.value.trim(), warranty: form.elements.warranty.value.trim() || 'Standard' };
  state.categories.push(cat);
  state.notifications.push({ id: state.nextNotificationNumber++, message: `Category ${cat.name} created`, createdAt: new Date().toISOString().split('T')[0] });
  persist();
  render();
}

function handleEmployeeSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const employee = {
    id: state.employees.length + 1,
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    departmentId: Number(form.elements.departmentId.value),
    role: form.elements.role.value,
    status: form.elements.status.value
  };
  state.employees.push(employee);
  state.users.push({ id: state.users.length + 1, name: employee.name, email: employee.email, password: 'assetflow123', role: employee.role, departmentId: employee.departmentId, status: employee.status });
  state.notifications.push({ id: state.nextNotificationNumber++, message: `${employee.name} added to the directory`, createdAt: new Date().toISOString().split('T')[0] });
  persist();
  render();
}

function handleAssetSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const asset = {
    id: state.assets.length + 1,
    tag: `AF-${String(state.nextAssetNumber).padStart(4, '0')}`,
    name: form.elements.name.value.trim(),
    categoryId: Number(form.elements.categoryId.value),
    serial: form.elements.serial.value.trim(),
    acquisitionDate: form.elements.acquisitionDate.value,
    acquisitionCost: Number(form.elements.acquisitionCost.value),
    condition: form.elements.condition.value,
    location: form.elements.location.value.trim(),
    shared: form.elements.shared.checked,
    status: form.elements.status.value,
    departmentId: 1,
    holderId: null,
    notes: form.elements.notes.value.trim()
  };
  state.assets.push(asset);
  state.nextAssetNumber += 1;
  state.notifications.push({ id: state.nextNotificationNumber++, message: `${asset.tag} registered`, createdAt: new Date().toISOString().split('T')[0] });
  persist();
  render();
}

function handleAllocationSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const assetId = Number(form.elements.assetId.value);
  const asset = state.assets.find((entry) => entry.id === assetId);
  if (!asset) return;
  if (asset.status !== 'Available') {
    state.transfers.push({ id: state.nextTransferNumber++, assetId, fromEmployeeId: 1, toEmployeeId: Number(form.elements.employeeId.value), status: 'Requested' });
    state.notifications.push({ id: state.nextNotificationNumber++, message: `Transfer request created for ${asset.tag}`, createdAt: new Date().toISOString().split('T')[0] });
    persist();
    render();
    alert('The asset is not currently available. A transfer request was created instead.');
    return;
  }
  asset.status = 'Allocated';
  asset.holderId = Number(form.elements.employeeId.value);
  state.allocations.push({ id: state.allocations.length + 1, assetId, employeeId: Number(form.elements.employeeId.value), departmentId: Number(form.elements.departmentId.value), expectedReturnDate: form.elements.expectedReturnDate.value, status: 'Active' });
  state.notifications.push({ id: state.nextNotificationNumber++, message: `${asset.tag} allocated to ${getEmployeeName(Number(form.elements.employeeId.value))}`, createdAt: new Date().toISOString().split('T')[0] });
  persist();
  render();
}

function handleBookingSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const start = form.elements.start.value;
  const end = form.elements.end.value;
  const resourceName = form.elements.resourceName.value.trim();
  const overlap = state.bookings.some((booking) => booking.resourceName === resourceName && start < booking.end && end > booking.start);
  if (overlap) {
    alert('Time overlap detected. Please select a different slot.');
    return;
  }
  const booking = {
    id: state.nextBookingNumber++,
    resourceName,
    bookerId: Number(form.elements.bookerId.value),
    start,
    end,
    status: 'Upcoming'
  };
  state.bookings.push(booking);
  state.notifications.push({ id: state.nextNotificationNumber++, message: `Booking confirmed for ${resourceName}`, createdAt: new Date().toISOString().split('T')[0] });
  persist();
  render();
}

function handleMaintenanceSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const record = {
    id: state.nextMaintenanceNumber++,
    assetId: Number(form.elements.assetId.value),
    requestedBy: state.currentUser.id,
    issue: form.elements.issue.value.trim(),
    priority: form.elements.priority.value,
    status: 'Pending',
    approval: 'Pending',
    technician: 'Unassigned',
    createdAt: new Date().toISOString().split('T')[0]
  };
  state.maintenance.push(record);
  state.notifications.push({ id: state.nextNotificationNumber++, message: `Maintenance request raised for ${getAssetTag(record.assetId)}`, createdAt: new Date().toISOString().split('T')[0] });
  persist();
  render();
}

function handleAuditSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const selected = Array.from(form.elements.auditorIds.selectedOptions).map((option) => Number(option.value));
  const audit = { id: state.nextAuditNumber++, name: form.elements.name.value.trim(), scope: form.elements.scope.value.trim(), dateRange: form.elements.dateRange.value.trim(), auditorIds: selected, status: 'Open', discrepancies: [] };
  state.audits.push(audit);
  state.notifications.push({ id: state.nextNotificationNumber++, message: `Audit cycle ${audit.name} created`, createdAt: new Date().toISOString().split('T')[0] });
  persist();
  render();
}

function exportReport() {
  const report = {
    assets: state.assets,
    bookings: state.bookings,
    maintenance: state.maintenance,
    audits: state.audits
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'assetflow-report.json';
  a.click();
  URL.revokeObjectURL(url);
}

function handleAction(action, value) {
  if (action === 'switch-view') {
    state.activeView = value;
    render();
  } else if (action === 'quick-action') {
    state.activeView = value;
    render();
  } else if (action === 'export-report') {
    exportReport();
  }
}

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (form.id === 'login-form') handleLogin(event);
  if (form.id === 'signup-form') handleSignup(event);
  if (form.id === 'department-form') handleDepartmentSubmit(event);
  if (form.id === 'category-form') handleCategorySubmit(event);
  if (form.id === 'employee-form') handleEmployeeSubmit(event);
  if (form.id === 'asset-form') handleAssetSubmit(event);
  if (form.id === 'allocation-form') handleAllocationSubmit(event);
  if (form.id === 'booking-form') handleBookingSubmit(event);
  if (form.id === 'maintenance-form') handleMaintenanceSubmit(event);
  if (form.id === 'audit-form') handleAuditSubmit(event);
});

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  handleAction(target.dataset.action, target.dataset.view);
});

document.getElementById('logout-btn').addEventListener('click', () => {
  state.currentUser = null;
  persist();
  render();
});

document.getElementById('forgot-password').addEventListener('click', (event) => {
  event.preventDefault();
  alert('Password recovery is mocked for this POC. Please use admin@assetflow.com / admin123.');
});

render();
