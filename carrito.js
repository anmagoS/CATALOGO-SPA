function actualizarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carritoAnmago")) || [];
  const contenedor = document.getElementById("carrito-contenido");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  let subtotal = 0;

  carrito.forEach((p, i) => {
    subtotal += parseFloat(p.precioFinal);
    const item = document.createElement("div");
    item.className = "mb-3 border-bottom pb-2";
    item.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <img src="${p.imagen}" width="60" style="border-radius:6px;">
        <div>
          <strong>${p.nombre}</strong><br>
          ${
            p.promo
              ? `<small><s>$${p.precioOriginal.toLocaleString()} COP</s> <span class="text-success fw-bold">$${p.precioFinal.toLocaleString()} COP</span></small>`
              : `<small>$${p.precioFinal.toLocaleString()} COP</small>`
          }
        </div>
        <button class="btn btn-sm btn-danger ms-auto" onclick="eliminarDelCarrito(${i})">
          <i class="bi bi-trash3"></i>
        </button>
      </div>
    `;
    contenedor.appendChild(item);
  });

  const subtotalElement = document.getElementById("subtotal");
  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toLocaleString()} COP`;

  const contador = document.getElementById("contador-carrito");
  if (contador) contador.textContent = carrito.length;
}

function eliminarDelCarrito(index) {
  const carrito = JSON.parse(localStorage.getItem("carritoAnmago")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carritoAnmago", JSON.stringify(carrito));
  actualizarCarrito();
}

function agregarAlCarrito(producto) {
  const carrito = JSON.parse(localStorage.getItem("carritoAnmago")) || [];
  carrito.push(producto);
  localStorage.setItem("carritoAnmago", JSON.stringify(carrito));
  actualizarCarrito();
}

function generarPedidoWhatsApp() {
  const carrito = JSON.parse(localStorage.getItem("carritoAnmago")) || [];
  if (carrito.length === 0) return alert("Tu carrito está vacío.");

  let mensaje = "🛍️ *¡Hola! Quiero realizar el siguiente pedido:*\n\n";

  carrito.forEach((p, i) => {
    mensaje += `*${i + 1}.* ${p.nombre}\n`;
    mensaje += `🖼️ Imagen: ${p.imagen}\n`;
    mensaje += p.promo
      ? `💲 Precio original: $${p.precioOriginal.toLocaleString("es-CO")}\n🔻 Descuento: 10%\n💰 Precio final: $${p.precioFinal.toLocaleString("es-CO")}\n\n`
      : `💲 Precio: $${p.precioFinal.toLocaleString("es-CO")}\n\n`;
  });

  const total = carrito.reduce((sum, p) => sum + parseFloat(p.precioFinal), 0);
  mensaje += `*🧾 Total del pedido:* $${total.toLocaleString("es-CO")}\n\n✅ *¡Gracias por tu atención!*`;

  window.open(`https://wa.me/573006498710?text=${encodeURIComponent(mensaje)}`, "_blank");
}
