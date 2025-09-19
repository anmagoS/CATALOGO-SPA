// === CARRITO ANMAGO STORE ===

// Inicializar carrito desde localStorage
let articulosCarrito = JSON.parse(localStorage.getItem("carritoAnmago")) || [];

// Elementos clave
const carritoContainer = document.getElementById("carrito-contenido");
const offcanvasCarrito = document.getElementById("offcanvasCarrito");
const btn_shopping = document.querySelector(".btn_shopping");
const subtotalElement = document.getElementById("subtotal");
const contadorCarrito = document.getElementById("contador-carrito");
const closeButton = document.querySelector(".btn-close");
const btnWhatsApp = document.querySelector("button[onclick='generarPedidoWhatsApp()']");

// === FUNCIONES ===

// Agregar producto al carrito (sin agrupar)
function agregarAlCarrito(producto) {
  articulosCarrito.push(producto);
  guardarCarrito();
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
  abrirCarrito();
}

// Renderizar productos en el carrito
function renderizarCarrito() {
  carritoContainer.innerHTML = "";

  if (articulosCarrito.length === 0) {
    carritoContainer.innerHTML = "<p class='text-center'>El carrito está vacío.</p>";
    return;
  }

  articulosCarrito.forEach((producto, index) => {
    const itemHTML = `
      <div class="container mb-3">
        <div class="row align-items-center border-bottom py-2">
          <div class="col-3">
            <img class="img-fluid rounded" src="${producto.imagen}" alt="${producto.nombre}" />
          </div>
          <div class="col-6">
            <h6 class="mb-1 title-product">${producto.nombre}</h6>
            <p class="mb-0 detalles-product">Talla: ${producto.talla || "No especificada"}</p>
            <p class="mb-0 detalles-product">Precio: $${producto.precio.toLocaleString("es-CO")}</p>
          </div>
          <div class="col-3 text-end">
            <button class="boton-eliminar" data-index="${index}">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    carritoContainer.insertAdjacentHTML("beforeend", itemHTML);
  });

  agregarEventosBorrar();
}

// Eliminar producto por índice
function agregarEventosBorrar() {
  const botonesBorrar = document.querySelectorAll(".boton-eliminar");
  botonesBorrar.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const index = parseInt(e.target.closest("button").dataset.index);
      articulosCarrito.splice(index, 1);
      guardarCarrito();
      renderizarCarrito();
      actualizarSubtotal();
      actualizarContadorCarrito();
      actualizarEstadoBotonWhatsApp();
    });
  });
}

// Calcular subtotal
function actualizarSubtotal() {
  const subtotal = articulosCarrito.reduce((total, producto) => total + producto.precio, 0);
  const opciones = {
    minimumFractionDigits: subtotal % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  };
  subtotalElement.textContent = `$${subtotal.toLocaleString("es-CO", opciones)}`;
}

// Contador de productos
function actualizarContadorCarrito() {
  contadorCarrito.textContent = articulosCarrito.length;
}

// Generar mensaje de WhatsApp
function generarPedidoWhatsApp() {
  if (articulosCarrito.length === 0) return alert("Tu carrito está vacío.");

  let mensaje = "🛍️ *¡Hola! Quiero realizar el siguiente pedido:*\n\n";

  articulosCarrito.forEach((producto, index) => {
    mensaje += `*${index + 1}.* ${producto.nombre}\n`;
    mensaje += `🖼️ Imagen: ${producto.imagen}\n`;
    mensaje += `📏 Talla: ${producto.talla || "No especificada"}\n`;
    mensaje += `💲 Precio: $${producto.precio.toLocaleString("es-CO")}\n\n`;
  });

  const total = articulosCarrito.reduce((acc, p) => acc + p.precio, 0);
  mensaje += `*🧾 Total del pedido:* $${total.toLocaleString("es-CO")}\n\n✅ *¡Gracias por tu atención!*`;

  const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/573006498710?text=${mensajeCodificado}`;
  window.open(urlWhatsApp, "_blank");

  articulosCarrito = [];
  guardarCarrito();
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
}

// Abrir carrito
function abrirCarrito() {
  offcanvasCarrito.classList.add("show");
}

// Cerrar carrito
function cerrarCarrito() {
  offcanvasCarrito.classList.remove("show");
}

// Activar/desactivar botón de WhatsApp
function actualizarEstadoBotonWhatsApp() {
  btnWhatsApp.disabled = articulosCarrito.length === 0;
}

// Guardar en localStorage
function guardarCarrito() {
  localStorage.setItem("carritoAnmago", JSON.stringify(articulosCarrito));
}

// === EVENTOS ===
btn_shopping?.addEventListener("click", () => {
  offcanvasCarrito.classList.toggle("show");
  btn_shopping.classList.toggle("balanceo");
});

closeButton?.addEventListener("click", () => cerrarCarrito());

// === INICIALIZACIÓN ===
document.addEventListener("DOMContentLoaded", () => {
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
});

