document.addEventListener("DOMContentLoaded", async () => {
  const archivedBudgetsContainer = document.getElementById(
    "archived-budgets-container"
  );
  const backToDashboardBtn = document.getElementById("back-to-dashboard");
  const username = localStorage.getItem("username");

  if (!username) {
    alert("No user logged in. Redirecting to login page.");
    window.location.href = "/pages/login.html";
    return;
  }

  backToDashboardBtn.addEventListener("click", () => {
    window.location.href = "/pages/dashboard.html";
  });

  async function fetchArchivedBudgets() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/budgets/getArchived?username=${username}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch archived budgets");
      }

      const data = await response.json();
      displayArchivedBudgets(data.budgets);
    } catch (error) {
      console.error("Error fetching archived budgets:", error);
      archivedBudgetsContainer.innerHTML =
        "<p>Error loading archived budgets.</p>";
    }
  }

  function displayArchivedBudgets(budgets) {
    if (!budgets || budgets.length === 0) {
      archivedBudgetsContainer.innerHTML = "<p>No archived budgets found.</p>";
      return;
    }

    archivedBudgetsContainer.innerHTML = budgets
      .map(
        (budget) => `
          <div class="budget-item">
            <h3>${budget.name}</h3>
            <p><strong>Goal:</strong> $${budget.goalAmount.toFixed(2)}</p>
            <p><strong>Created At:</strong> ${new Date(
              budget.createdAt
            ).toLocaleDateString()}</p>
            <button 
              class="unarchive-btn" 
              data-id="${budget._id}" 
              data-name="${budget.name}" 
              data-goalAmount="${budget.goalAmount}">
              Unarchive
            </button>
          </div>
        `
      )
      .join("");

    // Add event listeners for unarchive buttons
    document.querySelectorAll(".unarchive-btn").forEach((button) =>
      button.addEventListener("click", (e) => {
        const budgetId = e.target.dataset.id;
        const name = e.target.dataset.name;
        const goalAmount = parseFloat(e.target.dataset.goalamount);
        unarchiveBudget(budgetId, name, goalAmount);
      })
    );
  }

  function unarchiveBudget(budgetId, name, goalAmount) {
    if (!confirm("Are you sure you want to unarchive this budget?")) return;

    async function handleUnarchive() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/budgets/${budgetId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, goalAmount, archived: false }), // Include name and goalAmount
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to unarchive budget");
        }

        alert("Budget unarchived successfully.");
        fetchArchivedBudgets(); // Refresh the list of archived budgets
      } catch (error) {
        console.error("Error unarchiving budget:", error);
        alert("An error occurred while unarchiving the budget.");
      }
    }

    handleUnarchive();
  }

  fetchArchivedBudgets();
});
