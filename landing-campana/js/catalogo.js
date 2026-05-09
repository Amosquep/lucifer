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
    const talla = producto.talla || producto.Talla || "";
    const precio = Number(producto.precio || producto.precio || 0);
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
        <p class="producto-precio">$${formatearPrecio(precio)}</p>

        <button 
          type="button"
          class="btn-agregar"
          onclick="agregarAlCarrito(${index})">
          Agregar al carrito
        </button>
      </div>
    `;

    contenedor.appendChild(card);
  });
}

function agregarAlCarrito(index) {
  const producto = productos[index];

  const item = {
    categoria: producto.categoria || producto.Categoria || "",
    nombre: producto.nombre || producto.Nombre || `Producto ${index + 1}`,
    talla: producto.talla || producto.Talla || "",
    precio: Number(producto.precio || producto.precio || 0),
  };

  carrito.push(item);
  localStorage.setItem("carrito", JSON.stringify(carrito));

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
    total += item.precio;

    const li = document.createElement("li");
    li.classList.add("item-carrito");

    li.innerHTML = `
      <strong>${i + 1}. ${item.nombre}</strong>
      <small>Categoría: ${item.categoria}</small>
      <small>Talla: ${item.talla}</small>
      <small>Precio: $${formatearPrecio(item.precio)}</small>
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
  function abrirImagen(src){
  const modal = document.getElementById("modal-imagen");
  const imagenModal = document.getElementById("imagen-modal");

  if (!modal || !imagenModal) return;

  imagenModal.src = src;
  modal.classList.add("activo");
}

function cerrarImagen(){
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