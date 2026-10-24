const formulario = document.getElementById("wedding-form");
const mensaje = document.getElementById("mensaje");

const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycby_jrDLlmHsnuNr6JNv-3P07nP3PLR6DrGny5IPnX92gkKyeGazZiMucIxlE_QOESyu/exec";

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const boton = formulario.querySelector("button[type='submit']");
    boton.disabled = true;
    mensaje.textContent = "Enviando datos...";
    mensaje.style.color = "#555";

    // Recogemos los datos del formulario
    const formData = new FormData(formulario);
    
    // --- TRATAMIENTO DE CHECKBOXES MÚLTIPLES ---
    // Eliminamos los checkboxes sueltos del FormData
    formData.delete("nochesHotel[]");
    
    // Recogemos todos los checkboxes marcados
    const checkboxesMarcados = document.querySelectorAll('input[name="nochesHotel[]"]:checked');
    const nochesSeleccionadas = Array.from(checkboxesMarcados).map(cb => cb.value);
    
    // Los unimos en un solo string separado por comas y lo añadimos al FormData
    formData.append("nochesHotel", nochesSeleccionadas.join(", "));

    // --- NUEVO: Aseguramos que la canción favorita se envía ---
    const cancion = document.getElementById("cancionFavorita").value;
    formData.set("cancionFavorita", cancion);

    // Convertimos a URLSearchParams para enviar a Google
    const urlEncodedData = new URLSearchParams(formData).toString();

    fetch(URL_GOOGLE_SCRIPT, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: urlEncodedData,
        mode: 'no-cors' // Evita el bloqueo de CORS
    })
    .then(() => {
        exito();
    })
    .catch(error => {
        console.warn("Aviso interno:", error);
        exito();
    });
    
    function exito() {
        mensaje.textContent = "¡Gracias! Tu confirmación ha sido recibida correctamente.";
        mensaje.style.color = "#2e7d32";
        
        formulario.reset();
        
        // Ocultar todos los bloques condicionales
        document.getElementById('detalles-asistencia').style.display = 'none';
        document.getElementById('bloque-hotel').style.display = 'none';
        document.getElementById('bloque-companero-hotel').style.display = 'none';
        document.getElementById('bloque-bus').style.display = 'none';
        document.getElementById('bloque-ninos').style.display = 'none';
        
        boton.disabled = false;
    }
});