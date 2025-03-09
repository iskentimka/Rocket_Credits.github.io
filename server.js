const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(bodyParser.json());

// Endpoint to save new users
app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const userData = `Email: ${email}, Password: ${password}\n`;

  // Append user data to users.txt
  fs.appendFile("users.txt", userData, (err) => {
    if (err) {
      console.error("Error saving user:", err);
      return res.status(500).json({ message: "Error saving user" });
    }
    res.status(201).json({ message: "User saved successfully" });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});