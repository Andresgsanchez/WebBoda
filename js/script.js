const formulario = document.getElementById("wedding-form");
const mensaje = document.getElementById("mensaje");

// 🛑 REEMPLAZA ESTA URL POR LA TUYA DE GOOGLE APPS SCRIPT
const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycby_jrDLlmHsnuNr6JNv-3P07nP3PLR6DrGny5IPnX92gkKyeGazZiMucIxlE_QOESyu/exec";

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const boton = formulario.querySelector("button[type='submit']");
    boton.disabled = true;
    mensaje.textContent = "Enviando datos...";
    mensaje.style.color = "#555";

    // Recogemos los datos del formulario
    const formData = new FormData(formulario);
    
    // TRUCO IMPORTANTE: Convertimos FormData a URLSearchParams.
    // Esto es necesario porque Google Apps Script lee los datos a través de e.parameter
    // y si enviamos un JSON puro o FormData directo, no lo lee bien.
    const urlEncodedData = new URLSearchParams(formData).toString();

    fetch(URL_GOOGLE_SCRIPT, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: urlEncodedData
    })
    .then(response => response.json())
    .then(data => {
        if (data.result === "success") {
            mensaje.textContent = "¡Gracias! Tu confirmación ha sido recibida correctamente.";
            mensaje.style.color = "#2e7d32";
            formulario.reset();
            
            // Ocultar los bloques condicionales tras el reset
            document.getElementById('detalles-asistencia').style.display = 'none';
            document.getElementById('bloque-acompanantes').style.display = 'none';
            document.getElementById('bloque-hotel').style.display = 'none';
            document.getElementById('bloque-bus').style.display = 'none';
            document.getElementById('bloque-ninos').style.display = 'none';
            
        } else {
            mensaje.textContent = "Hubo un problema al enviar los datos. Inténtalo de nuevo.";
            mensaje.style.color = "red";
            console.error(data.message);
        }
    })
    .catch(error => {
        mensaje.textContent = "Error de conexión. Revisa tu internet e inténtalo de nuevo.";
        mensaje.style.color = "red";
        console.error("Error:", error);
    })
    .finally(() => {
        boton.disabled = false;
    });
});