document.addEventListener("DOMContentLoaded", () => {
  const budgetsList = document.getElementById("budgets-list");
  const addBudgetBtn = document.getElementById("add-budget-btn");
  const addBudgetModal = document.getElementById("add-budget-modal");
  const closeBudgetModal = document.getElementById("close-modal");
  const addBudgetForm = document.getElementById("add-budget-form");
  const logoutBtn = document.getElementById("logout-btn");
  const username = localStorage.getItem("username");

  if (!username) {
    alert("No user logged in. Redirecting to login page.");
    window.location.href = "/pages/login.html";
    return;
  }

  async function fetchBudgets() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/dashboard?username=${username}`
      );
      const data = await response.json();

      if (!response.ok) {
        budgetsList.innerHTML = `<p>${data.message}</p>`;
        return;
      }

      displayBudgets(data.budgets);
    } catch (error) {
      budgetsList.innerHTML =
        "<p>Error loading budgets. Please try again later.</p>";
    }
  }

  function displayBudgets(budgets) {
    budgetsList.innerHTML = "";
    if (budgets.length === 0) {
      budgetsList.innerHTML =
        "<p>No budgets found. Add one to get started!</p>";
      return;
    }

    budgets.forEach((budget) => {
      const budgetItem = document.createElement("div");
      budgetItem.classList.add("budget-item");

      budgetItem.innerHTML = `
        <div>
          <h3>${budget.name}</h3>
          <p>Goal: $${budget.goalAmount.toFixed(2)}</p>
          <p>Total Spent: $${budget.totalExpenses.toFixed(2)}</p>
        </div>
        <button class="view-details-btn" data-id="${
          budget.budgetId
        }">View Details</button>
      `;

      budgetsList.appendChild(budgetItem);
    });

    document.querySelectorAll(".view-details-btn").forEach((button) =>
      button.addEventListener("click", () => {
        const budgetId = button.dataset.id;
        window.location.href = `/pages/budget-details.html?budgetId=${budgetId}`;
      })
    );
  }

  addBudgetBtn.addEventListener("click", () => {
    addBudgetModal.style.display = "flex";
  });

  closeBudgetModal.addEventListener("click", () => {
    addBudgetModal.style.display = "none";
  });

  addBudgetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("budget-name").value;
    const goalAmount = parseFloat(document.getElementById("budget-goal").value);

    try {
      const response = await fetch("http://localhost:5000/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, goalAmount }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchBudgets();
      } else {
        alert(data.message);
      }

      addBudgetModal.style.display = "none";
      addBudgetForm.reset();
    } catch (error) {
      alert("An error occurred. Please try again later.");
    }
  });

  logoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.clear(); // Clear user data
      window.location.href = "/pages/landing.html"; // Redirect to login page
    }
  });

  fetchBudgets();
});
