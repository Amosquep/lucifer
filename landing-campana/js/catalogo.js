const RUTA_EXCEL = "https://docs.google.com/spreadsheets/d/10_rQEbAjx7HA-NF7_L2kX5gQ1KoFoFNRAFEBCwn3jt8/export?format=xlsx";
const TELEFONO_WHATSAPP = "573504444527";

let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarCarrito();

  const btnCarrito = document.getElementById("btn-carrito");
  const overlay = document.getElementById("overlay-carrito");

  if (btnCarrito) {
    btnCarrito.addEventListener("click", (e) => {
      e.preventDefault();
      abrirCarrito();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", cerrarCarrito);
  }
});

async function cargarProductos() {
  const contenedor = document.getElementById("catalogo");

  try {
    const respuesta = await fetch(RUTA_EXCEL);
    const data = await respuesta.arrayBuffer();

    const workbook = XLSX.read(data, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    productos = XLSX.utils.sheet_to_json(hoja);

    productos.sort((a, b) => {

      const orden = {
        "Lencería": 1,
        "Lenceria": 1,
        "Pijamas": 2,
        "Mallas": 3
      };

      const categoriaA = a.categoria || a.Categoria || "";
      const categoriaB = b.categoria || b.Categoria || "";

      return (orden[categoriaA] || 99) - (orden[categoriaB] || 99);

    });

    mostrarProductos(productos);

    mostrarProductos(productos);
  } catch (error) {
    console.error("Error cargando catálogo:", error);

    if (contenedor) {
      contenedor.innerHTML = `<p class="error">No se pudo cargar el catálogo.</p>`;
    }
  }
}

function mostrarProductos(lista) {
  const contenedor = document.getElementById("catalogo");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  lista.forEach((producto, index) => {
    console.log(producto);
    const categoria = producto.categoria || producto.Categoria || "";
    const nombre = producto.nombre || producto.Nombre || `Producto ${index + 1}`;
    const tallasDisponibles = obtenerTallas(talla);
    const selectorTallas = tallasDisponibles.length > 1
      ? `
    <select class="select-talla" id="talla-${index}">
      <option value="">Elige tu talla</option>
      ${tallasDisponibles.map(t => `<option value="${t}">${t}</option>`).join("")}
    </select>
  `
      : "";
    const precioTexto = producto.precio || producto.Precio || "0";

    const precio = Number(
      precioTexto
        .replace("$", "")
        .replace(/\./g, "")
        .replace(",", "")
    );
    const imagen = producto.imagen || producto.Imagen || "";


    const card = document.createElement("div");
    card.classList.add("producto-card");
    card.addEventListener("click", () => {
      abrirImagen(`/lucifer/landing-campana/${imagen}`);
    });

    card.innerHTML = `
      <img 
        src="/lucifer/landing-campana/${imagen}" 
         alt="${nombre}" 
         class="producto-img"
           onclick="abrirImagen(this.src)"
      >

      <div class="producto-info">
        <span class="producto-categoria">${categoria}</span>
        <h3>${nombre}</h3>
        <p><strong>Talla:</strong> ${talla}</p>
        ${selectorTallas}
        <p class="producto-precio">$${formatearPrecio(precio)}</p>

        <button 
          type="button"
          class="btn-agregar"
          onclick="event.stopPropagation(); agregarAlCarrito(${index})">
          Agregar al carrito
        </button>
      </div>
    `;

    contenedor.appendChild(card);
  });
}

function agregarAlCarrito(index) {
  const producto = productos[index];

  const categoria = producto.categoria || producto.Categoria || "";
  const nombre = producto.nombre || producto.Nombre || `Producto ${index + 1}`;
  const tallaTexto = producto.talla || producto.Talla || "";

  const precioTexto = producto.precio || producto.Precio || "0";
  const precio = convertirPrecio(precioTexto);

  const tallasDisponibles = obtenerTallas(tallaTexto);
  let tallaElegida = tallaTexto;

  if (tallasDisponibles.length > 1) {
    const select = document.getElementById(`talla-${index}`);
    tallaElegida = select ? select.value : "";

    if (!tallaElegida) {
      alert("Por favor elige una talla antes de agregar el producto.");
      return;
    }
  }

  const item = {
    categoria,
    nombre,
    talla: tallaElegida,
    precio
  };

  carrito.push(item);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  actualizarCarrito();
  animarCarrito();
}

  let tallaElegida = tallaTexto;

  const tallasDisponibles = tallaTexto
    .replace("Talla", "")
    .replace("TALLA", "")
    .replace(":", "")
    .trim()
    .split(/\s+/)
    .filter(t => t !== "");

  if (tallasDisponibles.length > 1 && !tallaTexto.toLowerCase().includes("única") && !tallaTexto.toLowerCase().includes("unica")) {
    tallaElegida = prompt(`Elige una talla para ${nombre}:\n${tallasDisponibles.join(", ")}`);

    if (!tallaElegida) {
      alert("Debes elegir una talla para agregar el producto.");
      return;
    }

    tallaElegida = tallaElegida.toUpperCase();

    if (!tallasDisponibles.map(t => t.toUpperCase()).includes(tallaElegida)) {
      alert("Talla no válida. Elige una de estas: " + tallasDisponibles.join(", "));
      return;
    }
  }

  const item = {
    categoria,
    nombre,
    talla: tallaElegida,
    precio,
  };

  carrito.push(item);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  actualizarCarrito();
  animarCarrito();
}


