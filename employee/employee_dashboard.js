const dashboardData = {
  totalAssets: 245,
  availableAssets: 87,
  allocatedAssets: 132,
  maintenanceAssets: 26,
  departments: 8,
  employees: 142,
  pendingTransfers: 5,
  activeAudits: 2,

  alerts: [
    {
      title: "Pending Role Promotion",
      message: "John Doe requested promotion to Department Head.",
    },
    {
      title: "Transfer Request",
      message: "Laptop AF-0114 transfer requested from Priya to Raj.",
    },
    {
      title: "Audit Cycle Running",
      message: "IT Department Audit is 47% complete.",
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("totalAssets").textContent =
    dashboardData.totalAssets;

  document.getElementById("availableAssets").textContent =
    dashboardData.availableAssets;

  document.getElementById("allocatedAssets").textContent =
    dashboardData.allocatedAssets;

  document.getElementById("maintenanceAssets").textContent =
    dashboardData.maintenanceAssets;

  document.getElementById("departments").textContent =
    dashboardData.departments;

  document.getElementById("employees").textContent = dashboardData.employees;

  document.getElementById("pendingTransfers").textContent =
    dashboardData.pendingTransfers;

  document.getElementById("activeAudits").textContent =
    dashboardData.activeAudits;

  const alertsContainer = document.getElementById("alertsContainer");

  dashboardData.alerts.forEach((alert) => {
    const div = document.createElement("div");

    div.className = "alert-card";

    div.innerHTML = `
            <h3>${alert.title}</h3>
            <p>${alert.message}</p>
        `;

    alertsContainer.appendChild(div);
  });
});
