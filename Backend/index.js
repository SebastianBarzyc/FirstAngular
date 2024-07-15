const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

// Ustawienia połączenia z bazą danych PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'FirstProject',
  password: 'admin',
  port: 5432,
});

app.use(bodyParser.json());
app.use(cors());

app.get('/api/exercises', (req, res) => {
  pool.query('SELECT * FROM exercises', (error, results) => {
    if (error) {
      throw error;
    }
    res.json(results.rows);
  });
});

app.post('/api/exercises', async (req, res) => {
  const { title, description } = req.body;

  try {
    const query = 'INSERT INTO exercises (title, description) VALUES ($1, $2) RETURNING *';
    const values = [title, description];

    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Exercise added successfully', exercise: result.rows[0] });
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Failed to add exercise' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
