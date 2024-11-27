const API_URL = "/api/keywords";

const keywordForm = document.getElementById("keywordForm");
const keywordInput = document.getElementById("keywordInput");
const channelIdInput = document.getElementById("channelIdInput"); // Ensure this element exists in your HTML
const keywordList = document.getElementById("keywordList");
const themeToggle = document.getElementById("themeToggle");

// Toggle Dark Theme
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Fetch and display keywords
async function fetchKeywords() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const keywords = await response.json();
      const keywordList = document.getElementById("keywordList");
      keywordList.innerHTML = ""; // Clear previous list

      keywords.forEach((keyword) => {
        const tr = document.createElement("tr"); // Create table row

        const channelIdCell = document.createElement("td");
        channelIdCell.textContent = keyword.channelId;
        tr.appendChild(channelIdCell);
        // Create cell for the keyword text
        const keywordCell = document.createElement("td");
        keywordCell.textContent = keyword.text;
        tr.appendChild(keywordCell);

        // Create cell for the channel ID


        // Create cell for the alert count
        const alertCountCell = document.createElement("td");
        alertCountCell.textContent = keyword.alertCount;
        tr.appendChild(alertCountCell);

        // Create delete button
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "DELETE";
        deleteButton.classList.add("remove-btn");
        deleteButton.onclick = () => deleteKeyword(keyword._id);
        actionCell.appendChild(deleteButton);
        tr.appendChild(actionCell);

        // Append row to the table
        keywordList.appendChild(tr);
      });
    } else {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    console.error(`Error fetching keywords: ${err.message}`);
  }
}


// Add a new keyword
async function addKeyword(event) {
  event.preventDefault();

  const channelId = channelIdInput.value.trim();
  const text = keywordInput.value.trim();

  // Ensure both Channel ID and Keyword are provided
  if (!channelId || !text) {
    return alert("Please enter both Channel ID and Keyword!");
  }

  const submitButton = keywordForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channelId, text }), // Send both channelId and text
    });

    if (response.status === 201) {
      channelIdInput.value = ''; // Clear input fields
      keywordInput.value = '';
      fetchKeywords(); // Reload keywords
    } else {
      const error = await response.text();
      alert(`Error: ${error}`);
    }
  } catch (err) {
    console.error('Error adding keyword:', err.message);
  } finally {
    submitButton.disabled = false;
  }
}

// Delete a keyword
async function deleteKeyword(id) {
  try {
    const response = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });  // Corrected URL format
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    fetchKeywords();
  } catch (err) {
    console.error(`Error deleting keyword: ${err.message}`);
  }
}

// Initial fetch
fetchKeywords();

// Event listener for adding a keyword
keywordForm.addEventListener("submit", addKeyword);
