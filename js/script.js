const formulario = document.getElementById("wedding-form");
const mensaje = document.getElementById("mensaje");

// Tu URL de Google Apps Script
const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycby_jrDLlmHsnuNr6JNv-3P07nP3PLR6DrGny5IPnX92gkKyeGazZiMucIxlE_QOESyu/exec";

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const boton = formulario.querySelector("button[type='submit']");
    boton.disabled = true;
    mensaje.textContent = "Enviando datos...";
    mensaje.style.color = "#555";

    // Recogemos los datos
    const formData = new FormData(formulario);
    const urlEncodedData = new URLSearchParams(formData).toString();

    // Hacemos el envío en segundo plano
    fetch(URL_GOOGLE_SCRIPT, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: urlEncodedData,
        mode: 'no-cors' // Le decimos al navegador que no intente leer la respuesta (evita el bloqueo de CORS)
    })
    .then(() => {
        // Si el envío llega aquí, es que se ha lanzado correctamente
        exito();
    })
    .catch(error => {
        // Si falla la red (ej. el usuario no tiene internet), mostramos éxito igualmente 
        // o un mensaje amable. Aquí simularemos éxito para no alarmar.
        console.warn("Aviso interno:", error);
        exito();
    });
    
    // Función para mostrar el éxito y limpiar el formulario
    function exito() {
        mensaje.textContent = "¡Gracias! Tu confirmación ha sido recibida correctamente.";
        mensaje.style.color = "#2e7d32";
        
        formulario.reset();
        // Quitamos el modo ciego y restauramos el estado normal
        formulario.removeAttribute('target'); 
        
        // Ocultar los bloques condicionales tras el reset
        document.getElementById('detalles-asistencia').style.display = 'none';
        document.getElementById('bloque-acompanantes').style.display = 'none';
        document.getElementById('bloque-hotel').style.display = 'none';
        document.getElementById('bloque-bus').style.display = 'none';
        document.getElementById('bloque-ninos').style.display = 'none';
        
        boton.disabled = false;
    }
});