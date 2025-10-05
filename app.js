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

// === Renderizar secciones inferiores ===
function renderizarTiposDesdeCatalogo(productos) {
  const contenedor = document.getElementById("seccion-tipos");
  if (!contenedor) return;

  const tiposUnicos = [...new Set(productos.map(p => p.tipo?.trim()).filter(Boolean))];

  tiposUnicos.forEach(tipo => {
    const productoRef = productos.find(p => p.tipo?.trim() === tipo);
    if (!productoRef) return;

    const tarjeta = document.createElement("div");
    tarjeta.className = "producto";
    tarjeta.innerHTML = `
      <a href="SUBTIPOS.HTML?tipo=${encodeURIComponent(tipo)}" class="imagen-producto">
        <img src="${productoRef.imagen}" alt="${tipo}">
      </a>
      <div class="nombre-producto">${tipo}</div>
      <a class="boton-comprar" href="SUBTIPOS.HTML?tipo=${encodeURIComponent(tipo)}">Ver Más</a>
    `;
    contenedor.appendChild(tarjeta);
  });
}

function renderizarSubtiposDesdeCatalogo(productos, tipoSeleccionado) {
  const contenedor = document.getElementById("seccion-subtipos");
  if (!contenedor || !tipoSeleccionado) return;

  const productosFiltrados = productos.filter(p => p.tipo?.trim() === tipoSeleccionado);
  const subtiposUnicos = [...new Set(productosFiltrados.map(p => p.subtipo?.trim()).filter(Boolean))];

  subtiposUnicos.forEach(subtipo => {
    const productoRef = productosFiltrados.find(p => p.subtipo?.trim() === subtipo);
    if (!productoRef) return;

    const tarjeta = document.createElement("div");
    tarjeta.className = "producto";
    tarjeta.innerHTML = `
      <a href="CATEGORIAS.HTML?tipo=${encodeURIComponent(tipoSeleccionado)}&subtipo=${encodeURIComponent(subtipo)}" class="imagen-producto">
        <img src="${productoRef.imagen}" alt="${subtipo}">
      </a>
      <div class="nombre-producto">${subtipo}</div>
      <a class="boton-comprar" href="CATEGORIAS.HTML?tipo=${encodeURIComponent(tipoSeleccionado)}&subtipo=${encodeURIComponent(subtipo)}">Ver categorías</a>
    `;
    contenedor.appendChild(tarjeta);
  });
}

function renderizarCategoriasDesdeCatalogo(productos, tipo, subtipo) {
  const contenedor = document.getElementById("seccion-categorias");
  if (!contenedor || !tipo || !subtipo) return;

  const productosFiltrados = productos.filter(p =>
    p.tipo?.trim() === tipo && p.subtipo?.trim() === subtipo
  );

  const categoriasUnicas = [...new Set(productosFiltrados.map(p => p.categoria?.trim()).filter(Boolean))];

  categoriasUnicas.forEach(categoria => {
    const productoRef = productosFiltrados.find(p => p.categoria?.trim() === categoria);
    if (!productoRef) return;

    const tarjeta = document.createElement("div");
    tarjeta.className = "producto";
    tarjeta.innerHTML = `
      <a href="PRODUCTOS.HTML?tipo=${encodeURIComponent(tipo)}&subtipo=${encodeURIComponent(subtipo)}&categoria=${encodeURIComponent(categoria)}" class="imagen-producto">
        <img src="${productoRef.imagen}" alt="${categoria}">
      </a>
      <div class="nombre-producto">${categoria}</div>
      <a class="boton-comprar" href="PRODUCTOS.HTML?tipo=${encodeURIComponent(tipo)}&subtipo=${encodeURIComponent(subtipo)}&categoria=${encodeURIComponent(categoria)}">Ver productos</a>
    `;
    contenedor.appendChild(tarjeta);
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
  await cargarCatalogoGlobal();
  renderCategorias(window.catalogoGlobal);
  await cargarAccesosGlobal();

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
