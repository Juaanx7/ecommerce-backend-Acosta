const { Router } = require("express");
const Cart = require("../models/cart.model");

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
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

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

//Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    // Buscar el carrito por id
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Eliminar el producto con el id especificado
    const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    // Eliminar el producto del carrito
    cart.products.splice(productIndex, 1);
    await cart.save();

    res.json({ status: 'success', message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto del carrito" });
  }
});

//Actualizar el carrito
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    // Verificamos si el carrito existe
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Actualizamos el carrito con el nuevo arreglo de productos
    cart.products = products;
    await cart.save();

    res.json({ status: 'success', message: 'Carrito actualizado', cart });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
});
//Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    // Verificamos si el carrito existe
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Buscamos el producto en el carrito
    const product = cart.products.find(p => p.product.toString() === pid);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    // Actualizamos la cantidad del producto
    product.quantity = quantity;
    await cart.save();

    res.json({ status: 'success', message: 'Cantidad del producto actualizada', cart });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la cantidad del producto" });
  }
});

//eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    // Verificamos si el carrito existe
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Eliminamos todos los productos del carrito
    cart.products = [];
    await cart.save();

    res.json({ status: 'success', message: 'Todos los productos fueron eliminados del carrito' });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar los productos del carrito" });
  }
});


module.exports = router;