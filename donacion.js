// Arreglo para guardar las donaciones, recuperando lo que ya había antes
let donaciones = JSON.parse(localStorage.getItem('donaciones')) || [];

// Arreglo de donantes ya registrados (viene de registro.js)
let donantes = JSON.parse(localStorage.getItem('donantes')) || [];

// Fondos acumulados por área (recuperamos lo que ya había o iniciamos en 0)
let fondos = JSON.parse(localStorage.getItem('fondos')) || {
    Audiovisual: 0,
    Investigacion: 0,
    Artes: 0
};

// Metas de cada fondo, para calcular el porcentaje alcanzado
const metas = {
    Audiovisual: 1000,
    Investigacion: 1500,
    Artes: 800
};

// Info de en qué se usará el dinero de cada área
const detalles = {
    Audiovisual: "Se usará en: 1. Cámaras, 2. Equipos de sonido, 3. Iluminación",
    Investigacion: "Se usará en: 1. Equipos de laboratorio, 2. Publicaciones, 3. Viajes de campo",
    Artes: "Se usará en: 1. Pintura, 2. Música, 3. Teatro"
};

class Donacion {
    constructor(cedula, nombre, correo, area, metodoPago, monto) {
        this.cedula = cedula;
        this.nombre = nombre;
        this.correo = correo;
        this.area = area;
        this.metodoPago = metodoPago;
        this.monto = monto;
    }
}

// Variables para recordar lo que el usuario va seleccionando
let areaSeleccionada = "";
let metodoSeleccionado = "";
let donanteEncontrado = null;

// ---------- Buscar donante por cédula (para no repetir datos) ----------
const inputCedula = document.getElementById('cedulaBusqueda');
const datosDonante = document.getElementById('datosDonante');

inputCedula.addEventListener('input', function () {
    const cedulaIngresada = this.value.trim();

    // Releemos localStorage por si se acaba de registrar alguien nuevo
    donantes = JSON.parse(localStorage.getItem('donantes')) || [];
    donanteEncontrado = donantes.find(d => d.cedula === cedulaIngresada);

    if (donanteEncontrado) {
        datosDonante.textContent = `✅ Donante encontrado: ${donanteEncontrado.nombres} ${donanteEncontrado.apellidos}`;
        datosDonante.style.color = "green";
        document.getElementById('nombre').value = donanteEncontrado.nombres + " " + donanteEncontrado.apellidos;
        document.getElementById('correo').value = donanteEncontrado.email;
    } else if (cedulaIngresada.length === 10) {
        datosDonante.textContent = "⚠️ Cédula no registrada. Regístrate primero en 'Donar'.";
        datosDonante.style.color = "red";
        document.getElementById('nombre').value = "";
        document.getElementById('correo').value = "";
    } else {
        datosDonante.textContent = "";
        document.getElementById('nombre').value = "";
        document.getElementById('correo').value = "";
    }
});

// ---------- Selección de área con botones ----------
const botonesArea = document.querySelectorAll('.btn-area');
const detalleTexto = document.getElementById('detalleArea');
const progresoRelleno = document.getElementById('progresoRelleno');

botonesArea.forEach(boton => {
    boton.addEventListener('click', function () {
        botonesArea.forEach(b => b.classList.remove('seleccionado'));
        this.classList.add('seleccionado');
        areaSeleccionada = this.dataset.area;

        detalleTexto.textContent = detalles[areaSeleccionada];

        // Mostramos qué tan cerca está esa área de su meta
        const porcentaje = Math.min((fondos[areaSeleccionada] / metas[areaSeleccionada]) * 100, 100);
        progresoRelleno.style.width = porcentaje + "%";
        progresoRelleno.textContent = porcentaje.toFixed(0) + "%";
    });
});

// ---------- Selección de método de pago con botones ----------
const botonesMetodo = document.querySelectorAll('.btn-metodo');

botonesMetodo.forEach(boton => {
    boton.addEventListener('click', function () {
        botonesMetodo.forEach(b => b.classList.remove('seleccionado'));
        this.classList.add('seleccionado');
        metodoSeleccionado = this.dataset.metodo;
    });
});

// ---------- Sonido de éxito (generado con el navegador, no necesita archivo) ----------
function reproducirSonidoExito() {
    const contexto = new (window.AudioContext || window.webkitAudioContext)();
    const oscilador = contexto.createOscillator();
    const volumen = contexto.createGain();

    oscilador.connect(volumen);
    volumen.connect(contexto.destination);

    oscilador.type = "sine";
    oscilador.frequency.setValueAtTime(880, contexto.currentTime);
    oscilador.frequency.exponentialRampToValueAtTime(1320, contexto.currentTime + 0.15);

    volumen.gain.setValueAtTime(0.2, contexto.currentTime);
    volumen.gain.exponentialRampToValueAtTime(0.001, contexto.currentTime + 0.4);

    oscilador.start();
    oscilador.stop(contexto.currentTime + 0.4);
}

