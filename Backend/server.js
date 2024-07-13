const express = require('express');
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/items'); // Importowanie routerów dla endpointów items

const app = express(); // Inicjowanie aplikacji Express

// Ustawianie middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Definiowanie routingu
app.use('/items', itemRoutes); // Użycie routerów dla endpointów items

// Definiowanie podstawowego endpointu GET
app.get('/', (req, res) => {
  res.send('Hello World!'); // Przykładowa odpowiedź na żądanie GET
});

// Ustawianie portu nasłuchiwania
const PORT = process.env.PORT || 3000;

// Uruchamianie serwera
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
