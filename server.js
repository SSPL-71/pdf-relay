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