function abrirCarrito() {
  document.getElementById("carrito")?.classList.add("activo");
  document.getElementById("overlay-carrito")?.classList.add("activo");
}

function cerrarCarrito() {
  document.getElementById("carrito")?.classList.remove("activo");
  document.getElementById("overlay-carrito")?.classList.remove("activo");
}

function animarCarrito() {
  const btnCarrito = document.getElementById("btn-carrito");
  if (!btnCarrito) return;

  btnCarrito.classList.remove("animar");
  void btnCarrito.offsetWidth;
  btnCarrito.classList.add("animar");
}

function vaciarCarrito() {
  carrito = [];
  localStorage.removeItem("carrito");
  actualizarCarrito();
}

function pagarWhatsApp() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  let total = 0;
  let detalle = "Hola, quiero hacer este pedido:\n\n";

  carrito.forEach((item, i) => {
    total += item.precio;
    detalle += `${i + 1}. ${item.nombre}\n`;
    detalle += `Categoría: ${item.categoria}\n`;
    detalle += `Talla: ${item.talla}\n`;
    detalle += `Precio: $${formatearPrecio(item.precio)}\n\n`;
  });

  detalle += `Total: $${formatearPrecio(total)}`;

  const mensaje = encodeURIComponent(detalle);
  window.open(`https://wa.me/${TELEFONO_WHATSAPP}?text=${mensaje}`, "_blank");
}

function formatearPrecio(valor) {
  return Number(valor).toLocaleString("es-CO");
}
function abrirImagen(src) {

  const modal = document.getElementById("modal-imagen");
  const imagen = document.getElementById("imagen-modal");

  imagen.src = src;

  modal.classList.add("activo");
}

function cerrarImagen() {

  document
    .getElementById("modal-imagen")
    .classList.remove("activo");
}

document
  .getElementById("cerrar-modal")
  ?.addEventListener("click", cerrarImagen);

document
  .getElementById("modal-imagen")
  ?.addEventListener("click", (e) => {

    if (e.target.id === "modal-imagen") {
      cerrarImagen();
    }

  });
function abrirImagen(src) {
  const modal = document.getElementById("modal-imagen");
  const imagenModal = document.getElementById("imagen-modal");

  if (!modal || !imagenModal) return;

  imagenModal.src = src;
  modal.classList.add("activo");
}

function cerrarImagen() {
  const modal = document.getElementById("modal-imagen");
  if (modal) modal.classList.remove("activo");
}

document.addEventListener("click", (e) => {
  if (e.target.id === "cerrar-modal" || e.target.id === "modal-imagen") {
    cerrarImagen();
  }
});
function filtrarProductos(categoriaFiltro) {
  const botones = document.querySelectorAll(".filtro");

  botones.forEach((btn) => btn.classList.remove("activo"));

  const botonActivo = [...botones].find((btn) =>
    btn.textContent.trim().toLowerCase() === categoriaFiltro.toLowerCase()
  );

  if (categoriaFiltro === "todos") {
    document.querySelector(".filtro")?.classList.add("activo");
    mostrarProductos(productos);
    return;
  }

  if (botonActivo) botonActivo.classList.add("activo");

  const filtrados = productos.filter((producto) => {
    const categoria = producto.categoria || producto.Categoria || "";
    return categoria.toLowerCase().includes(categoriaFiltro.toLowerCase());
  });

  mostrarProductos(filtrados);
}
function obtenerTallas(tallaTexto) {
  if (!tallaTexto) return [];

  const texto = tallaTexto
    .toString()
    .replace(/TALLA/gi, "")
    .replace(/:/g, "")
    .trim();

  if (
    texto.toLowerCase().includes("única") ||
    texto.toLowerCase().includes("unica")
  ) {
    return [];
  }

  return texto
    .split(/\s+/)
    .map(t => t.trim().toUpperCase())
    .filter(t => t !== "");
}

function convertirPrecio(precioTexto) {
  return Number(
    precioTexto
      .toString()
      .replace("$", "")
      .replace(/\./g, "")
      .replace(",", "")
      .trim()
  );
}