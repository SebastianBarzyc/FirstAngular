const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://tunvswqusvbtccadocdi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1bnZzd3F1c3ZidGNjYWRvY2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDAzODI5NiwiZXhwIjoyMDQ5NjE0Mjk2fQ.apcSjJ-PCfBhGULCeULwhVxNWKjnAnAqTu1UxcW8G9g';
const supabase = createClient(supabaseUrl, supabaseKey)

const JWTSecret = 'MY/L04wvKRRlUr1Uf19pLfSc5AngV21878ldX2oZmSl/0yMlxlX+3uZZswPniYS6SbQS466zoQMfbfTq9fvt7w==';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(bodyParser.json());
app.use(cors({
  origin: ['*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.listen(port, () => {
  console.log(`Server running on ${supabase}`);
});

app.post('/rest/v1/register', async (req, res) => {
  const { login, username, password } = req.body;
  console.log("login: ", login, "username: ", username);

  try {
      const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('login', login)
          .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
          return res.status(500).json({ message: 'Error checking existing users.', error: fetchError.message });
      }

      if (existingUser) {
          return res.status(400).json({ message: 'Login is already taken.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const { error: insertError } = await supabase
          .from('users')
          .insert([
              { login, username, password: hashedPassword }
          ]);

      if (insertError) {
          return res.status(500).json({ message: 'Error registering user.', error: insertError.message });
      }

      res.status(201).json({ message: 'Registration completed successfully!' });
  } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'An unexpected error occurred.', error: error.message });
  }
});

app.post('/rest/v1/login', async (req, res) => {
  console.log('Zapytanie do /rest/v1/login');
  res.set('apikey', supabaseKey);
  res.set('Content-Type', 'application/json');

  const { login, password } = req.body;

  console.log('Login attempt:', login);

  try {
    // Pobieranie użytkownika z bazy
    const { data: user, error: fetchError } = await supabase
  .from('users')
  .select('*', { headers: { apikey: supabaseKey } })
  .eq('login', login)
  .single();

    if (fetchError || !user) {
      console.error('Błąd pobierania danych:', fetchError);
      return res.status(400).json({ message: 'Wrong login or password!' });
    }

    // Sprawdzanie poprawności hasła
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong login or password!' });
    }

    // Generowanie tokenu JWT
    const token = jwt.sign({ userId: user.id }, JWTSecret, { expiresIn: '1h' });

    console.log('Login successful for user:', login);

    // Zwrócenie tokenu
    return res.json({ message: 'User logged!', token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An error occurred during login', error: error.message });
  }
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

app.get('/rest/v1/exercises', async (req, res) => {
  const userId = req.user?.userId; 
  if (!userId) {
    return res.status(400).json({ error: 'Nie podano identyfikatora użytkownika.' });
  }

  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania ćwiczeń.' });
    }

    res.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania ćwiczeń.' });
  }
});

app.get('/rest/v1/workouts', async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Nie podano identyfikatora użytkownika.' });
  }

  try {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania planów treningowych.' });
    }

    res.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania planów treningowych.' });
  }
});

app.get('/rest/v1/exercises/:title', async (req, res) => {
  const { title } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Nie podano identyfikatora użytkownika.' });
  }

  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('title', title)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Wystąpił błąd podczas wyszukiwania ćwiczenia.' });
    }

    if (data.length > 0) {
      res.status(200).json({ message: 'Exercise found:', exercise: data[0] });
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas wyszukiwania ćwiczenia.' });
  }
});

app.get('/rest/v1/workouts/:planID/exercises', async (req, res) => {
  const { planID } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Nie podano identyfikatora użytkownika.' });
  }

  try {
    const { data, error } = await supabase
      .from('plan_exercises')
      .select('exercise_id, exercise_title, reps')
      .eq('plan_id', planID)
      .eq('user_id', userId)
      .order('exercise_title', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania ćwiczeń dla planu.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No exercises found for this plan.' });
    }

    const exercisesData = data.reduce((acc, row) => {
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
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania ćwiczeń dla planu.' });
  }
});

app.get('/rest/v1/sessions', async (req, res) => { 
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Nie podano identyfikatora użytkownika.' });
  }

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('session_id', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania sesji.' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania sesji.' });
  }
});

