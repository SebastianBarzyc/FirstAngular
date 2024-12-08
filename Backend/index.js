const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.post('/api/register', async (req, res) => {
  const { login, username, password } = req.body;
  console.log("login: ", login, "username: ", username);
  const existingUser = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
  if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Login is already taken."' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
      'INSERT INTO users (login, username, password) VALUES ($1, $2, $3)',
      [login, username, hashedPassword]
  );

  res.status(201).json({ message: 'Registration completed successfully!'});
});

app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  
  console.log('Login attempt:', login, password);

  const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);

  if (result.rows.length === 0) {
    return res.status(400).json({ message: 'Wrong login or password!' });
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Wrong login or password!' });
  }

  const token = jwt.sign({ userId: user.id }, 'your_secret_key');

  res.json({ message: 'User logged!', token });
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('Token received:', token);
  
  if (!token) {
    return res.status(403).json({ message: 'Access denied, no token provided.' });
  }

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      console.log('JWT verification failed:', err);
      return res.status(401).json({ message: 'Invalid token.' });
    }
    req.user = decoded;
    console.log('Decoded user:', req.user);
    next();
  });
};

app.use(authenticateToken);

app.get('/api/exercises', (req, res) => {
  const userId = req.user.userId;
  console.log(userId);
  pool.query('SELECT * FROM exercises WHERE user_id = $1 ORDER BY ID ASC;', [userId], (error, results) => {

    if (error) {
      throw error;
    }
    res.json(results.rows);
  });
});

app.get('/api/workouts', async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query('SELECT * FROM training_plans WHERE user_id = $1 ORDER BY ID ASC;', [userId]);
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
  const userId = req.user.userId;

  try {
    const query = 'SELECT * FROM exercises WHERE title = $1 AND user_id = $2';
    const values = [title, userId];

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

app.get('/api/workouts/:planID/exercises', async (req, res) => {
  const planID = req.params.planID;
  const userId = req.user.userId;

  try {
    const query = `
      SELECT exercise_id, exercise_title, reps
      FROM plan_exercises
      WHERE plan_id = $1 AND user_id = $2
      ORDER BY exercise_title`;
    
    const result = await pool.query(query, [planID, userId]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'No exercises found for this plan.' });
    }

    const exercisesData = result.rows.reduce((acc, row) => {
      const exerciseIndex = acc.findIndex(ex => ex.exercise_id === row.exercise_id);
      if (exerciseIndex !== -1) {
        acc[exerciseIndex].reps.push(row.reps);
      } else {
        acc.push({
          exercise_id: row.exercise_id,
          exercise_title: row.exercise_title,
          sets: 1,
          reps: [row.reps]
        });
      }
      return acc;
    }, []);

    exercisesData.forEach(exercise => {
      exercise.sets = exercise.reps.length;
    });

    res.status(200).json({ data: exercisesData });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Error fetching exercises' });
  }
});


app.get('/api/sessions', async (req, res) => { 
  const userId = req.user.userId;

  try {
    const result = await pool.query('SELECT * FROM sessions  WHERE user_id = $1 ORDER BY session_id ASC;', [userId]);
    const data = result.rows;

    res.json(data); 
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ message: 'Error retrieving data' });
  }
});

app.get('/api/session/:id/exercises', async (req, res) => {
  const sessionId = req.params.id;
  const userId = req.user.userId;

  try {
    const query = `
    SELECT 
    se.exercise_id AS id,
    se.session_id,
    s.title AS session_title,  
    e.title AS exercise_title, 
    json_agg(
        json_build_object(
            'reps', se.reps,
            'weight', se.weight
        )
    ) AS sets
FROM 
    session_exercises se
JOIN 
    sessions s ON se.session_id = s.session_id
JOIN 
    exercises e ON se.exercise_id = e.id
WHERE 
    se.session_id = $1 AND se.user_id = $2
GROUP BY 
    se.exercise_id, se.session_id, s.title, e.title;
`;

    const result = await pool.query(query, [sessionId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No exercises found' });
    }

    res.json(result.rows.map(row => ({
      exercise_id: row.id,
      exercise_title: row.exercise_title,
      title: row.session_title,
      sets: row.sets.map(set => ({
        reps: set.reps,
        weight: set.weight,
      })),
    })));
  } catch (err) {
    console.error('Error while fetching exercises:', err);
    res.status(500).json({ error: 'Error while fetching exercises' });
  }
});

app.get('/api/profile/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const values = [id];

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'User found:', user: result.rows[0] });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error finding data:', error);
    res.status(500).json({ message: 'Error finding data' });
  }
});

