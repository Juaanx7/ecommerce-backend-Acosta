document.addEventListener('DOMContentLoaded', function() {
    const socket = io();

    function updateProducts(products) {
        const productsList = document.getElementById('productsList');
        if (productsList) {
            productsList.innerHTML = '';
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('col-md-4', 'mb-4');
                
                productCard.innerHTML = `
                    <div class="card">
                        <img src="${product.thumbnails[0] || '/path/to/default-image.jpg'}" class="card-img-top" alt="${product.title}">
                        <div class="card-body">
                            <h5 class="card-title">${product.title}</h5>
                            <p class="card-text">${product.description}</p>
                            <p class="card-text"><strong>$${product.price}</strong></p>
                            <button class="btn btn-danger delete-btn" data-id="${product._id}">Eliminar</button>
                        </div>
                    </div>
                `;
                productsList.appendChild(productCard);
            });
        } else {
            console.error("El elemento productsList no se encuentra en el DOM.");
        }
    }

    socket.on('updateProducts', (products) => {
        updateProducts(products);
    });

    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const title = document.getElementById('productTitle').value;
            const price = document.getElementById('productPrice').value;
            const description = document.getElementById('productDescription').value;
            const category = document.getElementById('productCategory').value;
            const stock = document.getElementById('productStock').value;
            const thumbnail = document.getElementById('productThumbnail').value;

            if (!isValidUrl(thumbnail)) {
                alert("Por favor ingrese una URL válida para la imagen.");
                return;
            }

            const newProduct = {
                title,
                price: parseFloat(price),
                description,
                category,
                stock: parseInt(stock),
                status: true,
                thumbnails: [thumbnail],
            };

            socket.emit('newProduct', newProduct);
            addProductForm.reset();
        });
    } else {
        console.error("El formulario addProductForm no se encuentra en el DOM.");
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (e) {
            return false;
        }
    }

    if (productsList) {
        productsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const productId = event.target.getAttribute('data-id');
                socket.emit('deleteProduct', productId);
            }
        });
    } else {
        console.error("El elemento productsList no se encuentra en el DOM.");
    }

    // Función para agregar al carrito
    function addToCart(productId) {
        const cartId = localStorage.getItem("cartId") || "65abcd1234ef56789ghijk"; // Reemplaza con el ID real

        console.log(`Agregando producto ${productId} al carrito ${cartId}`);

        fetch(`/api/carts/${cartId}/product/${productId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert("Error: " + data.error);
            } else {
                alert("Producto agregado al carrito con éxito");
            }
        })
        .catch(error => {
            console.error("Error al agregar al carrito:", error);
        });
    }
});