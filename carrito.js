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
