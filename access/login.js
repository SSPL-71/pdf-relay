function attemptLogin() {
  const passphrase = document.getElementById("loginInput").value;

  fetch("/validate-passphrase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase })
  })
  .then(res => res.json())
  .then(data => {
    if (data.authorized) {
      unlockCaseSelector();
      alert("✅ Access granted.");
    } else {
      alert("❌ Incorrect passphrase.");
    }
  })
  .catch(err => {
    console.error("Login error:", err);
  });
}

function unlockCaseSelector() {
  document.getElementById("caseSelector").disabled = false;
  loadCases();
}

function loadCases() {
  fetch("/list-cases")
    .then(res => res.json())
    .then(folders => {
      const selector = document.getElementById("caseSelector");
      selector.innerHTML = '<option value="">-- Choose a case --</option>';
      folders.forEach(folder => {
        const option = document.createElement("option");
        option.value = folder.id;
        option.textContent = folder.name;
        selector.appendChild(option);
      });
    })
    .catch(err => {
      console.error("❌ Failed to load case folders:", err);
    });
}