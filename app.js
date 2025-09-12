// Variables
let articulosCarrito = []; // Array para almacenar los productos agregados al carrito
const carritoContainer = document.getElementById("carrito-contenido"); // Corregido
const offcanvas = document.querySelector(".offcanvas"); // Elemento del carrito (offcanvas)
const btn_shopping = document.querySelector(".btn_shopping"); // Botón para mostrar el carrito
const subtotalElement = document.getElementById("subtotal"); // Seleccionar el elemento del subtotal para mostrar el total
const contadorCarrito = document.querySelector("#contador-carrito"); // Elemento que muestra el número de productos en el carrito
const closeButton = document.querySelector(".btn-close"); // Botón para cerrar el carrito
// Espera a que el DOM se cargue, agrega un evento de click para añadir al carrito y renderiza el carrito.
document.addEventListener("DOMContentLoaded", () => {
  fetch("catalogo.json")
    .then(res => res.json())
    .then(data => {
      renderizarProductos(data); // Nuevo render dinámico
      renderizarCarrito();
      actualizarContadorCarrito();
    })
    .catch(err => console.error("Error al cargar el catálogo:", err));
});
function renderizarProductos(catalogo) {
  const contenedor = document.getElementById("contenido-productos");
  contenedor.innerHTML = "";

  catalogo.forEach(producto => {
    const tallas = producto.tallas.split(",").map(t => t.trim());
    const opcionesTalla = tallas.map(t => `<option value="${t}">${t}</option>`).join("");

    const productoHTML = `
      <div class="producto card mb-3" data-id="${producto.id}">
        <img src="${producto.imagen}" alt="${producto.id}" class="card-img-top" />
        <div class="card-body">
          <h5 class="nombre-producto">${producto.nombre}</h5>
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

  // Activar eventos de agregar al carrito
  contenedor.addEventListener("click", agregarAlCarrito);
}
// Función para agregar al carrito
function agregarAlCarrito(e) {
  // Asegurarse de que el clic proviene de un botón con la clase 'btn-cart'
  const btn = e.target.closest(".btn-cart");
  if (btn) {
    // Muestra el offcanvas y aplica un efecto visual al botón del carrito
    if (!localStorage.getItem("carritoMostrado")) {
      offcanvas.classList.add("show");
      localStorage.setItem("carritoMostrado", "true");
    }
    // El carrito no se abre automáticamente después de la primera vez
    // Se obtiene el card relacionado con el botón para extraer la información del producto
    const card = btn.closest(".producto");
   const selectorTalla = card.querySelector(".selector-talla");
const tallaSeleccionada = selectorTalla ? selectorTalla.value : "Sin talla";

const producto = {
  id: card.querySelector("img").alt + "-" + tallaSeleccionada, // ID único por talla
  nombre: card.querySelector(".nombre-producto").textContent,
  categoria: btn.dataset.categoria + " - " + btn.dataset.subcategoria,
  precio: parseFloat(card.querySelector(".precio-producto").textContent.replace(/[^\d.]/g, "")),
  cantidad: 1,
  imagen: card.querySelector("img").src,
  talla: tallaSeleccionada
};
      nombre: card.querySelector(".nombre-producto").textContent, // Nombre del producto
      categoria: btn.dataset.categoria + " - " + btn.dataset.subcategoria, // Categoría del producto
      precio: parseFloat(card.querySelector(".precio-producto").textContent.replace(/[^\d.]/g, "")), // Precio del producto (sin el símbolo $)
      cantidad: 1, // Siempre lo agregamos con cantidad 1
      imagen: card.querySelector("img").src, // Imagen del producto
    };
    // Verificar si el producto ya existe en el carrito
    const existe = articulosCarrito.find((item) => item.id === producto.id);
    if (existe) {
      // Si el producto ya está en el carrito, solo incrementamos su cantidad
      existe.cantidad++;
    } else {
      // Si el producto no está, lo agregamos al carrito
      articulosCarrito.push(producto);
    }
    guardarCarrito();
    // Renderizar el carrito actualizado
    renderizarCarrito();
    // Actualizar el subtotal del carrito
    actualizarSubtotal();
    // Actualizar el contador de productos en el carrito
    actualizarContadorCarrito();

    actualizarEstadoBotonWhatsApp(); // Actualizar el estado del botón de WhatsApp
  }
}
// Función para renderizar el carrito
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
    // Insertar el HTML del producto en el contenedor del carrito
    carritoContainer.insertAdjacentHTML("beforeend", itemHTML);
  });
  // Agregar eventos de eliminación de producto
  agregarEventosBorrar();
}
// Función para eliminar un producto del carrito
function agregarEventosBorrar() {
  // Obtener todos los botones de eliminar del carrito
  const botonesBorrar = document.querySelectorAll(".btn-borrar");

  botonesBorrar.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      // Obtener el id del producto a eliminar desde el atributo data-id del botón
      const productoId = e.target.closest("button").dataset.id;

      // Actualizar el carrito, disminuyendo la cantidad o eliminando el producto si la cantidad es 1
      articulosCarrito = articulosCarrito
        .map((producto) => {
          if (producto.id === productoId) {
            if (producto.cantidad > 1) {
              producto.cantidad--; // Disminuir la cantidad si es mayor a 1
              return producto; // Retornar el producto actualizado
            }
            return null; // Eliminar el producto si la cantidad es 1
          }
          return producto; // Dejar los demás productos sin cambios
        })
        .filter((producto) => producto !== null); // Filtrar los productos eliminados

      // Volver a renderizar el carrito con los cambios
      renderizarCarrito();
      // Actualizar el subtotal del carrito
      actualizarSubtotal();
      // Actualizar el contador de productos en el carrito
      actualizarContadorCarrito();

      actualizarEstadoBotonWhatsApp(); // Actualizar el estado del botón de WhatsApp
    });
  });
}
// Función para calcular y actualizar el subtotal
function actualizarSubtotal() {
  const subtotal = articulosCarrito.reduce((total, producto) => {
    return total + producto.precio * producto.cantidad;
  }, 0);

  // Formatear el subtotal con separador de miles y decimales solo si son necesarios
  const opciones = {
    minimumFractionDigits: subtotal % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  };

  const subtotalFormateado = subtotal.toLocaleString("es-CO", opciones);

  subtotalElement.textContent = `$${subtotalFormateado}`;
}

// Función para actualizar el contador de productos en el carrito
function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  const carrito = JSON.parse(localStorage.getItem("carritoAnmago")) || [];
  contador.textContent = carrito.length;
}

// Función para generar y enviar un pedido a través de WhatsApp
function generarPedidoWhatsApp() {
  if (articulosCarrito.length === 0) return alert("Tu carrito está vacío.");

  let mensaje = "🛍️ *¡Hola! Quiero realizar el siguiente pedido:*\n\n";

  articulosCarrito.forEach((producto, index) => {
    mensaje += `*${index + 1}.* ${producto.nombre}\n`;
    mensaje += `🔗 Imagen: ${producto.imagen}\n`; // No codifiques la URL aquí
    mensaje += `💲 Precio: $${producto.precio.toLocaleString("es-CO")}\n\n`;
  });

  const total = articulosCarrito.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
  mensaje += `*🧾 Total del pedido:* $${total.toLocaleString("es-CO")}\n\n`;
  mensaje += "✅ *¡Gracias por tu atención!*";

  // Solo codifica el mensaje final, NO las URLs internas
  const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/573006498710?text=${mensajeCodificado}`;
  window.open(urlWhatsApp, "_blank");

  // Limpiar carrito después de enviar
  articulosCarrito = [];
  guardarCarrito();
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
}
// Función para mostrar/ocultar el carrito con animación
function toggleOffcanvas(show) {
  // Añadir transiciones para el efecto visual de apertura/cierre
  offcanvas.style.transition = "transform 0.6s ease, opacity 0.6s ease";

  // Mostrar el carrito si 'show' es true, ocultarlo si es false
  if (show) {
    offcanvas.classList.add("show");
  } else {
    offcanvas.classList.remove("show");
    offcanvas.classList.add("hiding");
    // Eliminar la clase 'hiding' después de la animación
    setTimeout(() => offcanvas.classList.remove("hiding"), 600);
  }
}

// Evento para mostrar/ocultar el carrito al hacer clic en el botón de compra
btn_shopping.addEventListener("click", () => {
  toggleOffcanvas(!offcanvas.classList.contains("show"));
  // Añadir una animación de balanceo al botón
  btn_shopping.classList.toggle("balanceo");
});

// Evento para cerrar el carrito al hacer clic en el botón de cerrar
closeButton.addEventListener("click", () => toggleOffcanvas(false));

// Deshabilitar el botón si el carrito está vacío
const btnWhatsApp = document.querySelector("button[onclick='generarPedidoWhatsApp()']");

function actualizarEstadoBotonWhatsApp() {
  if (articulosCarrito.length === 0) {
    btnWhatsApp.disabled = true; // Deshabilitar el botón si el carrito está vacío
  } else {
    btnWhatsApp.disabled = false; // Habilitar el botón si hay productos en el carrito
  }
}

// Llamar a la función para actualizar el estado del botón cada vez que se actualice el carrito
actualizarEstadoBotonWhatsApp();

// Función para guardar el carrito en el almacenamiento local
function guardarCarrito() {
  localStorage.setItem("carritoAnmago", JSON.stringify(articulosCarrito));
}

// Función para actualizar el carrito
function actualizarCarrito() {
  const contenedor = document.getElementById("carrito-contenido");
  const carrito = JSON.parse(localStorage.getItem("carritoAnmago")) || [];
  contenedor.innerHTML = "";
  carrito.forEach((p, i) => {
    // ...renderiza cada producto...
  });
  localStorage.setItem("carritoAnmago", JSON.stringify(carrito));
  actualizarContadorCarrito();
  actualizarCarrito();
}
