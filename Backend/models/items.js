// models/item.js
app.post('/items', async (req, res) => {

const db = require('../db').default;

const getAllItems = async () => {
  return await db.any('SELECT * FROM items');
};

const getItemById = async (id) => {
  return await db.oneOrNone('SELECT * FROM items WHERE id = $1', [id]);
};

const createItem = async (name, description) => {
  return await db.one(
    'INSERT INTO items(name, description) VALUES($1, $2) RETURNING *',
    [name, description]
  );
};

const deleteItem = async (id) => {
  return await db.none('DELETE FROM items WHERE id = $1', [id]);
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  deleteItem,
};
})