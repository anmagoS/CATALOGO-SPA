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

  contenedor.addEventListener("click", agregarAlCarrito);
}

// Agregar al carrito
function agregarAlCarrito(e) {
  const btn = e.target.closest(".btn-cart");
  if (!btn) return;

  const card = btn.closest(".producto");
  const talla = card.querySelector(".selector-talla")?.value || "Sin talla";

  const producto = {
    id: card.querySelector("img").alt + "-" + talla,
    nombre: card.querySelector(".nombre-producto").textContent,
    categoria: btn.dataset.categoria + " - " + btn.dataset.subcategoria,
    precio: parseFloat(card.querySelector(".precio-producto").textContent.replace(/[^\d]/g, "")),
    cantidad: 1,
    imagen: card.querySelector("img").src,
    talla
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
  carritoContainer.innerHTML = "";

  if (articulosCarrito.length === 0) {
    carritoContainer.innerHTML = "<p class='text-center'>El carrito está vacío.</p>";
    return;
  }

  articulosCarrito.forEach(p => {
    carritoContainer.insertAdjacentHTML("beforeend", `
      <div class="container mb-3">
        <div class="row align-items-center border-bottom py-2">
          <div class="col-3"><img class="img-fluid rounded" src="${p.imagen}" alt="${p.nombre}" /></div>
          <div class="col-6">
            <h6 class="mb-1">${p.nombre}</h6>
            <p class="mb-0">Categoría: ${p.categoria}</p>
          </div>
          <div class="col-3 text-end">
            <span class="fw-bold">${p.cantidad} × $${(p.precio * p.cantidad).toLocaleString("es-CO")}</span>
            <button class="btn btn-danger mt-2 btn-borrar" data-id="${p.id}"><i class="bi bi-trash3"></i></button>
          </div>
        </div>
      </div>
    `);
  });

  document.querySelectorAll(".btn-borrar").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.closest("button").dataset.id;
      articulosCarrito = articulosCarrito
        .map(p => p.id === id ? (p.cantidad > 1 ? { ...p, cantidad: p.cantidad - 1 } : null) : p)
        .filter(p => p !== null);

      renderizarCarrito();
      actualizarSubtotal();
      actualizarContadorCarrito();
    });
  });
}

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

  const header = await fetch("HEADER.HTML").then(res => res.text());
  document.getElementById("header-container").insertAdjacentHTML("afterbegin", header);

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

  // Construcción jerárquica por tipo → subtipo → categoría
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
