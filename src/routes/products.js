const express = require('express');
const fs = require('fs');
const router = express.Router();

const filePath = './productos.json';
let products = [];

const loadProducts = () => {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        products = JSON.parse(data);
    }
};

const saveProducts = () => {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
};

loadProducts();

router.get('/', (req, res) => {
    res.json(products);
});

router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const newProduct = {
        id: (products.length + 1).toString(),
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails: thumbnails || [],
    };

    products.push(newProduct);
    saveProducts();
    res.status(201).json({ message: 'Producto creado', product: newProduct });
});

router.get('/:pid', (req, res) => {
    const productId = req.params.pid;
    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
});


module.exports = router;
