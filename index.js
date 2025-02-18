const express = require('express');
const { create } = require('express-handlebars');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const mongoose = require('mongoose');
const cartRoutes = require('./src/routes/carts');
const handlebars = require('handlebars');

const MONGO_URI = 'mongodb+srv://juaanx7:druaganoto.7@bdcoder.tcghk.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=bdCoder';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 Conectado a MongoDB Atlas'))
  .catch(err => console.error('🔴 Error al conectar a MongoDB Atlas:', err));

const Product = require('./src/models/product.model');

const app = express();
const PORT = process.env.PORT || 8080;

const hbs = create({
  extname: '.handlebars',
  helpers: {
    getThumbnail: (thumbnails) => thumbnails && thumbnails.length > 0 ? thumbnails[0] : '/path/to/default-image.jpg',
    formatPrice: (price) => {
      const num = Number(price);
      if (isNaN(num)) return 'Precio no disponible';
      return `$${num.toFixed(2)}`;
    },
    multiply: (price, quantity) => {
      const num = Number(price) * Number(quantity);
      return isNaN(num) ? 'Error' : num.toFixed(2);
    },
    calculateTotal: (products) => {
      const total = products.reduce((sum, item) => sum + Number(item.product.price) * Number(item.quantity), 0);
      return total.toFixed(2);
    },
    json: (context) => JSON.stringify(context, null, 2)
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true
  }
});

app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'src', 'views'));
hbs.layoutPath = path.join(__dirname, 'src', 'views', 'layouts');

app.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render('home', { title: 'Página de Inicio', products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.render('home', { title: 'Página de Inicio', products: [] });
  }
});

app.get('/realTimeProducts', (req, res) => res.render('realTimeProducts', { title: 'Todos nuestros productos' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use('/js', express.static(path.join(__dirname, 'src', 'public', 'js')));
app.use('/e-commerce.png', express.static(path.join(__dirname, 'src', 'public', 'e-commerce.png')));

const productRoutes = require('./src/routes/products');
const viewsRouter = require('./src/routes/views.router');

app.use('/', viewsRouter);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

const server = http.createServer(app);
const io = new Server(server);

app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

io.on('connection', async (socket) => {
  console.log('Cliente conectado');
  const products = await Product.find().lean();
  socket.emit('updateProducts', products);

  socket.on('newProduct', async (productData) => {
    try {
      const newProduct = new Product(productData);
      await newProduct.save();
      const updatedProducts = await Product.find().lean();
      io.emit('updateProducts', updatedProducts);
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      await Product.findByIdAndDelete(productId);
      const updatedProducts = await Product.find().lean();
      io.emit('updateProducts', updatedProducts);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  });
});

server.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));