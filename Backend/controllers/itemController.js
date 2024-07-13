// itemController.js

// Przykładowa implementacja funkcji obsługi żądań HTTP dla endpointów /items

const items = []; // Przykładowa lista przedmiotów

// Pobieranie wszystkich przedmiotów
const getAllItems = (req, res) => {
  res.json(items);
};

// Dodawanie nowego przedmiotu
const createItem = (req, res) => {
  const { name, description } = req.body;
  const newItem = { id: items.length + 1, name, description };
  items.push(newItem);
  res.json(newItem);
};

// Usuwanie przedmiotu po ID
const deleteItem = (req, res) => {
  const { id } = req.params;
  const index = items.findIndex(item => item.id === parseInt(id));
  if (index !== -1) {
    items.splice(index, 1);
    res.json({ message: 'Item deleted successfully' });
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
};

module.exports = {
  getAllItems,
  createItem,
  deleteItem,
};
