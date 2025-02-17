window.onload = function(){
    const socket = io();
    const productsList = document.getElementById('productsList');
    const addProductForm = document.getElementById('addProductForm');

    if (!addProductForm || !productsList) {
        console.warn("La vista actual no contiene addProductForm o productsList.");
        return;
    }

    function updateProducts(products) {
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
                </div>`;
            productsList.appendChild(productCard);
        });
    }

    socket.on('updateProducts', updateProducts);

    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newProduct = {
            title: document.getElementById('productTitle').value,
            price: parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            category: document.getElementById('productCategory').value,
            stock: parseInt(document.getElementById('productStock').value),
            thumbnails: [document.getElementById('productThumbnail').value],
            status: true
        };
        socket.emit('newProduct', newProduct);
        addProductForm.reset();
    });

    productsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const productId = event.target.getAttribute('data-id');
            socket.emit('deleteProduct', productId);
        }
    });
};