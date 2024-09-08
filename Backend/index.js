const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'FirstProject',
  password: 'admin',
  port: 5432,
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:4200'
}));

app.get('/api/exercises', (req, res) => {
  pool.query('SELECT * FROM exercises ORDER BY ID ASC;', (error, results) => {
    if (error) {
      throw error;
    }
    res.json(results.rows);
  });
});

app.get('/api/exercises2/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const query ='SELECT * FROM plan_exercises WHERE plan_id = $1;';
    const values = [id];

    const result = await pool.query(query, values);

    console.log('Query result:', result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching exercises:', error);
    res.status(500).json({ message: 'Error searching exercises' });
  }
});


app.get('/api/search-exercises', async (req, res) => {
  const query = req.query.query || '';

  try {
    const result = await pool.query(
      'SELECT * FROM exercises WHERE title ILIKE $1',
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching exercises:', error);
    res.status(500).json({ message: 'Error searching exercises' });
  }
});

app.get('/api/workouts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM training_plans ORDER BY ID ASC;');
    const data = result.rows;

    res.json({
      data: data
    });
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ message: 'Error retrieving data' });
  }
});


app.get('/api/exercises/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const query = 'SELECT * FROM exercises WHERE title = $1';
    const values = [title];

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Exercise found:', exercise: result.rows[0] });
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    console.error('Error finding data:', error);
    res.status(500).json({ message: 'Error finding data' });
  }
});


app.post('/api/workouts', async (req, res) => {
  const { title, description } = req.body;

  try {
    const query = 'INSERT INTO training_plans (title, description) VALUES ($1, $2) RETURNING *';
    const values = [title, description];

    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Workout added successfully', workout: result.rows[0] });
  } catch (error) {
    console.error('Error adding workout:', error);
    res.status(500).json({ error: 'Failed to add workout' });
  }
});

app.post('/api/workouts2', async (req, res) => {
  const workouts = req.body;

  try {
    const queries = workouts.map(({ plan_id, exercise_id, sets, reps }) => {
      const query = 'INSERT INTO plan_exercises (plan_id, exercise_id, sets, reps) VALUES ($1, $2, $3, $4) RETURNING *';
      const values = [plan_id, exercise_id, sets, reps];
      return pool.query(query, values);
    });

    const results = await Promise.all(queries);

    res.status(201).json({
      message: 'Workouts added successfully',
      workouts: results.map(result => result.rows[0])
    });
  } catch (error) {
    console.error('Error adding workouts:', error);
    res.status(500).json({ error: 'Failed to add workouts' });
  }
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

app.post('/api/update-workout3/', async (req, res) => {
  const { planId, id, sets, reps } = req.body;

  try {
    const query = `INSERT INTO plan_exercises (plan_id, exercise_id, sets, reps) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [planId, id, sets, reps];

    const result = await pool.query(query, values);

    res.status(200).json({ message: 'Data has been added', data: result.rows });

  } catch (error) {
    console.error('Error updating data: ', error);
    res.status(500).json({ message: 'Error updating data' });
  }
});


app.put('/api/update-exercise/', async (req, res) => {
  const { id, newTitle, newDescription } = req.body;

  try {
  const query = `UPDATE exercises SET title = $2, description = $3 WHERE id = $1`;
  const values = [id, newTitle, newDescription];

  await pool.query(query, values);

  res.status(200).json({ message: 'Data has been updated'});

  } catch (error) {
      console.error('Error updating data: ', error);
      res.status(500).json({ message: 'Error updating data' });
    }
});

app.put('/api/update-workout/', async (req, res) => {
  const { id, newTitle, newDescription } = req.body;

  try {
  const query = `UPDATE training_plans SET title = $2, description = $3 WHERE id = $1`;
  const values = [id, newTitle, newDescription];

  await pool.query(query, values);

  res.status(200).json({ message: 'Data has been updated'});

  } catch (error) {
      console.error('Error updating data: ', error);
      res.status(500).json({ message: 'Error updating data' });
    }
});

app.delete('/api/delete-exercise/:id', async (req, res) => {
  const id = req.params.id;
  console.log('DELETE request received for ID:', id);

  try {
    const query = 'DELETE FROM exercises WHERE id = $1';
    const values = [id];

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Exercise deleted successfully' });
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    console.error('Error deleting data: ', error);
    res.status(500).json({ message: 'Error deleting data' });
  }
});

app.delete('/api/delete-workout/:id', async (req, res) => {
  const id = req.params.id;
  console.log('DELETE request received for ID:', id);

  try {
    const query = 'DELETE FROM training_plans WHERE id = $1';
    const values = [id];

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Workout deleted successfully' });
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    console.error('Error deleting data: ', error);
    res.status(500).json({ message: 'Error deleting data' });
  }
});

app.delete('/api/update-workout2/:id', async (req, res) => {
  const id = req.params.id;
  console.log('DELETE request received for ID:', id);

  try {
    const query = 'DELETE FROM plan_exercises WHERE plan_id = $1';
    const values = [id];

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Exercise deleted successfully' });
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    console.error('Error deleting data: ', error);
    res.status(500).json({ message: 'Error deleting data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
