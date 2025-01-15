const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/realTimeProducts', (req, res) => {
  res.render('realTimeProducts');
});

module.exports = router;
