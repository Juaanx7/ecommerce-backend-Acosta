const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },        // Obligatorio
  description: { type: String, required: true },  // Obligatorio
  price: { type: Number, required: true },        // Obligatorio
  stock: { type: Number, required: true },        // Obligatorio
  category: { type: String, required: true },     // Obligatorio
  thumbnails: { type: [String], required: false }, // Opcional
  status: { type: Boolean, default: true }        // Opcional, valor por defecto
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;