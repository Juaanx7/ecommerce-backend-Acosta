const express = require('express');
const { create } = require('express-handlebars');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');

// Inicializa Express
const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de Handlebars
const hbs = create({
  extname: '.handlebars',
});

app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'src', 'views')); // Carpeta de vistas
// Configuración de la ruta de los layouts
hbs.layoutPath = path.join(__dirname, 'src', 'views', 'layouts');
app.get('/', (req, res) => {
  res.render('home', { title: 'Página de Inicio' }); // Renderiza home.handlebars
});

app.get('/realTimeProducts', (req, res) => {
  res.render('realTimeProducts', { title: 'Productos en Tiempo Real' }); // Renderiza realTimeProducts.handlebars
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

// Inicializa el servidor HTTP
const server = http.createServer(app);

// Configuración de Socket.io
const io = new Server(server);

// Esto permite que el cliente cargue el archivo socket.io.js
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

// Array de productos inicial (esto debe venir de tu lógica o base de datos)
const products = [];

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Emitir productos actuales al cliente
  socket.emit('updateProducts', products);

  // Escuchar eventos de creación de productos
  socket.on('newProduct', (product) => {
    products.push(product); // Agregar el producto al array
    io.emit('updateProducts', products); // Actualizar a todos los clientes
  });

  // Escuchar eventos de eliminación de productos
  socket.on('deleteProduct', (productId) => {
    const index = products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      products.splice(index, 1); // Eliminar producto
      io.emit('updateProducts', products); // Actualizar a todos los clientes
    }
  });
});

// Inicia el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});