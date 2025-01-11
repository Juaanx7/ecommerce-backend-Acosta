const express = require('express');
const router = express.Router();

// Ruta para la vista home
router.get('/', (req, res) => {
  res.render('home'); // Renderiza home.handlebars
});

// Ruta para otra vista
router.get('/realTimeProducts', (req, res) => {
  res.render('realTimeProducts'); // Renderiza realTimeProducts.handlebars
});

module.exports = router;