app.post('/api/workouts2', async (req, res) => {
  let workouts = req.body;
  const userId = req.user.userId;

  try {
    const planIdResult = await pool.query('SELECT id FROM training_plans WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [userId]);
    const plan_id = planIdResult.rows[0] ? planIdResult.rows[0].id : null;
    if (!plan_id) {
      return res.status(400).json({ error: 'No training plans found, cannot assign plan_id' });
    }

    const queries = workouts.flatMap(({ exercise_id, title, reps }) => {
      return reps.map(rep => {
        const query = 'INSERT INTO plan_exercises (plan_id, exercise_id, reps, exercise_title, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const values = [plan_id, exercise_id, rep, title, userId];
        return pool.query(query, values);
      });
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

app.post('/api/workouts', async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.userId;

  try {
    const query = 'INSERT INTO training_plans (title, description, user_id) VALUES ($1, $2, $3) RETURNING *';
    const values = [title, description, userId];

    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Workout added successfully', workout: result.rows[0] });
  } catch (error) {
    console.error('Error adding workout:', error);
    res.status(500).json({ error: 'Failed to add workout' });
  }
});

app.post('/api/sessions', async (req, res) => {
  const { date, title, description } = req.body;
  const userId = req.user.userId;

  try {
    const query = 'INSERT INTO sessions (date, title, description, user_id) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [date, title, description, userId];

    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Session added successfully', session: result.rows[0] });
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ error: 'Failed to add session' });
  }
});

app.post('/api/exercises', async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.userId;

  try {
    const query = 'INSERT INTO exercises (title, description, user_id) VALUES ($1, $2, $3) RETURNING *';
    const values = [title, description, userId];

    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Exercise added successfully', exercise: result.rows[0] });
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Failed to add exercise' });
  }
});

app.post('/api/update-workout3/', async (req, res) => {
  const exercises = req.body;
  const userId = req.user.userId;

  console.log('Received data:', exercises);

  if (!exercises || exercises.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
      const query = `
          INSERT INTO plan_exercises (plan_id, exercise_id, reps, exercise_title, user_id)
          VALUES 
          ${exercises.map((exercise, index) => `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`).join(', ')}
          RETURNING *`;

      const values = exercises.flatMap(exercise => [
          exercise.planId,
          exercise.idExercise,
          exercise.reps,
          exercise.exercise_title,
          userId
      ]);

      const result = await pool.query(query, values);

      res.status(200).json({
          message: 'Data has been added',
          data: result.rows
      });

  } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ message: 'Error updating data', error: error.message });
  }
});

app.post('/api/update-session3/', async (req, res) => {
  const { exercise_id, reps, weight, session_id } = req.body;
  const userId = req.user.userId;

  try {
    const query = `INSERT INTO session_exercises (exercise_id, reps, weight, session_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [exercise_id, reps, weight, session_id, userId];

    console.log('Executing query with values:', values);
    const result = await pool.query(query, values);

    res.status(200).json({ message: 'Data has been added', data: result.rows });

  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ message: 'Error updating data', error: error.message });
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

app.put('/api/update-session/', async (req, res) => {
  const { id, newTitle, newDescription } = req.body;

  try {
  const query = `UPDATE sessions SET title = $2, description = $3 WHERE session_id = $1`;
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
  try {
    const query = 'DELETE FROM plan_exercises WHERE plan_id = $1';
    const query2 = 'DELETE FROM training_plans WHERE id = $1';
    const values = [id];
  
    const result = await pool.query(query, values);
  
    const checkQuery = 'SELECT * FROM training_plans WHERE id = $1';
    const checkResult = await pool.query(checkQuery, values);
  
    let result2;
    if (checkResult.rowCount > 0) {
      result2 = await pool.query(query2, values);
    } else {
      result2 = { rowCount: 0 };
    }
  
    if (result.rowCount > 0 || result2.rowCount > 0) {
      res.status(200).json({ message: 'Workout deleted successfully' });
    } else {
      console.log("result.rowCount: " + result.rowCount);
      console.log("result2.rowCount: " + result2.rowCount);
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    console.error('Error deleting data: ', error);
    res.status(500).json({ message: 'Error deleting data' });
  }
  
});

app.delete('/api/delete-session/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const query = 'DELETE FROM sessions WHERE session_id = $1';
    const query2 = 'DELETE FROM session_exercises WHERE session_id = $1';
    const values = [id];

    const result = await pool.query(query, values);

    const checkQuery = 'SELECT * FROM session_exercises WHERE session_id = $1';
    const checkResult = await pool.query(checkQuery, values);

    let result2;
    if (checkResult.rowCount > 0) {
      result2 = await pool.query(query2, values);
    } else {
      result2 = { rowCount: 0 };
    }

    if (result.rowCount > 0 || result2.rowCount > 0) {
      res.status(200).json({ message: 'Session deleted successfully' });
    } else {
      console.log("result.rowCount: " + result.rowCount);
      console.log("result2.rowCount: " + result2.rowCount);
      res.status(404).json({ message: 'Session not found' });
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

app.delete('/api/update-session2/:id', async (req, res) => {
  const id = req.params.id;
  console.log('DELETE request received for ID:', id);

  try {
    const query = 'DELETE FROM session_exercises WHERE session_id = $1';
    const values = [id];

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Session deleted successfully' });
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    console.error('Error deleting data: ', error);
    res.status(500).json({ message: 'Error deleting data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
