const express = require('express');
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/items'); // Importowanie routerów dla endpointów items

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routing dla endpointów items
app.use('/items', itemRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
