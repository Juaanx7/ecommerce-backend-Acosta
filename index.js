const express = require('express');
const { create } = require('express-handlebars');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const fs = require('fs');
const filePath = './src/data/productos.json';

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de Handlebars
const hbs = create({
  extname: '.handlebars',
  helpers: {
    getThumbnail: function(thumbnails) {
      return thumbnails && thumbnails.length > 0 ? thumbnails[0] : '/path/to/default-image.jpg';
    }
  }
});

app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'src', 'views'));
hbs.layoutPath = path.join(__dirname, 'src', 'views', 'layouts');


let products = [];

const loadProducts = () => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error al leer el archivo:", err);
    } else {
      products = JSON.parse(data);
    }
  });
};

loadProducts();

app.get('/', (req, res) => {
  res.render('home', { title: 'Página de Inicio', products: products });
});

app.get('/realTimeProducts', (req, res) => {
  res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Rutas
const productRoutes = require('./src/routes/products');
const cartRoutes = require('./src/routes/carts');
const viewsRouter = require('./src/routes/views.router');

app.use('/', viewsRouter);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

const server = http.createServer(app);

const io = new Server(server);

app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

// Función para guardar los productos en el archivo JSON
const saveProductsToFile = () => {
  fs.writeFile(filePath, JSON.stringify(products, null, 2), (err) => {
    if (err) {
      console.error("Error al guardar los productos:", err);
    }
  });
};

// Función para obtener el siguiente ID disponible
const getNextId = () => {
  const ids = products.map((product) => parseInt(product.id));
  const maxId = Math.max(...ids);
  return maxId + 1;
};

// Configuración de socket.io
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.emit('updateProducts', products);

  socket.on('newProduct', (product) => {
    const newProduct = {
      ...product,
      id: getNextId().toString(),
      status: true,
      stock: product.stock || 0,
      category: product.category || 'Sin categoría',
      thumbnails: product.thumbnails || [],
    };

    products.push(newProduct);
    saveProductsToFile();
    io.emit('updateProducts', products);
  });

  socket.on('deleteProduct', (productId) => {
    const index = products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      products.splice(index, 1);
      saveProductsToFile();
      io.emit('updateProducts', products);
    }
  });
});

// Inicia el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});