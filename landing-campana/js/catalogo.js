const RUTA_EXCEL = "https://docs.google.com/spreadsheets/d/10_rQEbAjx7HA-NF7_L2kX5gQ1KoFoFNRAFEBCwn3jt8/export?format=xlsx";
const TELEFONO_WHATSAPP = "573504444527";

let productos = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
});

async function cargarProductos() {
  try {
    const respuesta = await fetch(RUTA_EXCEL);
    const data = await respuesta.arrayBuffer();

    const workbook = XLSX.read(data, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    productos = XLSX.utils.sheet_to_json(hoja);

    mostrarProductos(productos);
  } catch (error) {
    console.error("Error cargando catálogo:", error);
    document.getElementById("catalogo").innerHTML = `
      <p class="error">No se pudo cargar el catálogo.</p>
    `;
  }
}

function mostrarProductos(lista) {
  const contenedor = document.getElementById("catalogo");

  if (!contenedor) {
    console.error("No existe un contenedor con id='catalogo'");
    return;
  }

  contenedor.innerHTML = "";

  lista.forEach((producto, index) => {
    const categoria = producto.categoria || producto.Categoria || "";
    const nombre = producto.nombre || producto.Nombre || `Producto ${index + 1}`;
    const talla = producto.talla || producto.Talla || "";
    const precio = producto.precio || producto.Precio || "";
    const imagen = producto.imagen || producto.Imagen || "";

    const mensaje = `Hola, quiero información de este producto:%0A%0A${nombre}%0ACategoría: ${categoria}%0ATalla: ${talla}%0APrecio: $${precio}`;

    const card = document.createElement("div");
    card.classList.add("producto-card");

    card.innerHTML = `
      <img src="/lucifer/landing-campana/${imagen}"

      <div class="producto-info">
        <span class="producto-categoria">${categoria}</span>
        <h3>${nombre}</h3>
        <p><strong>Talla:</strong> ${talla}</p>
        <p class="producto-precio">$${precio}</p>

        <a 
          href="https://wa.me/${TELEFONO_WHATSAPP}?text=${mensaje}" 
          target="_blank" 
          class="btn-whatsapp">
          Pedir por WhatsApp
        </a>
      </div>
    `;

    contenedor.appendChild(card);
  });
}