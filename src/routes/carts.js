const express = require('express');
const fs = require('fs');
const router = express.Router();

const filePath = './carritos.json';
let carts = [];

//cargar carritos desde el archivo
const loadCarts = () => {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        carts = JSON.parse(data);
    }
};

// guardar carritos en el archivo
const saveCarts = () => {
    fs.writeFileSync(filePath, JSON.stringify(carts, null, 2), 'utf-8');
};

loadCarts();

//Crear un nuevo carrito
router.post('/', (req, res) => {
    const newCart = {
        id: (carts.length + 1).toString(),
        products: [],
    };

    carts.push(newCart);
    saveCarts();
    res.status(201).json({ message: 'Carrito creado', cart: newCart });
});

//Agregar producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;

    //Busca el carrito por ID
    const cart = carts.find(c => c.id === cid);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    //Busca si el producto ya existe en el carrito
    const existingProduct = cart.products.find(p => p.product === pid);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ product: pid, quantity: 1 });
    }

    saveCarts();
    res.json({ message: 'Producto agregado al carrito', cart });
});

//Listar productos de un carrito
router.get('/:cid', (req, res) => {
    const { cid } = req.params;

    const cart = carts.find(c => c.id === cid);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.json(cart.products);
});

module.exports = router;