app.get('/rest/v1/session/:id/exercises', async (req, res) => {
  const sessionId = req.params.id;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Nie podano identyfikatora użytkownika.' });
  }

  try {
    const { data, error } = await supabase
      .from('session_exercises')
      .select(`
        exercise_id:id, 
        session_id, 
        sessions:session_id (title), 
        exercises:exercise_id (title),
        reps:reps, 
        weight:weight,
        breakTime:breakTime
      `)
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Błąd podczas pobierania ćwiczeń z sesji.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Brak ćwiczeń dla tej sesji.' });
    }

    const exercises = data.reduce((acc, row) => {
      const { exercise_id, sessions, exercises, reps, weight, breakTime } = row;

      let exercise = acc.find(ex => ex.exercise_id === exercise_id);
      if (!exercise) {
        exercise = {
          exercise_id,
          exercise_title: exercises.title,
          title: sessions.title,
          sets: [],
        };
        acc.push(exercise);
      }
      exercise.sets.push({ reps, weight, breakTime }); // Include breakTime
      return acc;
    }, []);

    res.status(200).json(exercises);
  } catch (err) {
    console.error('Unexpected error while fetching exercises:', err);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania ćwiczeń.' });
  }
});

app.get('/rest/v1/profile/totalSessions/', async (req, res) => {
  const userId = req.user.userId;

  try {
    const query = 'SELECT COUNT(DISTINCT date) FROM sessions WHERE user_id = $1;';
    const values = [userId];

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Sessions found:', totalSessions: result.rows[0] });
    } else {
      res.status(404).json({ message: 'Sessions not found' });
    }
  } catch (error) {
    console.error('Error finding data:', error);
    res.status(500).json({ message: 'Error finding data' });
  }
});

app.get('/rest/v1/profile/totalWeights/', async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Nie podano identyfikatora użytkownika.' });
  }

  try {
    const { data, error } = await supabase
      .from('session_exercises')
      .select('weight', { count: 'exact' })
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Błąd podczas pobierania sumy ciężarów.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Brak sesji dla tego użytkownika.' });
    }

    const totalWeights = data.reduce((sum, row) => sum + (row.weight || 0), 0);

    res.status(200).json({ message: 'Suma ciężarów obliczona:', totalWeights });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas obliczania sumy ciężarów.' });
  }
});

app.get('/rest/v1/profile/consecutiveSessions/', async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Nie podano identyfikatora użytkownika.' });
  }

  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('session_id, date')
      .eq('user_id', userId)
      .lte('date', new Date().toISOString().split('T')[0]);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Błąd podczas pobierania sesji.' });
    }

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({ message: 'Brak sesji dla tego użytkownika.' });
    }

    const formattedDates = sessions
      .map(session => new Date(session.date))
      .sort((a, b) => a - b);

    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < formattedDates.length; i++) {
      const prevDate = formattedDates[i - 1];
      const currDate = formattedDates[i];

      if ((currDate - prevDate) / (1000 * 60 * 60 * 24) === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak);

    res.status(200).json({
      message: 'Obliczono liczbę kolejnych sesji:',
      consecutiveSessions: maxStreak,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas obliczania kolejnych sesji.' });
  }
});

app.get('/rest/v1/profile/:id', async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: 'Nie podano identyfikatora użytkownika.' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Błąd podczas pobierania danych użytkownika.' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }

    res.status(200).json({
      message: 'Użytkownik znaleziony:',
      user: data,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania danych użytkownika.' });
  }
});

