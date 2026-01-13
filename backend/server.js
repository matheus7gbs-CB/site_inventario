const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

    // 🔥 FALLBACK CORRETO (Node 22 + Express)
    app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });

    app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
