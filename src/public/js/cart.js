function addToCart(productId) {
    let cartId = localStorage.getItem("cartId");
    console.log("Cart ID en localStorage:", cartId);
  
    if (!cartId) {
        console.log("No hay cartId en localStorage, creando un nuevo carrito...");
        fetch('/api/carts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        })
        .then(response => {
            console.log("Respuesta cruda al crear carrito:", response);
            if (!response.ok) throw new Error('Error al crear el carrito');
            return response.json();
        })
        .then(data => {
            console.log("Datos JSON recibidos al crear carrito:", data);
            const newCartId = data._id || data.id || null;
            if (newCartId) {
                localStorage.setItem("cartId", newCartId);
                console.log("Nuevo cartId almacenado:", newCartId);
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
        console.log("Usando cartId existente:", cartId);
        addProductToCart(cartId, productId);
    }
  }
  
  function addProductToCart(cartId, productId) {
    console.log(`Intentando agregar producto ${productId} al carrito ${cartId}`);
    fetch(`/api/carts/${cartId}/product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 })
    })
    .then(response => {
        console.log("Respuesta cruda al agregar producto:", response);
        if (!response.ok) throw new Error('Error al agregar al carrito');
        return response.json();
    })
    .then(data => {
        console.log("Respuesta JSON al agregar producto:", data);
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