app.post('/rest/v1/workouts2', async (req, res) => {
  const workouts = req.body;
  const userId = req.user.userId;

  try {
    const { data: lastPlan, error: lastPlanError } = await supabase
      .from('training_plans')
      .select('id')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (lastPlanError) {
      console.error('Supabase error (training_plans):', lastPlanError);
      return res.status(500).json({ error: 'Failed to fetch the last training plan' });
    }

    if (!lastPlan) {
      return res.status(400).json({ error: 'No training plans found, cannot assign plan_id' });
    }

    const plan_id = lastPlan.id;

    const insertData = workouts.flatMap(({ exercise_id, title, reps }) => {
      return reps.map(rep => ({
        plan_id,
        exercise_id,
        reps: rep,
        exercise_title: title,
        user_id: userId,
      }));
    });

    const { data, error } = await supabase
      .from('plan_exercises')
      .insert(insertData)
      .select('*');

    if (error) {
      console.error('Supabase error (plan_exercises):', error);
      return res.status(500).json({ error: 'Failed to add workouts' });
    }

    res.status(201).json({
      message: 'Workouts added successfully',
      workouts: data,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Failed to add workouts' });
  }
});

app.post('/rest/v1/workouts', async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.userId;

  try {
    const { data, error } = await supabase
      .from('training_plans')
      .insert([
        {
          title: title,
          description: description,
          user_id: userId,
        },
      ])
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to add workout' });
    }

    res.status(201).json({
      message: 'Workout added successfully',
      workout: data[0],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Failed to add workout' });
  }
});

app.post('/rest/v1/sessions', async (req, res) => {
  const { date, title, description } = req.body;
  const userId = req.user.userId;

  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          date: date,
          title: title,
          description: description,
          user_id: userId,
        },
      ])
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to add session' });
    }

    res.status(201).json({
      message: 'Session added successfully',
      session: data[0],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Failed to add session' });
  }
});

app.post('/rest/v1/exercises', async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.userId;

  try {
    const { data, error } = await supabase
      .from('exercises')
      .insert([
        {
          title: title,
          description: description,
          user_id: userId,
        },
      ])
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to add exercise' });
    }

    res.status(201).json({
      message: 'Exercise added successfully',
      exercise: data[0],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Failed to add exercise' });
  }
});

app.post('/rest/v1/update-workout3/', async (req, res) => {
  const exercises = req.body;
  const userId = req.user.userId;

  console.log('Received data:', exercises);

  if (!exercises || exercises.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
      const { data, error } = await supabase
        .from('plan_exercises')
        .upsert(
          exercises.map(exercise => ({
            plan_id: exercise.planId,
            exercise_id: exercise.idExercise,
            reps: exercise.reps,
            exercise_title: exercise.exercise_title,
            user_id: userId
          }))
        );

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ message: 'Error updating data', error: error.message });
      }

      res.status(200).json({
          message: 'Data has been added',
          data: data
      });

  } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'Error updating data', error: error.message });
  }
});

app.post('/rest/v1/update-session3/', async (req, res) => {
  const { exercises, session_id } = req.body;
  const userId = req.user.userId;

  try {
    // Delete all existing exercises for the session
    const { error: deleteError } = await supabase
      .from('session_exercises')
      .delete()
      .eq('session_id', session_id);

    if (deleteError) {
      console.error('Supabase error:', deleteError);
      return res.status(500).json({ message: 'Error deleting existing exercises', error: deleteError.message });
    }

    // Prepare the exercises data for insertion
    const exercisesData = exercises.flatMap(exercise => 
      exercise.sets.map(set => ({
        exercise_id: exercise.exercise_id,
        reps: set.reps,
        weight: set.weight,
        breakTime: set.breakTime || 60,
        session_id: session_id,
        user_id: userId,
        exercise_title: exercise.exercise_title
      }))
    );

    // Insert new exercises
    const { data, error } = await supabase
      .from('session_exercises')
      .insert(exercisesData)
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error inserting new exercises', error: error.message });
    }

    res.status(200).json({
      message: 'Exercises have been updated',
      data: data
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error updating exercises', error: error.message });
  }
});

app.put('/rest/v1/update-exercise/', async (req, res) => {
  const { id, newTitle, newDescription } = req.body;

  try {
    const { data, error } = await supabase
      .from('exercises')
      .update({
        title: newTitle,
        description: newDescription
      })
      .eq('id', id)
      .select('*');
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error updating data', error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(200).json({ message: 'Data has been updated', updatedExercise: data[0] });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error updating data', error: error.message });
  }
});

