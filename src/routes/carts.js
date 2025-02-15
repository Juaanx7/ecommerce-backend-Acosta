const { Router } = require("express");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const router = Router();

// Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await Cart.create({ products: [] });
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

// Obtener un carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product");
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

// Agregar un producto a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const productExists = await Product.findById(pid);
    if (!productExists) return res.status(404).json({ error: "Producto no encontrado" });

    const existingProduct = cart.products.find((item) => item.product.toString() === pid);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
});

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findByIdAndUpdate(cid, {
      $pull: { products: { product: pid } },
    }, { new: true });
    
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json({ status: 'success', message: 'Producto eliminado del carrito', cart });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto del carrito" });
  }
});

// Actualizar el carrito completo
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json({ status: 'success', message: 'Carrito actualizado', cart });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
});

// Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) return res.status(400).json({ error: "La cantidad debe ser al menos 1" });

    const cart = await Cart.findOneAndUpdate(
      { _id: cid, "products.product": pid },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    );
    
    if (!cart) return res.status(404).json({ error: "Carrito o producto no encontrado" });
    res.json({ status: 'success', message: 'Cantidad del producto actualizada', cart });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la cantidad del producto" });
  }
});

// Vaciar el carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json({ status: 'success', message: 'Todos los productos fueron eliminados del carrito', cart });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar los productos del carrito" });
  }
});

// Renderizar la vista del carrito en Handlebars
router.get("/:cid/view", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product");
    if (!cart) {
      return res.status(404).render("cart", { error: "Carrito no encontrado" });
    }
    res.render("cart", { cart });
  } catch (error) {
    res.status(500).render("cart", { error: "Error al obtener el carrito" });
  }
});


module.exports = router;