const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database setup
const db = new sqlite3.Database('./expenses.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Create tables if they don't exist
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL,
      category TEXT,
      date TEXT,
      description TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS budgets (
      category TEXT PRIMARY KEY,
      budget_limit REAL
    )`);
  }
});

// Routes
app.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/expenses', (req, res) => {
  const expense = { id: uuidv4(), ...req.body };
  db.run('INSERT INTO expenses (id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
    [expense.id, expense.amount, expense.category, expense.date, expense.description],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(expense);
    });
});

app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, category, date, description } = req.body;
  db.run('UPDATE expenses SET amount = ?, category = ?, date = ?, description = ? WHERE id = ?',
    [amount, category, date, description, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.json({ id, amount, category, date, description });
    });
});

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM expenses WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    res.status(204).send();
  });
});

app.get('/api/budgets', (req, res) => {
  db.all('SELECT category, budget_limit as limit FROM budgets', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/budgets', (req, res) => {
  const { category, limit } = req.body;
  db.run('INSERT OR REPLACE INTO budgets (category, budget_limit) VALUES (?, ?)',
    [category, limit],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ category, limit });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
