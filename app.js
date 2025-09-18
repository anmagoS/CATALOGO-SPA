// Variables globales
let articulosCarrito = [];
const carritoContainer = document.getElementById("carrito-contenido");
const offcanvas = document.querySelector(".offcanvas");
const btn_shopping = document.querySelector(".btn_shopping");
const subtotalElement = document.getElementById("subtotal");
const contadorCarrito = document.querySelector("#contador-carrito");
const closeButton = document.querySelector(".btn-close");
const btnWhatsApp = document.querySelector("button[onclick='generarPedidoWhatsApp()']);

// Cargar catálogo global para buscador y productos
async function cargarCatalogoGlobal() {
  try {
    const url = "https://raw.githubusercontent.com/anmagoS/CATALOGO-SPA/main/catalogo.json";
    const respuesta = await fetch(url);
    const productos = await respuesta.json();
    window.catalogoGlobal = productos;
  } catch (err) {
    console.error("Error al cargar el catálogo:", err);
  }
}

// Activar buscador inteligente
function activarBuscador() {
  const buscador = document.getElementById("buscador");
  const sugerencias = document.getElementById("sugerencias");

  if (!buscador || !sugerencias || !window.catalogoGlobal) return;

  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase().trim();
    sugerencias.innerHTML = "";

    if (texto.length < 2) return;

    const coincidencias = window.catalogoGlobal.filter(p => {
      const normalizar = str => str?.toString().toLowerCase().trim();
      return (
        normalizar(p.producto).includes(texto) ||
        normalizar(p.tipo).includes(texto) ||
        normalizar(p.subtipo).includes(texto) ||
        normalizar(p.categoria).includes(texto) ||
        normalizar(p.material).includes(texto) ||
        normalizar(p.precio).includes(texto)
      );
    });

    coincidencias.slice(0, 6).forEach(p => {
      const item = document.createElement("a");
      item.className = "dropdown-item d-flex align-items-center gap-2";
      item.href = `producto.html?id=${p.id}`;
      item.innerHTML = `
        <img src="${p.imagen}" alt="${p.producto}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
        <span>${p.producto} <small class="text-muted">(${p.tipo} > ${p.subtipo})</small></span>
      `;
      sugerencias.appendChild(item);
    });

    sugerencias.classList.add("show");
  });

  document.addEventListener("click", () => {
    sugerencias.classList.remove("show");
  });
}

// Render dinámico de productos (si aplica)
function renderizarProductos(catalogo) {
  const contenedor = document.getElementById("contenido-productos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  catalogo.forEach(producto => {
    const tallas = producto.tallas.split(",").map(t => t.trim());
    const opcionesTalla = tallas.map(t => `<option value="${t}">${t}</option>`).join("");

    const productoHTML = `
      <div class="producto card mb-3" data-id="${producto.id}">
        <img src="${producto.imagen}" alt="${producto.id}" class="card-img-top" />
        <div class="card-body">
          <h5 class="nombre-producto">${producto.producto}</h5>
          <p class="precio-producto">$${producto.precio.toLocaleString("es-CO")}</p>
          <label for="talla-${producto.id}">Talla:</label>
          <select class="selector-talla form-select mb-2" id="talla-${producto.id}">
            ${opcionesTalla}
          </select>
          <button class="btn btn-primary btn-cart"
            data-categoria="${producto.categoria}"
            data-subcategoria="${producto.subcategoria}">
            Agregar al carrito
          </button>
        </div>
      </div>
    `;
    contenedor.insertAdjacentHTML("beforeend", productoHTML);
  });

  contenedor.addEventListener("click", agregarAlCarrito);
}

// Función para agregar al carrito
function agregarAlCarrito(e) {
  const btn = e.target.closest(".btn-cart");
  if (!btn) return;

  const card = btn.closest(".producto");
  const selectorTalla = card.querySelector(".selector-talla");
  const tallaSeleccionada = selectorTalla ? selectorTalla.value : "Sin talla";

  const producto = {
    id: card.querySelector("img").alt + "-" + tallaSeleccionada,
    nombre: card.querySelector(".nombre-producto").textContent,
    categoria: btn.dataset.categoria + " - " + btn.dataset.subcategoria,
    precio: parseFloat(card.querySelector(".precio-producto").textContent.replace(/[^\d.]/g, "")),
    cantidad: 1,
    imagen: card.querySelector("img").src,
    talla: tallaSeleccionada
  };

  const existe = articulosCarrito.find(item => item.id === producto.id);
  if (existe) {
    existe.cantidad++;
  } else {
    articulosCarrito.push(producto);
  }

  guardarCarrito();
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
}

