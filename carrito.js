// === CARRITO ANMAGO STORE ===

// Inicializar carrito desde localStorage
let articulosCarrito = JSON.parse(localStorage.getItem("carritoAnmago")) || [];

// Elementos clave
const carritoContainer = document.getElementById("carrito-contenido");
const offcanvas = document.querySelector(".offcanvas");
const btn_shopping = document.querySelector(".btn_shopping");
const subtotalElement = document.getElementById("subtotal");
const contadorCarrito = document.getElementById("contador-carrito");
const closeButton = document.querySelector(".btn-close");
const btnWhatsApp = document.querySelector("button[onclick='generarPedidoWhatsApp()']");

// === FUNCIONES PRINCIPALES ===

function agregarAlCarrito(producto) {
  const existe = articulosCarrito.find((item) => item.id === producto.id && item.talla === producto.talla);
  if (existe) {
    existe.cantidad++;
  } else {
    producto.cantidad = 1;
    articulosCarrito.push(producto);
  }
  guardarCarrito();
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
  toggleOffcanvas(true);
}

function renderizarCarrito() {
  carritoContainer.innerHTML = "";

  if (articulosCarrito.length === 0) {
    carritoContainer.innerHTML = "<p class='text-center'>El carrito está vacío.</p>";
    return;
  }

  articulosCarrito.forEach((producto) => {
    const itemHTML = `
      <div class="container mb-3">
        <div class="row align-items-center border-bottom py-2">
          <div class="col-3">
            <img class="img-fluid rounded" src="${producto.imagen}" alt="${producto.nombre}" />
          </div>
          <div class="col-6">
            <h6 class="mb-1 title-product">${producto.nombre}</h6>
            <p class="mb-0 detalles-product">Talla: ${producto.talla || "No especificada"}</p>
          </div>
          <div class="col-3 text-end">
            <span class="fw-bold">
              <span class="fs-6 color-gris">${producto.cantidad}</span>
              <span class="fs-5 precio">$${(producto.precio * producto.cantidad).toLocaleString("es-CO")}</span>
            </span>
            <button class="btn btn-danger mt-2 btn-borrar" data-id="${producto.id}" data-talla="${producto.talla}">
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

function agregarEventosBorrar() {
  const botonesBorrar = document.querySelectorAll(".btn-borrar");
  botonesBorrar.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const productoId = e.target.closest("button").dataset.id;
      const talla = e.target.closest("button").dataset.talla;

      articulosCarrito = articulosCarrito
        .map((producto) => {
          if (producto.id === productoId && producto.talla === talla) {
            if (producto.cantidad > 1) {
              producto.cantidad--;
              return producto;
            }
            return null;
          }
          return producto;
        })
        .filter((producto) => producto !== null);

      guardarCarrito();
      renderizarCarrito();
      actualizarSubtotal();
      actualizarContadorCarrito();
      actualizarEstadoBotonWhatsApp();
    });
  });
}

function actualizarSubtotal() {
  const subtotal = articulosCarrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
  const opciones = {
    minimumFractionDigits: subtotal % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  };
  subtotalElement.textContent = `$${subtotal.toLocaleString("es-CO", opciones)}`;
}

function actualizarContadorCarrito() {
  contadorCarrito.textContent = articulosCarrito.length;
}

function generarPedidoWhatsApp() {
  if (articulosCarrito.length === 0) return alert("Tu carrito está vacío.");

  let mensaje = "🛍️ *¡Hola! Quiero realizar el siguiente pedido:*\n\n";

  articulosCarrito.forEach((producto, index) => {
    mensaje += `*${index + 1}.* ${producto.nombre}\n`;
    mensaje += `🖼️ Imagen: ${producto.imagen}\n`;
    mensaje += `📏 Talla: ${producto.talla || "No especificada"}\n`;
    mensaje += `💲 Precio: $${producto.precio.toLocaleString("es-CO")}\n\n`;
  });

  const total = articulosCarrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
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

function toggleOffcanvas(show) {
  offcanvas.style.transition = "transform 0.6s ease, opacity 0.6s ease";
  if (show) {
    offcanvas.classList.add("show");
  } else {
    offcanvas.classList.remove("show");
    offcanvas.classList.add("hiding");
    setTimeout(() => offcanvas.classList.remove("hiding"), 600);
  }
}

function actualizarEstadoBotonWhatsApp() {
  btnWhatsApp.disabled = articulosCarrito.length === 0;
}

function guardarCarrito() {
  localStorage.setItem("carritoAnmago", JSON.stringify(articulosCarrito));
}

// === EVENTOS ===
btn_shopping?.addEventListener("click", () => {
  toggleOffcanvas(!offcanvas.classList.contains("show"));
  btn_shopping.classList.toggle("balanceo");
});

closeButton?.addEventListener("click", () => toggleOffcanvas(false));

// === INICIALIZACIÓN ===
document.addEventListener("DOMContentLoaded", () => {
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
});
