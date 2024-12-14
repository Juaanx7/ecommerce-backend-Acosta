const express = require('express');
const fs = require('fs');
const router = express.Router();

const filePath = './productos.json';
let products = [];

//cargar productos desde el archivo
const loadProducts = () => {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        products = JSON.parse(data);
    }
};

//guardar productos en el archivo
const saveProducts = () => {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
};

loadProducts();

//Obtener todos los productos
router.get('/', (req, res) => {
    res.json(products);
});

//Crear un nuevo producto
router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    // Validar campos requeridos
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

module.exports = router;
