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

  if (typeof window.loadCases === "function") {
    window.loadCases();
  } else {
    console.error("❌ loadCases not available yet");
  }
}

