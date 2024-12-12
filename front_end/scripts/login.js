document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const messageElement = document.getElementById("message");

  try {
    const response = await fetch(
      `http://localhost:5000/api/auth/login?username=${username}`
    );
    const data = await response.json();

    if (response.ok) {
      messageElement.style.color = "green";
      messageElement.textContent = data.message;

      // Store username in localStorage
      localStorage.setItem("username", username);

      // Redirect to the dashboard
      window.location.href = "/pages/dashboard.html";
    } else {
      messageElement.style.color = "red";
      messageElement.textContent = data.message;
    }
  } catch (error) {
    messageElement.textContent = "An error occurred. Please try again.";
    messageElement.style.color = "red";
  }
});
