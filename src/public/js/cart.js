function addToCart(productId) {
    let cartId = localStorage.getItem("cartId");

    if (!cartId || cartId === 'undefined') {
        fetch('/api/carts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al crear el carrito');
            return response.json();
        })
        .then(data => {
            const newCartId = data._id || data.id;
            if (newCartId) {
                localStorage.setItem("cartId", newCartId);
                addProductToCart(newCartId, productId);
            } else {
                throw new Error("No se recibió un ID válido del carrito");
            }
        })
        .catch(error => {
            console.error("Error al crear el carrito:", error);
            alert("Error al crear el carrito");
        });
    } else {
        addProductToCart(cartId, productId);
    }
}

function addProductToCart(cartId, productId) {
    if (!cartId || cartId === 'undefined') {
        alert("Error: No se pudo encontrar un carrito válido");
        return;
    }
    fetch(`/api/carts/${cartId}/product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 })
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al agregar al carrito');
        return response.json();
    })
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert("Producto agregado al carrito con éxito");
        }
    })
    .catch(error => {
        console.error("Error al agregar al carrito:", error);
        alert("Error al agregar el producto al carrito");
    });
}

window.addToCart = addToCart;