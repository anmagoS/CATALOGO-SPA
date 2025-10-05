// === Cargar catálogo ===
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

// === Cargar accesos ===
async function cargarAccesosGlobal() {
  try {
    const url = "https://raw.githubusercontent.com/anmagoS/CATALOGO-SPA/main/accesos.json";
    const res = await fetch(url);
    const accesos = await res.json();
    window.accesosGlobal = accesos;
  } catch (err) {
    console.error("Error al cargar accesos:", err);
  }
}

// === Renderizar productos ===
function renderizarProductos(catalogo) {
  const contenedor = document.getElementById("contenido-productos");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  catalogo.forEach(p => {
    const tallas = p.tallas?.split(",").map(t => t.trim()) || [];
    const opciones = tallas.map(t => `<option value="${t}">${t}</option>`).join("");

    contenedor.insertAdjacentHTML("beforeend", `
      <div class="producto" data-id="${p.id}">
        <a href="producto.html?id=${p.id}" class="imagen-producto">
          <img src="${p.imagen}" alt="${p.producto}" />
        </a>
        <div class="nombre-producto">${p.producto}</div>
        <p class="precio-producto">$${p.precio.toLocaleString("es-CO")}</p>
        ${tallas.length ? `
          <label>Opción:</label>
          <select class="selector-talla form-select mb-2">
            ${opciones}
          </select>
        ` : ""}
        <button class="boton-comprar btn-cart"
          data-id="${p.id}"
          data-nombre="${p.producto}"
          data-imagen="${p.imagen}"
          data-precio="${p.precio}">
          Agregar al carrito
        </button>
      </div>
    `);
  });

  contenedor.querySelectorAll(".btn-cart").forEach(boton => {
    boton.addEventListener("click", e => {
      const btn = e.currentTarget;
      const card = btn.closest(".producto");
      const talla = card.querySelector(".selector-talla")?.value || "Sin talla";

      const producto = {
        id: btn.dataset.imagen + "-" + talla,
        nombre: btn.dataset.nombre,
        precio: Number(btn.dataset.precio) || 0,
        cantidad: 1,
        imagen: btn.dataset.imagen,
        talla: talla
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
      localStorage.setItem("carritoAnmago", JSON.stringify(articulosCarrito));
    });
  });
}

// === Renderizar menú lateral desde catálogo ===
function renderizarMenuLateral(catalogo) {
  const menu = document.getElementById("menu-categorias");
  if (!menu) return;

  const mapa = {};
  catalogo.forEach(p => {
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
}

// === Obtener parámetros desde URL ===
function getParametrosDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    tipo: params.get("tipo")?.trim(),
    subtipo: params.get("subtipo")?.trim(),
    categoria: params.get("categoria")?.trim()
  };
}

// === Inicialización ===
let articulosCarrito = [];

document.addEventListener("DOMContentLoaded", async () => {
  const { tipo, subtipo, categoria } = getParametrosDesdeURL();

  await cargarCatalogoGlobal();
  await cargarAccesosGlobal();

  renderizarMenuLateral(window.catalogoGlobal);

  const headerContainer = document.getElementById("header-container");
  if (!headerContainer.querySelector(".header")) {
    const header = await fetch("HEADER.HTML").then(res => res.text());
    headerContainer.insertAdjacentHTML("afterbegin", header);
  }

  const carritoGuardado = localStorage.getItem("carritoAnmago");
  if (carritoGuardado) {
    try {
      const datos = JSON.parse(carritoGuardado);
      const esValido = Array.isArray(datos) && datos.every(p =>
        typeof p.id === "string" &&
        typeof p.nombre === "string" &&
        typeof p.imagen === "string" &&
        typeof p.talla === "string" &&
        typeof p.precio === "number" &&
        typeof p.cantidad === "number"
      );
      articulosCarrito = esValido ? datos : [];
    } catch {
      articulosCarrito = [];
    }

    renderizarCarrito();
    actualizarSubtotal();
    actualizarContadorCarrito();
  }

  const toggle = document.getElementById("toggle-categorias");
  const menu = document.getElementById("menu-categorias");
  toggle?.addEventListener("click", () => {
    menu.style.display = menu.style.display === "none" ? "flex" : "none";
  });

  const footer = await fetch("footer.html").then(res => res.text());
  document.getElementById("footer-container").innerHTML = footer;

  // === Renderizado contextual por ruta ===
  if (document.getElementById("contenido-productos")) {
    const rutaActual = window.location.pathname;
    const accesosRuta = window.accesosGlobal?.filter(a => a.ruta === rutaActual) || [];
    const idsRuta = accesosRuta.map(a => a.id_producto);
    const productosFiltrados = window.catalogoGlobal.filter(p => idsRuta.includes(p.id));
    renderizarProductos(productosFiltrados.length ? productosFiltrados : window.catalogoGlobal);
  }
});
