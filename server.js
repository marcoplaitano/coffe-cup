const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs").promises;

const app = express();
const PORT = 3000;

const FILENAME = "scores.json";

// Serve static HTML file
app.use(express.static(path.join(__dirname)));

// Middleware to parse JSON
app.use(bodyParser.json());

// API endpoint to get current data
app.post("/api/get-data", async (req, res) => {
  let data = await readJSONFile(FILENAME);
  let sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
  res.json(sortedData); // Send the sorted list to the client
});

// API endpoint to increment score
app.post("/api/increment-score", async (req, res) => {
  let data = await readJSONFile(FILENAME);
  const { name } = req.body;
  data[name] = (data[name] || 0) + 1;
  await writeJSONFile(FILENAME, data);
  let sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
  res.json(sortedData); // Send the sorted list to the client
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


async function readJSONFile(filename) {
  try {
    const data = await fs.readFile(filename, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}: ${error}`);
    return [];
  }
}

async function writeJSONFile(filename, data) {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}