// ---------- Envío del formulario ----------
document.getElementById('formdonacion').addEventListener('submit', function (event) {
    event.preventDefault();

    const res = document.getElementById('mensaje-validacion');
    const montoInput = parseFloat(document.getElementById('monto').value);

    // Validación de cédula / donante encontrado
    if (!donanteEncontrado) {
        res.textContent = "Por favor, ingresa la cédula de un donante ya registrado.";
        res.style.color = "red";
        return;
    }

    // Validación de área
    if (!areaSeleccionada) {
        res.textContent = "Por favor, selecciona un área para donar.";
        res.style.color = "red";
        return;
    }

    // Validación de monto (entre $5 y $250)
    if (isNaN(montoInput) || montoInput < 5 || montoInput > 250) {
        res.textContent = "El monto debe estar entre $5 y $250.";
        res.style.color = "red";
        return;
    }

    // Validación de método de pago
    if (!metodoSeleccionado) {
        res.textContent = "Por favor, selecciona un método de pago.";
        res.style.color = "red";
        return;
    }

    // Creamos la instancia del objeto Donacion con los datos del donante encontrado
    const nuevaDonacion = new Donacion(
        donanteEncontrado.cedula,
        donanteEncontrado.nombres + " " + donanteEncontrado.apellidos,
        donanteEncontrado.email,
        areaSeleccionada,
        metodoSeleccionado,
        montoInput
    );

    // Guardamos la donación en el arreglo y en localStorage
    donaciones.push(nuevaDonacion);
    localStorage.setItem('donaciones', JSON.stringify(donaciones));

    // Sumamos el monto al fondo del área correspondiente
    fondos[areaSeleccionada] += montoInput;
    localStorage.setItem('fondos', JSON.stringify(fondos));

    // Calculamos el porcentaje alcanzado de la meta
    const porcentaje = ((fondos[areaSeleccionada] / metas[areaSeleccionada]) * 100).toFixed(2);
    progresoRelleno.style.width = Math.min(porcentaje, 100) + "%";
    progresoRelleno.textContent = porcentaje + "%";

    // Mostramos el comprobante
    const comprobante = document.getElementById('comprobante');
    comprobante.innerHTML = `
        <h3>COMPROBANTE</h3>
        <p>Donante: ${nuevaDonacion.nombre}</p>
        <p>Cédula: ${nuevaDonacion.cedula}</p>
        <p>Correo: ${nuevaDonacion.correo}</p>
        <p>Área: ${nuevaDonacion.area}</p>
        <p>Método: ${nuevaDonacion.metodoPago}</p>
        <p>Monto: $${nuevaDonacion.monto.toFixed(2)}</p>
        <p>Progreso de la meta en ${nuevaDonacion.area}: ${porcentaje}%</p>
    `;

    res.textContent = "¡Donación registrada con éxito!";
    res.style.color = "green";
    reproducirSonidoExito();
    console.log("Objeto Donacion Creado:", nuevaDonacion);

    // Limpiamos el formulario y las selecciones después de una donación exitosa
    document.getElementById('formdonacion').reset();
    document.getElementById('detalleArea').textContent = "";
    document.getElementById('datosDonante').textContent = "";
    botonesArea.forEach(b => b.classList.remove('seleccionado'));
    botonesMetodo.forEach(b => b.classList.remove('seleccionado'));
    areaSeleccionada = "";
    metodoSeleccionado = "";
    donanteEncontrado = null;
});

// ---------- Exportar historial de donaciones a Excel ----------
document.getElementById('btnExportarExcel').addEventListener('click', function () {
    if (donaciones.length === 0) {
        alert("Todavía no hay donaciones registradas para exportar.");
        return;
    }

    // Convertimos el arreglo de donaciones en una hoja de Excel
    const hoja = XLSX.utils.json_to_sheet(donaciones.map(d => ({
        Cedula: d.cedula,
        Nombre: d.nombre,
        Correo: d.correo,
        Area: d.area,
        MetodoPago: d.metodoPago,
        Monto: d.monto
    })));

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Donaciones");
    XLSX.writeFile(libro, "donaciones.xlsx");
});

// ---------- Cargar donaciones desde un archivo Excel ----------
document.getElementById('inputExcel').addEventListener('change', function (event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function (e) {
        const datos = new Uint8Array(e.target.result);
        const libro = XLSX.read(datos, { type: 'array' });
        const primeraHoja = libro.Sheets[libro.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json(primeraHoja);

        filas.forEach(fila => {
            const donacionImportada = new Donacion(
                fila.Cedula,
                fila.Nombre,
                fila.Correo,
                fila.Area,
                fila.MetodoPago,
                parseFloat(fila.Monto)
            );
            donaciones.push(donacionImportada);

            // Sumamos también al fondo correspondiente, si el área existe
            if (fondos[donacionImportada.area] !== undefined) {
                fondos[donacionImportada.area] += donacionImportada.monto;
            }
        });

        localStorage.setItem('donaciones', JSON.stringify(donaciones));
        localStorage.setItem('fondos', JSON.stringify(fondos));

        alert(`Se importaron ${filas.length} donaciones desde el Excel.`);
    };
    lector.readAsArrayBuffer(archivo);
});
