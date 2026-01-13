    const express = require('express');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const db = require('../database');

    const router = express.Router();
    const SECRET_KEY = 'supersecretkey';

    // Register
    router.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Missing fields');
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        function (err) {
        if (err) {
            return res.status(500).send('User already exists');
        }

        res.json({ message: 'User registered successfully' });
        }
    );
    });

    // Login
    router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, user) => {
        if (err) return res.status(500).send('Server error');
        if (!user) return res.status(404).send('User not found');

        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) return res.status(401).send('Invalid password');

        const token = jwt.sign(
            { id: user.id },
            SECRET_KEY,
            { expiresIn: '1d' }
        );

        res.json({ auth: true, token });
        }
    );
    });

    module.exports = router;

