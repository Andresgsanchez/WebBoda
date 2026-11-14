document.addEventListener("DOMContentLoaded", function() {
    
    const formulario = document.getElementById("wedding-form");
    const mensaje = document.getElementById("mensaje");
    const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycby_jrDLlmHsnuNr6JNv-3P07nP3PLR6DrGny5IPnX92gkKyeGazZiMucIxlE_QOESyu/exec";

    // ==========================================
    // 1. FUNCIONES DE MOSTRAR/OCULTAR
    // ==========================================
    window.configurarBloque = function(id, mostrar) {
        const contenedor = document.getElementById(id);
        if (!contenedor) return;
        contenedor.style.display = mostrar ? 'block' : 'none';
        const inputs = contenedor.querySelectorAll('input, textarea');
        inputs.forEach(input => input.disabled = !mostrar);
    };

    window.toggleAsistencia = function() {
        const seleccion = document.querySelector('input[name="asistencia"]:checked').value;
        const panel = document.getElementById('detalles-asistencia');
        const mostrarDetalles = (seleccion === 'Sí');
        panel.style.display = mostrarDetalles ? 'block' : 'none';
        const inputs = panel.querySelectorAll('input, textarea');
        inputs.forEach(input => input.disabled = !mostrarDetalles);
    };

    window.toggleAcompanamiento = function(val) {
        const mostrar = val === 'acompañado';
        configurarBloque('bloque-preguntas-acompanante', mostrar);
        if (!mostrar) {
            document.querySelectorAll('input[name="responde_por_dos"]').forEach(radio => radio.checked = false);
            document.getElementById('nombresAcompanantes').value = '';
        }
    };

    window.toggleHotel = function(val) { configurarBloque('bloque-hotel', val === 'si'); };
    window.toggleCompaneroHotel = function(val) { configurarBloque('bloque-companero-hotel', val === 'acompañado'); };
    window.toggleBus = function(val) { configurarBloque('bloque-bus', val === 'si'); };
    window.toggleNinos = function(val) { configurarBloque('bloque-ninos', val === 'si'); };
    window.toggleMesaNinos = function(val) { configurarBloque('bloque-mesa-ninos', val === 'si'); };

    // ==========================================
    // 2. SCROLL CENTRADO Y AVISO FLOTANTE
    // ==========================================
    function scrollAlCentro(elemento) {
        if (!elemento) return;
        const rect = elemento.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const alturaPantalla = window.innerHeight;
        const offset = rect.top + scrollTop - (alturaPantalla / 2) + (rect.height / 2);
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }

    // ==========================================
    // 3. VALIDACIÓN
    // ==========================================
    formulario.addEventListener("submit", function (e) {
        e.preventDefault(); 

        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.aviso-flotante').forEach(el => el.remove());
        document.getElementById('error-noches').style.display = 'none';

        let primerError = null;
        const todosLosCampos = Array.from(this.querySelectorAll('input[required], textarea[required]'));
        
        todosLosCampos.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

        for (let campo of todosLosCampos) {
            if (campo.disabled) continue; 

            if (campo.type === 'radio') {
                const nombreGrupo = campo.name;
                const radiosDelGrupo = document.querySelectorAll(`input[name="${nombreGrupo}"]`);
                const algunoMarcado = Array.from(radiosDelGrupo).some(r => r.checked);
                if (!algunoMarcado) {
                    const contenedorGrupo = campo.closest('.radio-group');
                    if (contenedorGrupo) { contenedorGrupo.classList.add('input-error'); primerError = contenedorGrupo; }
                    break;
                }
            } else if (campo.type === 'checkbox') {
                const nombreGrupo = campo.name;
                const checkboxesDelGrupo = document.querySelectorAll(`input[name="${nombreGrupo}"]:checked`);
                if (checkboxesDelGrupo.length === 0) {
                    document.getElementById('error-noches').style.display = 'block';
                    const contenedorGrupo = campo.closest('.radio-group');
                    if (contenedorGrupo) { contenedorGrupo.classList.add('input-error'); primerError = contenedorGrupo; }
                    break;
                }
            } else {
                if (!campo.value.trim()) {
                    campo.classList.add('input-error');
                    primerError = campo;
                    break;
                }
            }
        }

        if (primerError) {
            let avisoFlotante = document.createElement('div');
            avisoFlotante.className = 'aviso-flotante';
            avisoFlotante.textContent = '¡Este campo es obligatorio!';
            primerError.parentNode.insertBefore(avisoFlotante, primerError);
            scrollAlCentro(primerError);
            if (primerError.tagName === 'INPUT' || primerError.tagName === 'TEXTAREA') {
                setTimeout(() => primerError.focus(), 400);
            }
            return; 
        }

        enviarFormulario();
    });

    // ==========================================
    // 4. ENVÍO SEGURO USANDO IFRAME
    // ==========================================
    function enviarFormulario() {
        const boton = formulario.querySelector("button[type='submit']");
        
        boton.disabled = true;
        mensaje.textContent = "Enviando datos... Por favor, espera.";
        mensaje.style.color = "#555";

        // 1. Creamos un iframe oculto si no existe
        let iframeName = "iframe_envio_boda";
        let iframe = document.getElementById(iframeName);
        if (!iframe) {
            iframe = document.createElement("iframe");
            iframe.name = iframeName;
            iframe.id = iframeName;
            iframe.style.display = "none";
            document.body.appendChild(iframe);
        }

        // 2. Preparamos los datos extra (checkboxes y canción)
        const formData = new FormData(formulario);
        formData.delete("nochesHotel[]");
        const checkboxesMarcados = document.querySelectorAll('input[name="nochesHotel[]"]:checked');
        formData.append("nochesHotel", Array.from(checkboxesMarcados).map(cb => cb.value).join(", "));
        formData.set("cancionFavorita", document.getElementById("cancionFavorita").value);

        // 3. Creamos un formulario temporal que apunte al iframe
        const formTemporal = document.createElement("form");
        formTemporal.method = "POST";
        formTemporal.action = URL_GOOGLE_SCRIPT;
        formTemporal.target = iframeName;
        formTemporal.style.display = "none";

        // Pasamos los datos del FormData al formulario temporal
        for (let [key, value] of formData.entries()) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            formTemporal.appendChild(input);
        }

        document.body.appendChild(formTemporal);

        // 4. Variables para controlar el tiempo y si ha cargado
        let haCargado = false;
        const tiempoMaximo = 15000; // 15 segundos máximo de espera

        // 5. Función que se ejecuta si el iframe carga (o falla la red)
        iframe.onload = function() {
            haCargado = true;
            exito();
        };

        // 6. Función que se ejecuta si pasa demasiado tiempo sin cargar
        const timeout = setTimeout(function() {
            if (!haCargado) {
                // Si pasan 15 segundos, asumimos que hay un problema (Google ocupado o mala conexión)
                error();
            }
        }, tiempoMaximo);

        // 7. Enviamos el formulario
        formTemporal.submit();

        // Limpiamos el formulario temporal después de un momento
        setTimeout(() => formTemporal.remove(), 1000);

        // ==========================================
        // FUNCIONES DE RESULTADO
        // ==========================================
        function exito() {
            clearTimeout(timeout);
            mensaje.textContent = "¡Gracias! Tu confirmación ha sido recibida correctamente.";
            mensaje.style.color = "#2e7d32";
            resetearFormulario();
        }

        function error() {
            clearTimeout(timeout);
            mensaje.textContent = "Hubo un problema de conexión y no hemos podido guardar tus datos. Por favor, vuelve a intentarlo.";
            mensaje.style.color = "#e53e3e";
            mensaje.style.fontWeight = "bold";
            
            // Volvemos a habilitar el botón
            boton.disabled = false;
        }

        function resetearFormulario() {
            formulario.reset();
            document.getElementById('detalles-asistencia').style.display = 'none';
            document.getElementById('bloque-preguntas-acompanante').style.display = 'none';
            document.getElementById('bloque-hotel').style.display = 'none';
            document.getElementById('bloque-companero-hotel').style.display = 'none';
            document.getElementById('bloque-bus').style.display = 'none';
            document.getElementById('bloque-ninos').style.display = 'none';
            document.getElementById('bloque-mesa-ninos').style.display = 'none';
            document.getElementById('error-noches').style.display = 'none';
            document.querySelectorAll('.aviso-flotante').forEach(el => el.remove());
            boton.disabled = false;
        }
    }
});