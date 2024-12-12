document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const messageElement = document.getElementById("message");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      messageElement.textContent = data.message;

      if (response.ok) {
        messageElement.style.color = "green";
        // Store user data in localStorage
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);

        // Redirect to dashboard
        window.location.href = "/pages/dashboard.html";
      } else {
        messageElement.style.color = "red";
      }
    } catch (error) {
      messageElement.textContent = "An error occurred. Please try again.";
      messageElement.style.color = "red";
    }
  });