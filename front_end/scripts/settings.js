document.addEventListener("DOMContentLoaded", () => {
  const updateUsernameForm = document.getElementById("update-username-form");
  const deleteAccountBtn = document.getElementById("delete-account-btn");
  const backToDashboardBtn = document.getElementById("back-to-dashboard");

  const currentUsername = localStorage.getItem("username"); // Assume userId is stored in localStorage

  if (!currentUsername) {
    alert("No user logged in. Redirecting to login page.");
    window.location.href = "/pages/login.html";
    return;
  }

  // Update Username
  updateUsernameForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newUsername = document.getElementById("new-username").value;

    try {
      const response = await fetch(
        `http://localhost:5000/api/settings/update-username`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentUsername, newUsername }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating username:", error);
      alert("An error occurred. Please try again later.");
    }
  });

  // Handle account deletion
  deleteAccountBtn.addEventListener("click", async () => {
    console.log(currentUsername);
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/settings/delete-account",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentUsername }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        localStorage.clear(); // Clear user data from localStorage
        window.location.href = "/pages/landing.html"; // Redirect to login page
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred. Please try again later.");
    }
  });

  // Back to Dashboard
  backToDashboardBtn.addEventListener("click", () => {
    window.location.href = "/pages/dashboard.html";
  });
});
