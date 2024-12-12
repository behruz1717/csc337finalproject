document.addEventListener("DOMContentLoaded", () => {
  const reportList = document.getElementById("report-list");
  const backToDashboardBtn = document.getElementById("back-to-dashboard");
  const applyFiltersBtn = document.getElementById("apply-filters");
  const budgetFilter = document.getElementById("budget-filter");
  const categoryFilter = document.getElementById("category-filter");

  const username = localStorage.getItem("username"); // Assume username is stored in localStorage

  if (!username) {
    alert("No user logged in. Redirecting to login page.");
    window.location.href = "/pages/login.html";
    return;
  }

  // Fetch and display reports
  async function fetchMonthlyReports(budgetId = "", category = "") {
    try {
      const url = `http://localhost:5000/api/reports/monthly?username=${username}${
        budgetId ? `&budgetId=${budgetId}` : ""
      }${category ? `&category=${category}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch monthly reports.");
      }

      const data = await response.json();
      displayReports(data.reports);
    } catch (error) {
      console.error("Error fetching monthly reports:", error);
      reportList.innerHTML =
        "<p>Error loading reports. Please try again later.</p>";
    }
  }

  // Display reports dynamically
  function displayReports(reports) {
    reportList.innerHTML = ""; // Clear previous reports

    if (!reports || reports.length === 0) {
      reportList.innerHTML =
        "<p>No reports available for the selected criteria.</p>";
      return;
    }

    reports.forEach((report) => {
      const reportItem = document.createElement("div");
      reportItem.classList.add("report-item");

      reportItem.innerHTML = `
          <h3>Month: ${new Date(report.expenses[0]?.date).toLocaleString(
            "default",
            {
              month: "long",
            }
          )}</h3>
          <p><strong>Total Spent:</strong> $${report.totalAmount.toFixed(2)}</p>
          <ul>
            ${report.expenses
              .map(
                (expense) => `
              <li>
                <strong>${expense.category}:</strong> $${expense.amount} - ${
                  expense.description || "No description"
                } (${new Date(expense.date).toLocaleDateString()})
              </li>
            `
              )
              .join("")}
          </ul>
        `;

      reportList.appendChild(reportItem);
    });
  }

  // Load budget and category filters dynamically (optional)
  async function loadFilters() {
    // Example: Fetch budgets for the dropdown
    try {
      const response = await fetch(
        `http://localhost:5000/api/dashboard?username=${username}`
      );
      if (response.ok) {
        const data = await response.json();
        budgetFilter.innerHTML += data.budgets
          .map(
            (budget) =>
              `<option value="${budget.budgetId}">${budget.name}</option>`
          )
          .join("");
      }
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }

  // Event listeners
  backToDashboardBtn.addEventListener("click", () => {
    window.location.href = "/pages/dashboard.html";
  });

  applyFiltersBtn.addEventListener("click", () => {
    const selectedBudget = budgetFilter.value;
    const selectedCategory = categoryFilter.value;
    fetchMonthlyReports(selectedBudget, selectedCategory);
  });

  // Initialize
  loadFilters();
  fetchMonthlyReports(); // Load all reports by default
});
