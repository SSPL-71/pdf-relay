const express = require("express");
const fetch = require("node-fetch"); // Use node-fetch v2
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

// 🔧 Handle large PDF payloads
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

// ✅ Use environment variable for Apps Script URL
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

// 🔐 POST: Validate passphrase from frontend
app.post("/validate-passphrase", (req, res) => {
  const input = req.body.passphrase;
  const filePath = path.join(__dirname, "access", "passphrase.txt");

  fs.readFile(filePath, "utf8", (err, stored) => {
    if (err) {
      console.error("❌ Error reading passphrase file:", err.message);
      return res.status(500).json({ authorized: false });
    }

    const isAuthorized = input === stored.trim();
    res.json({ authorized: isAuthorized });
  });
});

// 🔹 POST: Upload PDF to Apps Script
app.post("/upload-pdf", async (req, res) => {
  try {
    const { folderId, fileName, base64 } = req.body;

    console.log("📨 Received from frontend:");
    console.log("  folderId:", folderId);
    console.log("  fileName:", fileName);
    console.log("  base64 (first 50 chars):", base64?.slice(0, 50) + "...");

    const cleanBase64 = base64.replace(/^data:application\/pdf;base64,/, "");
    console.log("🧼 Cleaned base64 (first 50 chars):", cleanBase64?.slice(0, 50) + "...");

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      redirect: "follow",
      body: JSON.stringify({ folderId, fileName, base64: cleanBase64 })
    });

    const result = await response.text();
    console.log("📤 Apps Script response:", result);
    res.send(result);
  } catch (error) {
    console.error("❌ Relay error:", error.message);
    res.status(500).send("Relay failed: " + error.message);
  }
});

app.post("/upload-statement", async (req, res) => {

  try {

    const { folderId, statement } = req.body;

    console.log("Statement received for folder:", folderId);

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "updateInsuredStmt",
        folderId: folderId,
        transcript: statement
      })
    });

    const result = await response.text();

    res.send(result);

  } catch (error) {

    console.error("Statement upload error:", error);

    res.status(500).send("Upload failed");

  }

});


// 🔹 GET: Fetch case folders from Apps Script
app.get("/list-cases", async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching case folders:", error.message);
    res.status(500).send("Failed to fetch case folders");
  }
});

// 🔹 Serve frontend from gps/index.html
app.use("/access", express.static(path.join(__dirname, "access")));
app.use(express.static(path.join(__dirname, "gps")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "gps", "index.html"));
});

app.get("/gps", (req, res) => {
  res.sendFile(path.join(__dirname, "gps", "index.html"));
});

app.get("/BingSiteAuth.xml", (req, res) => {
  res.sendFile(path.join(__dirname, "BingSiteAuth.xml"));
});

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "robots.txt"));
});

// ✅ Let Render handle the port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Relay server running on port ${PORT}`);
});