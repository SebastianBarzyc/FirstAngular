// items.js

const express = require('express');
const router = express.Router();
const { createItem, getAllItems, deleteItem } = require('../controllers/itemController');

// Endpoint GET do pobierania wszystkich przedmiotów
router.get('/', getAllItems);

// Endpoint POST do tworzenia nowego przedmiotu
router.post('/', createItem);

// Endpoint DELETE do usuwania przedmiotu po ID
router.delete('/:id', deleteItem);

module.exports = router;
