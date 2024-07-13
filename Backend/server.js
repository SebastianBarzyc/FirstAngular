const express = require('express');
const cors = require('cors'); // Import cors

const app = express();
const port = 3000;

// Użyj cors, aby zezwolić na żądania z http://localhost:4200
app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(express.json());

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.post('/api/submit', (req, res) => {
  const { title, description } = req.body;
  console.log(`Title: ${title}, Description: ${description}`);
  res.status(201).json({ message: 'Data received!' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
