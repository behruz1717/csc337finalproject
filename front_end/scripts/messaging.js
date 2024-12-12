document.addEventListener("DOMContentLoaded", () => {
  const backToDashboardBtn = document.getElementById("back-to-dashboard");
  const composeForm = document.getElementById("compose-form");
  const inboxMessagesContainer = document.getElementById("inbox-messages");
  const sentMessagesContainer = document.getElementById("sent-messages");

  const username = localStorage.getItem("username");

  if (!username) {
    alert("No user logged in. Redirecting to login page.");
    window.location.href = "/pages/login.html";
    return;
  }

  // Navigate back to dashboard
  backToDashboardBtn.addEventListener("click", () => {
    window.location.href = "/pages/dashboard.html";
  });

  // Fetch Inbox Messages
  async function fetchInbox() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/inbox/${username}`
      );
      const data = await response.json();

      if (response.ok) {
        displayMessages(inboxMessagesContainer, data.messages, "inbox");
      } else {
        inboxMessagesContainer.innerHTML = `<p>${data.message}</p>`;
      }
    } catch (error) {
      console.error("Error fetching inbox messages:", error);
      inboxMessagesContainer.innerHTML = "<p>Error loading inbox messages.</p>";
    }
  }

  // Fetch Sent Messages
  async function fetchSent() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/sent/${username}`
      );
      const data = await response.json();

      if (response.ok) {
        displayMessages(sentMessagesContainer, data.messages, "sent");
      } else {
        sentMessagesContainer.innerHTML = `<p>${data.message}</p>`;
      }
    } catch (error) {
      console.error("Error fetching sent messages:", error);
      sentMessagesContainer.innerHTML = "<p>Error loading sent messages.</p>";
    }
  }

  // Display Messages
  function displayMessages(container, messages, type) {
    container.innerHTML = "";

    if (messages.length === 0) {
      container.innerHTML = `<p>No ${type} messages found.</p>`;
      return;
    }

    messages.forEach((message) => {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");

      messageElement.innerHTML = `
          <p><strong>${type === "inbox" ? "From" : "To"}:</strong> ${
        type === "inbox"
          ? message.senderId.username
          : message.receiverId.username
      }</p>
          <p>${message.content}</p>
          <p><em>${new Date(message.timestamp).toLocaleString()}</em></p>
          <button class="delete-message-btn" data-id="${
            message._id
          }">Delete</button>
        `;

      container.appendChild(messageElement);

      // Add delete functionality
      messageElement
        .querySelector(".delete-message-btn")
        .addEventListener("click", () => deleteMessage(message._id, type));
    });
  }

  // Send a New Message
  composeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const receiverUsername = document.getElementById("receiver").value;
    const content = document.getElementById("message-content").value;

    try {
      const response = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderUsername: username,
          receiverUsername,
          content,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Message sent successfully.");
        composeForm.reset();
        fetchSent(); // Refresh sent messages
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send the message.");
    }
  });

  // Delete a Message
  async function deleteMessage(messageId, type) {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${messageId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Message deleted successfully.");
        if (type === "inbox") fetchInbox();
        if (type === "sent") fetchSent();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete the message.");
    }
  }

  // Initialize
  fetchInbox();
  fetchSent();
});
