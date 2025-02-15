function addToCart(productId) {
    let cartId = localStorage.getItem("cartId");
  
    if (!cartId) {
      // Si no existe un carrito, se crea uno.
      fetch('/api/carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Si el endpoint requiere datos para crear el carrito, agrégalos aquí.
        body: JSON.stringify({}) 
      })
        .then(response => response.json())
        .then(data => {
          // Se asume que el endpoint retorna un objeto con la propiedad "cartId"
          cartId = data.cartId;
          localStorage.setItem("cartId", cartId);
          addProductToCart(cartId, productId);
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
    fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // En este ejemplo se envía una cantidad de 1
      body: JSON.stringify({ quantity: 1 })
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
        alert("Error al agregar el producto al carrito");
      });
  }
  
  window.addToCart = addToCart;
  