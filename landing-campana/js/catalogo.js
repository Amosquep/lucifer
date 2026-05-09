const RUTA_EXCEL = "https://docs.google.com/spreadsheets/d/10_rQEbAjx7HA-NF7_L2kX5gQ1KoFoFNRAFEBCwn3jt8/export?format=xlsx";
const TELEFONO_WHATSAPP = "573504444527";

let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarCarrito();

  document.getElementById("btn-carrito")?.addEventListener("click", (e) => {
    e.preventDefault();
    abrirCarrito();
  });

  document.getElementById("overlay-carrito")?.addEventListener("click", cerrarCarrito);

  document.addEventListener("click", (e) => {
    if (e.target.id === "cerrar-modal" || e.target.id === "modal-imagen") {
      cerrarImagen();
    }
  });
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
        lenceria: 1,
        "lencería": 1,
        pijamas: 2,
        mallas: 3
      };

      const categoriaA = normalizarTexto(a.categoria || a.Categoria || "");
      const categoriaB = normalizarTexto(b.categoria || b.Categoria || "");

      return (orden[categoriaA] || 99) - (orden[categoriaB] || 99);
    });

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
    const categoria = producto.categoria || producto.Categoria || "";
    const nombre = producto.nombre || producto.Nombre || `Producto ${index + 1}`;
    const talla = producto.talla || producto.Talla || "";
    const precio = convertirPrecio(producto.precio || producto.Precio || "0");
    const imagen = producto.imagen || producto.Imagen || "";

    const tallasDisponibles = obtenerTallas(talla);

    const selectorTallas = tallasDisponibles.length > 1
      ? `
        <select class="select-talla" id="talla-${index}" onclick="event.stopPropagation()">
          <option value="">Elige tu talla</option>
          ${tallasDisponibles.map(t => `<option value="${t}">${t}</option>`).join("")}
        </select>
      `
      : "";

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
        loading="lazy"
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
  const precio = convertirPrecio(producto.precio || producto.Precio || "0");

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

  carrito.push({
    categoria,
    nombre,
    talla: tallaElegida,
    precio
  });

  guardarCarrito();
  actualizarCarrito();
  animarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const totalHTML = document.getElementById("total");
  const contador = document.getElementById("contador-carrito");

  if (!lista || !totalHTML || !contador) return;

  lista.innerHTML = "";

  if (carrito.length === 0) {
    lista.innerHTML = `<li class="carrito-vacio">Tu carrito está vacío.</li>`;
  }

  let total = 0;

  carrito.forEach((item, i) => {
    total += Number(item.precio);

    const li = document.createElement("li");
    li.classList.add("item-carrito");

    li.innerHTML = `
      <strong>${i + 1}. ${item.nombre}</strong>
      <small>Categoría: ${item.categoria}</small>
      <small>Talla: ${item.talla}</small>
      <small>Precio: $${formatearPrecio(item.precio)}</small>

      <button 
        type="button" 
        class="btn-eliminar" 
        onclick="eliminarDelCarrito(${i})">
        Eliminar
      </button>
`;

    lista.appendChild(li);
  });

  totalHTML.textContent = formatearPrecio(total);
  contador.textContent = carrito.length;
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
  guardarCarrito();
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
    total += Number(item.precio);

    detalle += `${i + 1}. ${item.nombre}\n`;
    detalle += `Categoría: ${item.categoria}\n`;
    detalle += `Talla: ${item.talla}\n`;
    detalle += `Precio: $${formatearPrecio(item.precio)}\n\n`;
  });

  detalle += `Total: $${formatearPrecio(total)}`;

  const mensaje = encodeURIComponent(detalle);
  window.open(`https://wa.me/${TELEFONO_WHATSAPP}?text=${mensaje}`, "_blank");
}

function abrirImagen(src) {
  const modal = document.getElementById("modal-imagen");
  const imagenModal = document.getElementById("imagen-modal");

  if (!modal || !imagenModal) return;

  imagenModal.src = src;
  modal.classList.add("activo");
}

function cerrarImagen() {
  document.getElementById("modal-imagen")?.classList.remove("activo");
}

function filtrarProductos(categoriaFiltro) {
  const botones = document.querySelectorAll(".filtro");

  botones.forEach(btn => btn.classList.remove("activo"));

  if (categoriaFiltro === "todos") {
    document.querySelector(".filtro")?.classList.add("activo");
    mostrarProductos(productos);
    return;
  }

  const botonActivo = [...botones].find(btn =>
    normalizarTexto(btn.textContent) === normalizarTexto(categoriaFiltro)
  );

  if (botonActivo) botonActivo.classList.add("activo");

  const filtrados = productos.filter(producto => {
    const categoria = producto.categoria || producto.Categoria || "";
    return normalizarTexto(categoria).includes(normalizarTexto(categoriaFiltro));
  });

  mostrarProductos(filtrados);
}

function obtenerTallas(tallaTexto) {
  if (!tallaTexto) return [];

  const texto = tallaTexto
    .toString()
    .replace(/TALLA/gi, "")
    .replace(/Talla/gi, "")
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
  ) || 0;
}

function formatearPrecio(valor) {
  return Number(valor || 0).toLocaleString("es-CO");
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function normalizarTexto(texto) {
  return texto
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  actualizarCarrito();
}