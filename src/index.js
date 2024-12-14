const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
