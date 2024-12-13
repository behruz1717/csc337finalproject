document.addEventListener("DOMContentLoaded", async () => {
  const backToDashboardBtn = document.getElementById("back-to-dashboard");
  const BASE_URL = "http://143.198.59.70:80";
  backToDashboardBtn.addEventListener("click", () => {
    window.location.href = "/pages/dashboard.html";
  });

  const budgetDetailsContainer = document.getElementById(
    "budget-details-container"
  );
  const params = new URLSearchParams(window.location.search);
  const budgetId = params.get("budgetId");

  if (!budgetId) {
    budgetDetailsContainer.innerHTML = "<p>Invalid budget ID.</p>";
    return;
  }

  const editBudgetModal = document.getElementById("edit-budget-modal");
  const closeEditBudgetModal = document.getElementById(
    "close-edit-budget-modal"
  );
  const editBudgetForm = document.getElementById("edit-budget-form");
  const editBudgetName = document.getElementById("edit-budget-name");
  const editBudgetGoal = document.getElementById("edit-budget-goal");
  const username = localStorage.getItem("username"); // Retrieve username from localStorage

  // Fetch and display budget details
  async function fetchBudgetDetails() {
    try {
      const response = await fetch(
        `${BASE_URL}/api/budgets/${budgetId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch budget details");
      }

      const budget = await response.json();
      displayBudgetDetails(budget);
    } catch (error) {
      console.error("Error fetching budget details:", error);
      budgetDetailsContainer.innerHTML = "<p>Error loading budget details.</p>";
    }
  }

  // Display budget details
  function displayBudgetDetails(budget) {
    const { name, goalAmount, expenses } = budget;
    const totalSpent = expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    budgetDetailsContainer.innerHTML = `
      <div>
        <h2>${name}</h2>
        <p><strong>Goal:</strong> $${goalAmount.toFixed(2)}</p>
        <p><strong>Total Spent:</strong> $${totalSpent.toFixed(2)}</p>
        <button id="edit-budget-btn">Edit Budget</button>
        <button id="archive-budget-btn">Archive Budget</button>
      </div>
      <div>
        <h3>Expenses</h3>
        <ul>
          ${expenses
            .map(
              (expense) => `
                <li>
                  ${expense.category}: $${expense.amount} (${
                expense.description || "No description"
              }) 
                  <button class="edit-expense-btn" data-expense='${JSON.stringify(
                    expense
                  )}'>Edit</button>
                  <button class="delete-expense-btn" data-id="${
                    expense._id
                  }">Delete</button>
                </li>
              `
            )
            .join("")}
        </ul>
        <button id="add-expense-btn">Add Expense</button>
      </div>
    `;

    document
      .getElementById("edit-budget-btn")
      .addEventListener("click", () => openEditBudgetModal(budget));
    document
      .getElementById("archive-budget-btn")
      .addEventListener("click", () => archiveBudget(budget._id));
    document.getElementById("add-expense-btn").addEventListener("click", () => {
      openExpenseModal(); // Open modal in add mode
    });
    document.querySelectorAll(".edit-expense-btn").forEach((button) =>
      button.addEventListener("click", (e) => {
        const expense = JSON.parse(e.target.dataset.expense);
        openExpenseModal(true, expense); // Open modal in edit mode with expense details
      })
    );
    document.querySelectorAll(".delete-expense-btn").forEach((button) =>
      button.addEventListener("click", (e) => {
        const expenseId = e.target.dataset.id;
        deleteExpense(expenseId);
      })
    );
  }

  // Open Edit Budget Modal
  function openEditBudgetModal(budget) {
    editBudgetName.value = budget.name;
    editBudgetGoal.value = budget.goalAmount;
    editBudgetModal.style.display = "flex";
  }

  editBudgetForm.onsubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${BASE_URL}/api/budgets/${budgetId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editBudgetName.value,
            goalAmount: parseFloat(editBudgetGoal.value),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update budget");
      }

      alert("Budget updated successfully.");
      editBudgetModal.style.display = "none"; // Close the modal
      fetchBudgetDetails(); // Refresh details
    } catch (error) {
      console.error("Error updating budget:", error);
      alert("An error occurred while updating the budget.");
    }
  };

  // Close Edit Budget Modal
  closeEditBudgetModal.addEventListener("click", () => {
    editBudgetModal.style.display = "none";
  });

  function archiveBudget(budgetId) {
    if (!confirm("Are you sure you want to archive this budget?")) return;

    async function handleArchive() {
      try {
        const response = await fetch(
          `${BASE_URL}/api/budgets/${budgetId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ archived: true }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to archive budget");
        }

        alert("Budget archived successfully.");
        window.location.href = "/pages/archived-budgets.html"; // Redirect to dashboard
      } catch (error) {
        console.error("Error archiving budget:", error);
        alert("An error occurred while archiving the budget.");
      }
    }

    handleArchive();
  }

  const expenseModal = document.getElementById("expense-modal");
  const closeExpenseModal = document.getElementById("close-expense-modal");
  const expenseForm = document.getElementById("expense-form");
  const expenseAmount = document.getElementById("expense-amount");
  const expenseCategory = document.getElementById("expense-category");
  const expenseDescription = document.getElementById("expense-description");
  const expenseModalTitle = document.getElementById("expense-modal-title");

  let editingExpenseId = null;

  function openExpenseModal(isEdit, expense = {}) {
    expenseModal.style.display = "flex";
    expenseModalTitle.textContent = isEdit ? "Edit Expense" : "Add Expense";

    expenseAmount.value = expense.amount || "";
    expenseCategory.value = expense.category || "";
    expenseDescription.value = expense.description || "";
    editingExpenseId = isEdit ? expense._id : null;
  }

  expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = localStorage.getItem("username");

    if (!username) {
      alert("No user logged in. Redirecting to login page.");
      window.location.href = "/pages/login.html";
      return;
    }

    const method = editingExpenseId ? "PUT" : "POST";
    const url = editingExpenseId
      ? `${BASE_URL}/api/expenses/${editingExpenseId}`
      : `${BASE_URL}/api/expenses`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          budgetId,
          amount: parseFloat(expenseAmount.value),
          category: expenseCategory.value,
          description: expenseDescription.value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save expense");
      }

      alert(
        `${
          editingExpenseId ? "Expense updated" : "Expense added"
        } successfully.`
      );
      expenseModal.style.display = "none"; // Close modal
      fetchBudgetDetails(); // Refresh details
    } catch (error) {
      console.error(
        `${editingExpenseId ? "Updating" : "Adding"} expense error:`,
        error
      );
      alert("An error occurred while saving the expense.");
    }
  });

  closeExpenseModal.addEventListener("click", () => {
    expenseModal.style.display = "none";
  });

  function deleteExpense(expenseId) {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    async function handleDelete() {
      try {
        const response = await fetch(
          `${BASE_URL}/api/expenses/${expenseId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete expense");
        }

        alert("Expense deleted successfully.");
        fetchBudgetDetails(); // Refresh details
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("An error occurred while deleting the expense.");
      }
    }

    handleDelete();
  }

  // Initial fetch of budget details
  fetchBudgetDetails();
});
