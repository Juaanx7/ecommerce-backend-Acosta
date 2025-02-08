const express = require('express');
const { create } = require('express-handlebars');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const mongoose = require('mongoose');
const cartRoutes = require('./src/routes/carts');

const MONGO_URI = 'mongodb+srv://juaanx7:druaganoto.7@bdcoder.tcghk.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=bdCoder';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('🟢 Conectado a MongoDB Atlas')})
  .catch(err => console.error('🔴 Error al conectar a MongoDB Atlas:', err));


const Product = require('./src/models/product.model');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de Handlebars
const hbs = create({
  extname: '.handlebars',
  helpers: {
    getThumbnail: function(thumbnails) {
      return thumbnails && thumbnails.length > 0 && thumbnails[0].startsWith('http') ? thumbnails[0] : 'https://www.shutterstock.com/image-illustration/image-not-found-grayscale-photo-260nw-2425909941.jpg';
    }
  }
  
});

app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'src', 'views'));
hbs.layoutPath = path.join(__dirname, 'src', 'views', 'layouts');

app.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    console.log(products);
    res.render('home', { title: 'Página de Inicio', products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.render('home', { title: 'Página de Inicio', products: [] });
  }
});

app.get('/realTimeProducts', (req, res) => {
  res.render('realTimeProducts', { title: 'Todos nuestros productos' });
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Rutas
const productRoutes = require('./src/routes/products');
const viewsRouter = require('./src/routes/views.router');

app.use('/', viewsRouter);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

const server = http.createServer(app);

const io = new Server(server);

app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

// Configuración de socket.io
io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  // Enviar productos al cliente cuando se conecta
  const products = await Product.find();
  socket.emit('updateProducts', products);

  // Agregar nuevo producto
  socket.on('newProduct', async (productData) => {
    try {
        const newProduct = new Product(productData);
        await newProduct.save();

        const updatedProducts = await Product.find();
        io.emit('updateProducts', updatedProducts);
    } catch (error) {
        console.error('Error al agregar producto:', error);
    }
});

  // Eliminar producto
  socket.on('deleteProduct', async (productId) => {
    try {
      await Product.findByIdAndDelete(productId);
      const updatedProducts = await Product.find();
      io.emit('updateProducts', updatedProducts);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  });
});

// Inicia el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});