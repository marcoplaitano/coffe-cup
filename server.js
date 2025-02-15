const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs").promises;

const app = express();
const PORT = process.env.PORT || 3000;

const SCORES_FILE = "scores.json";
const SCORES_FILE_PATH = path.resolve(__dirname, SCORES_FILE)
const LOG_FILE = "log.txt";
const LOG_FILE_PATH = path.resolve(__dirname, LOG_FILE);

// Serve static HTML file
app.use(express.static(path.join(__dirname)));

// Middleware to parse JSON
app.use(bodyParser.json());

// API endpoint to get current data
app.post("/api/get-data", async (req, res) => {
  let data = await readJSONFile(SCORES_FILE_PATH);
  let sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
  res.json(sortedData); // Send the sorted list to the client
});

// API endpoint to increment score
app.post("/api/increment-score", async (req, res) => {
  let data = await readJSONFile(SCORES_FILE_PATH);
  const { name } = req.body;
  data[name] = (data[name] || 0) + 1;
  await writeJSONFile(SCORES_FILE_PATH, data);
  logf(name + " + " + data[name]);
  let sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
  res.json(sortedData); // Send the sorted list to the client
});

// API endpoint to decrement score
app.post("/api/decrement-score", async (req, res) => {
  let data = await readJSONFile(SCORES_FILE_PATH);
  const { name } = req.body;
  data[name] = (data[name] || 0) - 1;
  if (data[name] < 0)
    data[name] = 0;
  await writeJSONFile(SCORES_FILE_PATH, data);
  logf(name + " - " + data[name]);
  let sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
  res.json(sortedData); // Send the sorted list to the client
});

// API endpoint to add a new user
app.post("/api/add-user", async (req, res) => {
  let data = await readJSONFile(SCORES_FILE_PATH);
  const { name } = req.body;
  data[name] = 0;
  await writeJSONFile(SCORES_FILE_PATH, data);
  logf(name + " new user");
  let sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
  res.json(sortedData); // Send the sorted list to the client
});

// API endpoint to delete a user
app.post("/api/delete-user", async (req, res) => {
  let data = await readJSONFile(SCORES_FILE_PATH);
  const { name } = req.body;
  delete data[name];
  await writeJSONFile(SCORES_FILE_PATH, data);
  logf(name + " delete user");
  let sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
  res.json(sortedData); // Send the sorted list to the client
});

// API endpoint to show log
app.post("/api/show-log", async (req, res) => {
  const NUM_LINES = 20; // Number of lines to read from the file.
  try {
    const data = await fs.readFile(LOG_FILE_PATH, 'utf8');
    const lines = data.trim().split('\n').reverse();
    res.send(lines.slice(-NUM_LINES).join('<br>')); // Join lines with <br> for HTML formatting
  } catch (err) {
    console.error('Error reading the log file:', err);
    res.status(500).send('Error reading the log file.');
  }
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

function logf(message) {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // Format dd/mm/YY
  const formattedTime = now.toTimeString().split(' ')[0]; // Format HH:MM:SS

  const logEntry = `${formattedDate} ${formattedTime}: ${message}\n`;

  // Append the message to the specified file
  fs.appendFile(LOG_FILE_PATH, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}