app.put('/rest/v1/update-workout/', async (req, res) => {
  const { id, newTitle, newDescription } = req.body;

  try {
    const { data, error } = await supabase
      .from('training_plans')
      .update({
        title: newTitle,
        description: newDescription
      })
      .eq('id', id)
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error updating data', error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.status(200).json({ message: 'Data has been updated', updatedWorkout: data[0] });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error updating data', error: error.message });
  }
});

app.put('/rest/v1/update-session/', async (req, res) => {
  const { id, newTitle, newDescription } = req.body;

  try {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        title: newTitle,
        description: newDescription
      })
      .eq('session_id', id)
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error updating data', error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.status(200).json({ message: 'Data has been updated', updatedSession: data[0] });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error updating data', error: error.message });
  }
});

app.delete('/rest/v1/delete-exercise/:id', async (req, res) => {
  const id = req.params.id;
  console.log('DELETE request received for ID:', id);

  try {
    const { data, error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error deleting data', error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(200).json({ message: 'Exercise deleted successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error deleting data', error: error.message });
  }
});

app.delete('/rest/v1/delete-workout/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { data: planExercisesData, error: planExercisesError } = await supabase
      .from('plan_exercises')
      .delete()
      .eq('plan_id', id);

    if (planExercisesError) {
      console.error('Error deleting from plan_exercises:', planExercisesError);
      return res.status(500).json({ message: 'Error deleting data from plan_exercises', error: planExercisesError.message });
    }

    const { data: checkPlanData, error: checkPlanError } = await supabase
      .from('training_plans')
      .select()
      .eq('id', id);

    if (checkPlanError) {
      console.error('Error checking training_plan:', checkPlanError);
      return res.status(500).json({ message: 'Error checking training plan', error: checkPlanError.message });
    }

    if (checkPlanData.length > 0) {
      const { data: trainingPlanData, error: trainingPlanError } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', id);

      if (trainingPlanError) {
        console.error('Error deleting from training_plans:', trainingPlanError);
        return res.status(500).json({ message: 'Error deleting from training_plans', error: trainingPlanError.message });
      }
    }

    if (planExercisesData.length > 0 || checkPlanData.length > 0) {
      res.status(200).json({ message: 'Workout deleted successfully' });
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error deleting data', error: error.message });
  }
});

app.delete('/rest/v1/delete-session/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { data: sessionExercisesData, error: sessionExercisesError } = await supabase
      .from('session_exercises')
      .delete()
      .eq('session_id', id);

    if (sessionExercisesError) {
      console.error('Error deleting from session_exercises:', sessionExercisesError);
      return res.status(500).json({ message: 'Error deleting data from session_exercises', error: sessionExercisesError.message });
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .delete()
      .eq('session_id', id);

    if (sessionError) {
      console.error('Error deleting from sessions:', sessionError);
      return res.status(500).json({ message: 'Error deleting data from sessions', error: sessionError.message });
    }

    if (sessionData.length > 0 || sessionExercisesData.length > 0) {
      res.status(200).json({ message: 'Session deleted successfully' });
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error deleting data', error: error.message });
  }
});

app.delete('/rest/v1/update-workout2/:id', async (req, res) => {
  const id = req.params.id;
  console.log('DELETE request received for plan_id:', id);

  try {
    const { data, error } = await supabase
      .from('plan_exercises')
      .delete()
      .eq('plan_id', id);

    if (error) {
      console.error('Error deleting from plan_exercises:', error);
      return res.status(500).json({ message: 'Error deleting data from plan_exercises', error: error.message });
    }

    if (data.length > 0) {
      res.status(200).json({ message: 'Exercise deleted successfully' });
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error deleting data', error: error.message });
  }
});

app.delete('/rest/v1/update-session2/:id', async (req, res) => {
  const id = req.params.id;
  console.log('DELETE request received for session_id:', id);

  try {
    const { data, error } = await supabase
      .from('session_exercises')
      .delete()
      .eq('session_id', id);

    if (error) {
      console.error('Error deleting from session_exercises:', error);
      return res.status(500).json({ message: 'Error deleting data from session_exercises', error: error.message });
    }

    if (data.length > 0) {
      res.status(200).json({ message: 'Session deleted successfully' });
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error deleting data', error: error.message });
  }
});

/*
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}
);*/
