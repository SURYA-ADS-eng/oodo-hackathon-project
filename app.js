const views = {
  dashboard: ["Dashboard", "Operational snapshot across assets, bookings, and maintenance."],
  setup: ["Organization Setup", "Manage departments, asset categories, and employee roles."],
  assets: ["Assets", "Register, search, and track the full lifecycle of assets."],
  allocation: ["Allocation & Transfer", "Handle allocations, conflicts, returns, and transfers."],
  booking: ["Resource Booking", "Book shared resources with overlap validation."],
  maintenance: ["Maintenance", "Approval-based repair workflow and lifecycle updates."],
  audit: ["Audits", "Run structured audit cycles and discrepancy checks."],
  reports: ["Reports", "Analytics, utilization trends, and operational insights."],
  logs: ["Logs & Notifications", "Track actions, alerts, and system activity."]
};

const navItems = document.querySelectorAll(".nav-item");
const viewSections = document.querySelectorAll(".view");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const roleSelect = document.getElementById("roleSelect");
const roleLabel = document.getElementById("roleLabel");
const roleDesc = document.getElementById("roleDesc");

const roleMap = {
  Admin: ["Admin", "Full organization control and setup access."],
  "Asset Manager": ["Asset Manager", "Registers assets, approves transfers and maintenance."],
  "Department Head": ["Department Head", "Views departmental assets and approves local requests."],
  Employee: ["Employee", "Books resources, requests maintenance, and views assignments."]
};

navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    navItems.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const view = btn.dataset.view;

    viewSections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(`view-${view}`).classList.add("active");
    pageTitle.textContent = views[view][0];
    pageSubtitle.textContent = views[view][1];
  });
});

roleSelect.addEventListener("change", e => {
  const [label, desc] = roleMap[e.target.value];
  roleLabel.textContent = label;
  roleDesc.textContent = desc;
});
