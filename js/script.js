const formulario = document.querySelector("form");

formulario.addEventListener("submit", function (event) {
  event.preventDefault();
  alert("Gracias por suscribirte a Luna Íntima.");
  formulario.reset();
});

function comprar() {
  alert("Gracias por tu interés. Muy pronto serás redirigido a nuestra tienda.");
}

const elementos = document.querySelectorAll(".fade-in");

function mostrarElementos() {
  elementos.forEach(function (elemento) {
    const posicion = elemento.getBoundingClientRect().top;
    const alturaPantalla = window.innerHeight - 100;

    if (posicion < alturaPantalla) {
      elemento.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", mostrarElementos);
mostrarElementos();
