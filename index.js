// Import the Express package
const express = require('express');

// Initialize an Express application
const app = express();

// Define a "port" for your server to listen on.
// 3001 is a common choice for a backend dev server.
const PORT = process.env.PORT || 3001;

// Create your first "route"
// This tells the server what to do if someone visits the main URL ("/")
// A "GET" request is what a browser does when you visit a URL.
app.get('/', (req, res) => {
  // res.send() sends a simple text response back
  res.send('Hello from the EchoPlay-V2 Backend! 🔥');
});

// Tell the server to start "listening" for requests on the port
app.listen(PORT, () => {
  console.log(`Server is running live on http://localhost:${PORT}`);
});