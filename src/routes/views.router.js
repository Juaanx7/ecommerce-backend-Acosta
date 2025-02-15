const express = require('express');
const router = express.Router();

router.get('/realTimeProducts', (req, res) => {
  res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

router.get('/cart', (req, res) => {
  const cart = { products: [] };
  res.render('cart', { title: 'Carrito de Compras', cart });
});

module.exports = router;
