let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let productos = [];

const RUTA_EXCEL = "https://docs.google.com/spreadsheets/d/1qm_1S385s-qCdd7IwyOud5cRf4o_jFBw/export?format=xlsx";
const TELEFONO_WHATSAPP = "573504444527";

document.addEventListener("DOMContentLoaded", () => {
  cargarProductosDesdeExcel();
  mostrarCarrito();
});

async function cargarProductosDesdeExcel() {
  const contenedor = document.getElementById("catalogo-productos");

  try {
    contenedor.innerHTML = "<p>Cargando productos...</p>";

    const respuesta = await fetch(RUTA_EXCEL);

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo Excel. Revisa la ruta: " + RUTA_EXCEL);
    }

    const datos = await respuesta.arrayBuffer();
    const libro = XLSX.read(datos, { type: "array" });
    const nombreHoja = libro.SheetNames[0];
    const hoja = libro.Sheets[nombreHoja];

    productos = XLSX.utils.sheet_to_json(hoja).map(normalizarProducto);
    mostrarProductos();
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `
      <div class="mensaje-error">
        <h3>No se pudieron cargar los productos</h3>
        <p>Abre el proyecto con Live Server o desde un hosting. El navegador no permite leer Excel correctamente con doble clic.</p>
      </div>
    `;
  }
}

function normalizarProducto(producto, index) {
  return {
    id: producto.id || index + 1,
    sku: producto.sku || "",
    nombre: producto.nombre_producto || producto.nombre || producto.producto || "Producto sin nombre",
    categoria: producto.categoria || "Lencería",
    descripcion: producto.descripcion || "Prenda de lencería elegante y cómoda.",
    precio: Number(producto.precio_cop || producto.precio || producto.valor || 0),
    moneda: producto.moneda || "COP",
    tallas: producto.tallas || producto.talla || "S, M, L",
    color: producto.color || "Surtido",
    material: producto.material || "Encaje y elastano",
    stock: Number(producto.stock || 0),
    imagen: producto.imagen_url || producto.imagen || producto.foto || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
  };
}

function mostrarProductos() {
  const contenedor = document.getElementById("catalogo-productos");
  contenedor.innerHTML = "";

  if (productos.length === 0) {
    contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
    return;
  }

  productos.forEach((producto) => {
    const card = document.createElement("article");
    card.className = "producto";

    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'">
      <span class="categoria">${producto.categoria}</span>
      <h3>${producto.nombre}</h3>
      <p class="descripcion">${producto.descripcion}</p>
      <p class="detalle"><strong>Tallas:</strong> ${producto.tallas}</p>
      <p class="detalle"><strong>Color:</strong> ${producto.color}</p>
      <p class="detalle"><strong>Material:</strong> ${producto.material}</p>
      <p class="detalle"><strong>Stock:</strong> ${producto.stock}</p>
      <p class="precio">$${formatearPrecio(producto.precio)}</p>
      <button type="button" onclick="agregarCarrito(${producto.id})">Comprar</button>
    `;

    contenedor.appendChild(card);
  });
}

function agregarCarrito(idProducto) {
  const producto = productos.find((item) => Number(item.id) === Number(idProducto));

  if (!producto) {
    alert("Producto no encontrado.");
    return;
  }

  const productoEnCarrito = carrito.find((item) => Number(item.id) === Number(idProducto));

  if (productoEnCarrito) {
    productoEnCarrito.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }

  guardarCarrito();
  mostrarCarrito();
}

function mostrarCarrito() {
  const listaCarrito = document.getElementById("lista-carrito");
  const totalCarrito = document.getElementById("total");
  const contadorCarrito = document.getElementById("contador-carrito");

  if (!listaCarrito || !totalCarrito || !contadorCarrito) return;

  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    listaCarrito.innerHTML = "<li class='carrito-vacio'>Tu carrito está vacío.</li>";
  }

  carrito.forEach((producto, index) => {
    const item = document.createElement("li");
    const subtotal = producto.precio * producto.cantidad;

    item.innerHTML = `
      <div>
        <strong>${producto.nombre}</strong><br>
        <small>${producto.cantidad} x $${formatearPrecio(producto.precio)} = $${formatearPrecio(subtotal)}</small>
      </div>
      <button type="button" onclick="eliminarProducto(${index})">Eliminar</button>
    `;

    listaCarrito.appendChild(item);
  });

  totalCarrito.textContent = formatearPrecio(calcularTotal());
  contadorCarrito.textContent = calcularCantidadProductos();
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  mostrarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  mostrarCarrito();
}

function pagarWhatsApp() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  let mensaje = "Hola, quiero realizar este pedido:\n\n";

  carrito.forEach((producto) => {
    const subtotal = producto.precio * producto.cantidad;
    mensaje += `- ${producto.nombre} | Cantidad: ${producto.cantidad} | Subtotal: $${formatearPrecio(subtotal)}\n`;
  });

  mensaje += `\nTotal: $${formatearPrecio(calcularTotal())}`;

  const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

function calcularTotal() {
  return carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
}

function calcularCantidadProductos() {
  return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function formatearPrecio(valor) {
  return Number(valor || 0).toLocaleString("es-CO");
}
