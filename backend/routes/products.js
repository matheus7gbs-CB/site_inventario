const express = require('express');
const db = require('../database');
const authenticateToken = require('../middleware/authMiddleware');


const router = express.Router();


// Get all products
router.get('/', authenticateToken, (req, res) => {
db.all('SELECT * FROM products', (err, rows) => {
if (err) return res.status(500).send(err.message);
res.json(rows);
});
});
// Add product
router.post('/', authenticateToken, (req, res) => {
const { code, brand, type, category, price, cost, notes } = req.body;


db.run(
`INSERT INTO products (code, brand, type, category, price, cost, notes)
VALUES (?, ?, ?, ?, ?, ?, ?)`,
[code, brand, type, category, price, cost, notes],
function (err) {
if (err) return res.status(500).send(err.message);
res.json({ id: this.lastID });
}
);
});


// Update product
router.put('/:id', authenticateToken, (req, res) => {
const { code, brand, type, category, price, cost, notes } = req.body;
db.run(
`UPDATE products SET code=?, brand=?, type=?, category=?, price=?, cost=?, notes=? WHERE id=?`,
[code, brand, type, category, price, cost, notes, req.params.id],
function (err) {
if (err) return res.status(500).send(err.message);
res.json({ updated: this.changes });
}
);
});


// Delete product
router.delete('/:id', authenticateToken, (req, res) => {
db.run(`DELETE FROM products WHERE id=?`, [req.params.id], function (err) {
if (err) return res.status(500).send(err.message);
res.json({ deleted: this.changes });
});
});


module.exports = router;