const express = require('express');
const router = express.Router();

router.get('/realTimeProducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

module.exports = router;