// Función para renderizar el carrito
function renderizarCarrito() {
  carritoContainer.innerHTML = "";

  if (articulosCarrito.length === 0) {
    carritoContainer.innerHTML = "<p class='text-center'>El carrito está vacío.</p>";
    return;
  }

  articulosCarrito.forEach(producto => {
    const itemHTML = `
      <div class="container mb-3">
        <div class="row align-items-center border-bottom py-2">
          <div class="col-3">
            <img class="img-fluid rounded" src="${producto.imagen}" alt="${producto.nombre}" />
          </div>
          <div class="col-6">
            <h6 class="mb-1 title-product">${producto.nombre}</h6>
            <p class="mb-0 detalles-product">Categoría: ${producto.categoria}</p>
          </div>
          <div class="col-3 text-end">
            <span class="fw-bold">
              ${producto.cantidad} × <span class="fs-5 precio">$${(producto.precio * producto.cantidad).toLocaleString("es-CO")}</span>
            </span>
            <button class="btn btn-danger mt-2 btn-borrar" data-id="${producto.id}">
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

// Función para eliminar productos del carrito
function agregarEventosBorrar() {
  document.querySelectorAll(".btn-borrar").forEach(boton => {
    boton.addEventListener("click", e => {
      const productoId = e.target.closest("button").dataset.id;
      articulosCarrito = articulosCarrito
        .map(p => (p.id === productoId ? (p.cantidad > 1 ? { ...p, cantidad: p.cantidad - 1 } : null) : p))
        .filter(p => p !== null);

      guardarCarrito();
      renderizarCarrito();
      actualizarSubtotal();
      actualizarContadorCarrito();
      actualizarEstadoBotonWhatsApp();
    });
  });
}

// Subtotal
function actualizarSubtotal() {
  const subtotal = articulosCarrito.reduce((total, p) => total + p.precio * p.cantidad, 0);
  const opciones = {
    minimumFractionDigits: subtotal % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  };
  subtotalElement.textContent = `$${subtotal.toLocaleString("es-CO", opciones)}`;
}

// Contador
function actualizarContadorCarrito() {
  contadorCarrito.textContent = articulosCarrito.length;
}

// WhatsApp
function generarPedidoWhatsApp() {
  if (articulosCarrito.length === 0) return alert("Tu carrito está vacío.");

  let mensaje = "🛍️ *¡Hola! Quiero realizar el siguiente pedido:*\n\n";
  articulosCarrito.forEach((p, i) => {
    mensaje += `*${i + 1}.* ${p.nombre}\n🔗 Imagen: ${p.imagen}\n💲 Precio: $${p.precio.toLocaleString("es-CO")}\n\n`;
  });

  const total = articulosCarrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  mensaje += `*🧾 Total del pedido:* $${total.toLocaleString("es-CO")}\n\n`;
  mensaje += "✅ *¡Gracias por tu atención!*";

   const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/573006498710?text=${mensajeCodificado}`;
  window.open(urlWhatsApp, "_blank");

  // Limpiar el carrito después de enviar
  articulosCarrito = [];
  guardarCarrito();
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
}
// Restaurar carrito desde localStorage
function cargarCarritoDesdeStorage() {
  const guardado = JSON.parse(localStorage.getItem("carritoAnmago")) || [];
  articulosCarrito = guardado;
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
}

// Inicialización global
document.addEventListener("DOMContentLoaded", async () => {
  await cargarCatalogoGlobal();

  // 1. Cargar HEADER y esperar a que se inserte en el DOM
  const header = await fetch("HEADER.HTML").then(res => res.text());
  document.getElementById("header-container").innerHTML = header;

  // 2. Activar buscador solo cuando el header ya está en el DOM
  if (typeof activarBuscador === "function") {
    activarBuscador();
  }

  // 3. Cargar FOOTER
  const footer = await fetch("footer.html").then(res => res.text());
  document.getElementById("footer-container").innerHTML = footer;

  // 4. Ajustar carrito y restaurar estado
  ajustarCarrito();
  cargarCarritoDesdeStorage();

  // 5. Renderizar productos si aplica
  if (document.getElementById("contenido-productos")) {
    renderizarProductos(window.catalogoGlobal);
  }
});
