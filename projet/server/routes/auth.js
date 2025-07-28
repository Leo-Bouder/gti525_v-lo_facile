// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const JWT_SECRET = '@secret123';

// Sign up
router.post('/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Missing fields' });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (row) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO users (email, password) VALUES (?, ?)`,
      [email, hashedPassword],
      function (err) {
        if (err) return res.status(500).json({ message: 'DB insert error' });
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, {
            expiresIn: '12h',
        });
        res.status(201).json({ message: 'User created', token });
      }
    );
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Missing fields' });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '12h',
    });

    res.json({ token });
  });
});

module.exports = router;
