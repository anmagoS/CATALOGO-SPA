let articulosCarrito = [];
const carritoContainer = document.getElementById("carrito-contenido");
const subtotalElement = document.getElementById("subtotal");
const contadorCarrito = document.getElementById("contador-carrito");

// Cargar catálogo
async function cargarCatalogoGlobal() {
  try {
    const url = "https://raw.githubusercontent.com/anmagoS/CATALOGO-SPA/main/catalogo.json";
    const res = await fetch(url);
    const productos = await res.json();
    window.catalogoGlobal = productos;
  } catch (err) {
    console.error("Error al cargar catálogo:", err);
  }
}

// Renderizar productos
function renderizarProductos(catalogo) {
  const contenedor = document.getElementById("contenido-productos");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  catalogo.forEach(p => {
    const tallas = p.tallas?.split(",").map(t => t.trim()) || [];
    const opciones = tallas.map(t => `<option value="${t}">${t}</option>`).join("");

    contenedor.insertAdjacentHTML("beforeend", `
      <div class="producto card mb-3" data-id="${p.id}">
        <img src="${p.imagen}" alt="${p.id}" class="card-img-top" />
        <div class="card-body">
          <h5 class="nombre-producto">${p.producto}</h5>
          <p class="precio-producto">$${p.precio.toLocaleString("es-CO")}</p>
          <label>Talla:</label>
          <select class="selector-talla form-select mb-2">${opciones}</select>
          <button class="btn btn-primary btn-cart"
            data-categoria="${p.categoria}"
            data-subcategoria="${p.subcategoria}"
            data-tipo="${p.tipo}">
            Agregar al carrito
          </button>
        </div>
      </div>
    `);
  });

  contenedor.querySelectorAll(".btn-cart").forEach(boton => {
    boton.addEventListener("click", agregarAlCarrito);
  });
}

// Agregar al carrito
function agregarAlCarrito(e) {
  const btn = e.target.closest(".btn-cart");
  if (!btn) return;

  const producto = {
    id: btn.dataset.id + "-" + btn.dataset.variante + "-" + btn.dataset.talla,
    nombre: btn.dataset.nombre,
    categoria: btn.dataset.categoria + " - " + btn.dataset.subcategoria,
    precio: parseFloat(btn.dataset.precio),
    cantidad: 1,
    imagen: btn.dataset.imagen,
    talla: btn.dataset.talla
  };

  const existe = articulosCarrito.find(p => p.id === producto.id);
  if (existe) {
    existe.cantidad++;
  } else {
    articulosCarrito.push(producto);
  }

  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
}


// Renderizar carrito
function renderizarCarrito() {
  // Limpiar contenido previo del carrito
  carritoContainer.innerHTML = "";

  // Si el carrito está vacío, mostrar un mensaje
  if (articulosCarrito.length === 0) {
    carritoContainer.innerHTML = "<p class='text-center'>El carrito está vacío.</p>";
  }

  // Iterar sobre los productos en el carrito y renderizarlos
  articulosCarrito.forEach((producto) => {
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
            <!-- Mostrar cantidad y precio total del producto -->
            <span class="fw-bold"><span class="fs-6 color-gris">${
              producto.cantidad
            }<span class="fs-5 precio">$${(producto.precio * producto.cantidad).toLocaleString("es-CO")}</span>
            </span>

            <!-- Botón para eliminar el producto del carrito -->
            <button class="btn btn-danger mt-2 btn-borrar" data-id="${
              producto.id
            }"><i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    `;


// Subtotal y contador
function actualizarSubtotal() {
  const total = articulosCarrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  subtotalElement.textContent = `$${total.toLocaleString("es-CO")}`;
}

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
  mensaje += `*🧾 Total del pedido:* $${total.toLocaleString("es-CO")}\n\n✅ *¡Gracias por tu atención!*`;

  const url = `https://wa.me/573006498710?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");

  articulosCarrito = [];
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
}

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  await cargarCatalogoGlobal();

  const headerContainer = document.getElementById("header-container");
  if (!headerContainer.querySelector(".header")) {
    const header = await fetch("HEADER.HTML").then(res => res.text());
    headerContainer.insertAdjacentHTML("afterbegin", header);
  }

  const esperarElemento = id => new Promise(resolve => {
    const intervalo = setInterval(() => {
      const el = document.getElementById(id);
      if (el) {
        clearInterval(intervalo);
        resolve(el);
      }
    }, 50);
  });

  const toggle = await esperarElemento("toggle-categorias");
  const menu = await esperarElemento("menu-categorias");

  toggle.addEventListener("click", () => {
    menu.style.display = menu.style.display === "none" ? "flex" : "none";
  });

  const mapa = {};
  window.catalogoGlobal.forEach(p => {
    if (!p.tipo || !p.subtipo || !p.categoria) return;
    if (!mapa[p.tipo]) mapa[p.tipo] = {};
    if (!mapa[p.tipo][p.subtipo]) mapa[p.tipo][p.subtipo] = new Set();
    mapa[p.tipo][p.subtipo].add(p.categoria);
  });

  Object.entries(mapa).forEach(([tipo, subtipos]) => {
    const bloqueTipo = document.createElement("details");
    bloqueTipo.innerHTML = `<summary class="fw-bold">${tipo}</summary>`;

    Object.entries(subtipos).forEach(([subtipo, categorias]) => {
      const bloqueSubtipo = document.createElement("details");
      bloqueSubtipo.innerHTML = `<summary>${subtipo}</summary>`;

      categorias.forEach(categoria => {
        const link = document.createElement("a");
        link.className = "nav-link ps-3";
        link.textContent = categoria;
        link.href = `PRODUCTOS.HTML?tipo=${encodeURIComponent(tipo)}&subtipo=${encodeURIComponent(subtipo)}&categoria=${encodeURIComponent(categoria)}`;
        bloqueSubtipo.appendChild(link);
      });

      bloqueTipo.appendChild(bloqueSubtipo);
    });

    menu.appendChild(bloqueTipo);
  });

  const footer = await fetch("footer.html").then(res => res.text());
  document.getElementById("footer-container").innerHTML = footer;

  if (document.getElementById("contenido-productos")) {
    renderizarProductos(window.catalogoGlobal);
  }
});
