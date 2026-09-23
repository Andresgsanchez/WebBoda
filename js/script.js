const formulario = document.getElementById("wedding-form");
const mensaje = document.getElementById("mensaje");

formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    mensaje.textContent = "¡Gracias! Tu confirmación ha sido recibida.";

    formulario.reset();

});