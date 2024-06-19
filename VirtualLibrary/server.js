const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(bodyParser.json()); // Parse incoming JSON requests

// Initialize SQLite database
const db = new sqlite3.Database('./books.sqlite', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create 'books' table if it does not exist
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, author VARCHAR(25) NOT NULL, title VARCHAR(40) NOT NULL, genre VARCHAR(20) NOT NULL, price REAL NOT NULL)", (err) => {
    if (err) {
      console.error('Could not create table', err);
    } else {
      console.log('Table created or already exists.');
    }
  });
});

// Endpoint to search books by keyword in title
app.get('/books/:keyword', (req, res) => {
  const keyword = req.params.keyword;
  db.all("SELECT * FROM books WHERE title LIKE ?", [`%${keyword}%`], (err, rows) => {
    if (err) {
      console.error('Error fetching books', err);
      res.status(500).json({ error: err.message }); // Send 500 Internal Server Error status code
      return;
    }
    res.json(rows); // Send the fetched books as JSON response
  });
});

// Endpoint to add a new book
app.post('/books', (req, res) => {
  const { author, title, genre, price } = req.body;

  // Check if a book with the same author and title already exists
  db.get("SELECT * FROM books WHERE author = ? AND title = ?", [author, title], (err, row) => {
    if (err) {
      console.error('Error checking for existing book', err);
      res.status(500).json({ error: err.message }); // Send 500 Internal Server Error status code
      return;
    }

    if (row) {
      res.status(409).json({ message: 'The book already exists.' }); // Send 409 Conflict status code
      return;
    }

    // If the book does not exist, insert the new book into the database
    db.run("INSERT INTO books (author, title, genre, price) VALUES (?, ?, ?, ?)", [author, title, genre, price], function(err) {
      if (err) {
        console.error('Error adding book', err);
        res.status(500).json({ error: err.message }); // Send 500 Internal Server Error status code
        return;
      }
      res.json({ message: 'Book added successfully!', id: this.lastID }); // Send success message with the new book's ID
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
