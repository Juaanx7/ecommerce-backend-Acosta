const socket = io();
const productsList = document.getElementById('productsList');

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
            </div>
        `;
        productsList.appendChild(productCard);
    });
}

socket.on('updateProducts', (products) => {
    updateProducts(products);
});

const addProductForm = document.getElementById('addProductForm');
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

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}

productsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const productId = event.target.getAttribute('data-id');
        socket.emit('deleteProduct', productId);
    }
});

// Función para agregar al carrito
function addToCart(productId) {
    console.log('Producto agregado al carrito: ' + productId);
    
    // Enviar la información al servidor (esto se puede hacer usando fetch o AJAX)
    fetch('/api/carts/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: productId })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Carrito actualizado:', data);
      // Puedes actualizar la vista o mostrar una notificación aquí
    })
    .catch(error => {
      console.error('Error al agregar al carrito:', error);
    });
  }
  
  