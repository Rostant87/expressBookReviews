const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 1: Get all books – async/await
public_users.get('/', async function (req, res) {
  try {
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 2: Get by ISBN – Promise
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) resolve(book);
    else reject("Book not found");
  })
  .then(book => res.status(200).json(book))
  .catch(err => res.status(404).json({ message: err }));
});

// Task 3: Get by Author – Promise
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;
  new Promise((resolve, reject) => {
    const found = Object.entries(books)
      .filter(([key, b]) => b.author.toLowerCase().includes(author.toLowerCase()))
      .map(([key, b]) => ({ isbn: key, ...b }));
    if (found.length > 0) resolve(found);
    else reject("No books found for this author");
  })
  .then(found => res.status(200).json(found))
  .catch(err => res.status(404).json({ message: err }));
});

// Task 4: Get by Title – async/await
public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params;
  try {
    const found = Object.entries(books)
      .filter(([key, b]) => b.title.toLowerCase().includes(title.toLowerCase()))
      .map(([key, b]) => ({ isbn: key, ...b }));
    if (found.length === 0) {
      return res.status(404).json({ message: "No books found with this title" });
    }
    res.status(200).json(found);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.status(200).json(book.reviews);
});

// Register (public route)
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

module.exports.general = public_users;
