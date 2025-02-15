const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');

// Obtener todos los productos
router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = 'asc', query = '' } = req.query;
        const parsedLimit = Number(limit);
        const parsedPage = Number(page);
        const skip = (parsedPage - 1) * parsedLimit;
        const sortOrder = sort === 'asc' ? 1 : -1;

        // filtro de búsqueda
        const filter = {};

        if (query) {
            if (query.startsWith("category:")) {
                const categoryValue = query.split(":")[1].trim();
                filter.category = categoryValue;
            } else {
                filter.$or = [
                    { title: { $regex: query, $options: "i" } }
                ];
            }
        }

        // busqueda con los parametros proporcionados
        const products = await Product.find(filter)
            .sort({ price: sortOrder })
            .skip(skip)
            .limit(parsedLimit);

        // total de productos para calcular las paginas
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / parsedLimit);

        // se verifica si hay paginas previas o siguientes
        const prevPage = parsedPage > 1 ? parsedPage - 1 : null;
        const nextPage = parsedPage < totalPages ? parsedPage + 1 : null;

        res.json({
            status: 'success',
            payload: products,
            totalPages,
            prevPage,
            nextPage,
            page: parsedPage,
            hasPrevPage: prevPage !== null,
            hasNextPage: nextPage !== null,
            prevLink: prevPage ? `/api/products?limit=${parsedLimit}&page=${prevPage}&sort=${sort}&query=${query}` : null,
            nextLink: nextPage ? `/api/products?limit=${parsedLimit}&page=${nextPage}&sort=${sort}&query=${query}` : null,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;