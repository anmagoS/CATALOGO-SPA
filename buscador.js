export async function activarBuscadorGlobal() {
  // Cargar catálogo si no está disponible
  if (!window.catalogoGlobal) {
    const url = "https://raw.githubusercontent.com/anmagoS/CATALOGO-SPA/main/catalogo.json";
    const respuesta = await fetch(url);
    window.catalogoGlobal = await respuesta.json();
  }

  const buscador = document.getElementById("buscador");
  const sugerencias = document.getElementById("sugerencias");
  if (!buscador || !sugerencias) return;

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
