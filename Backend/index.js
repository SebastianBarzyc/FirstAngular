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

app.get('/api/workouts/:planID/exercises', async (req, res) => {
  const planID = req.params.planID;
  try {
    const query = `
      SELECT exercise_id, exercise_title, reps
      FROM plan_exercises
      WHERE plan_id = $1
      ORDER BY exercise_title`;
    const result = await pool.query(query, [planID]);

    // Grupowanie ćwiczeń i liczenie liczby sets (serii)
    const exercisesData = result.rows.reduce((acc, row) => {
      const exerciseIndex = acc.findIndex(ex => ex.exercise_id === row.exercise_id);
      if (exerciseIndex !== -1) {
        // Jeśli ćwiczenie już istnieje, połącz jego reps w tablicę
        acc[exerciseIndex].reps.push(row.reps);
      } else {
        // Jeśli ćwiczenie nie istnieje, dodaj nowe
        acc.push({
          exercise_id: row.exercise_id,
          exercise_title: row.exercise_title,
          sets: 1, // Początkowo liczymy jedno wystąpienie ćwiczenia
          reps: [row.reps]  // Reps dodajemy do tablicy
        });
      }
      return acc;
    }, []);

    // Aktualizowanie liczby sets na podstawie liczby wystąpień ćwiczenia
    exercisesData.forEach(exercise => {
      exercise.sets = exercise.reps.length; // Zliczamy ilość wystąpień (sets)
    });

    res.status(200).json({ data: exercisesData });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Error fetching exercises' });
  }
});


app.get('/api/sessions', async (req, res) => { 
  try {
    const result = await pool.query('SELECT * FROM sessions ORDER BY session_id ASC;');
    const data = result.rows;

    res.json(data); 
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ message: 'Error retrieving data' });
  }
});

app.get('/api/session/:id/exercises', async (req, res) => {
  const sessionId = req.params.id;

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
    se.session_id = $1
GROUP BY 
    se.exercise_id, se.session_id, s.title, e.title;

`;
    const result = await pool.query(query, [sessionId]);

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
    console.error('Błąd podczas pobierania ćwiczeń:', err);
    res.status(500).json({ error: 'Error while fetching exercises' });
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
  let workouts = req.body;

  try {
    const planIdResult = await pool.query('SELECT id FROM training_plans ORDER BY id DESC LIMIT 1');
    const plan_id = planIdResult.rows[0] ? planIdResult.rows[0].id : null;
    if (!plan_id) {
      return res.status(400).json({ error: 'No training plans found, cannot assign plan_id' });
    }

    const queries = workouts.flatMap(({ exercise_id, title, reps }) => {
      return reps.map(rep => {
        const query = 'INSERT INTO plan_exercises (plan_id, exercise_id, reps, exercise_title) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [plan_id, exercise_id, rep, title];
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

app.post('/api/sessions', async (req, res) => {
  const { date, title, description } = req.body;

  try {
    const query = 'INSERT INTO sessions (date, title, description) VALUES ($1, $2, $3) RETURNING *';
    const values = [date, title, description];

    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Session added successfully', session: result.rows[0] });
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ error: 'Failed to add session' });
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
  const exercises = req.body;

  console.log('Received data:', exercises);

  if (!exercises || exercises.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
      const query = `
          INSERT INTO plan_exercises (plan_id, exercise_id, reps, exercise_title)
          VALUES 
          ${exercises.map((exercise, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(', ')}
          RETURNING *`;

      const values = exercises.flatMap(exercise => [
          exercise.planId,
          exercise.idExercise,
          exercise.reps,
          exercise.exercise_title
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

  console.log('Received data:', { exercise_id, reps, weight, session_id });

  try {
    const query = `INSERT INTO session_exercises (exercise_id, reps, weight, session_id) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [exercise_id, reps, weight, session_id];

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
    const query = 'DELETE FROM plan_exercises WHERE plan_id = $1';  // Usuwamy ćwiczenia z planu
    const query2 = 'DELETE FROM training_plans WHERE id = $1';  // Usuwamy plan treningowy
    const values = [id];
  
    // Usuwamy ćwiczenia z planu
    const result = await pool.query(query, values);
  
    // Sprawdzamy, czy plan istnieje w tabeli training_plans
    const checkQuery = 'SELECT * FROM training_plans WHERE id = $1';
    const checkResult = await pool.query(checkQuery, values);
  
    let result2;
    if (checkResult.rowCount > 0) {
      // Jeśli istnieje rekord w training_plans, usuwamy go
      result2 = await pool.query(query2, values);
    } else {
      result2 = { rowCount: 0 };  // Ustalamy result2 na 0, jeśli plan nie istnieje
    }
  
    // Sprawdzamy, czy przynajmniej jedno zapytanie usunęło dane
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

    // Wykonaj zapytanie, aby usunąć sesję
    const result = await pool.query(query, values);

    const checkQuery = 'SELECT * FROM session_exercises WHERE session_id = $1';
    const checkResult = await pool.query(checkQuery, values);

    let result2;
    if (checkResult.rowCount > 0) {
      // Jeśli istnieje rekord w training_plans, usuwamy go
      result2 = await pool.query(query2, values);
    } else {
      result2 = { rowCount: 0 };  // Ustalamy result2 na 0, jeśli plan nie istnieje
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
