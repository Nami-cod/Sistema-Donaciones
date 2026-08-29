let donaciones = JSON.parse(localStorage.getItem('donaciones')) || [];
let donantes = JSON.parse(localStorage.getItem('donantes')) || [];

let fondos = JSON.parse(localStorage.getItem('fondos')) || {
    Audiovisual: 0,
    Investigacion: 0,
    Artes: 0
};

const metas = {
    Audiovisual: 1000,
    Investigacion: 1500,
    Artes: 800
};

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

let areaSeleccionada = "";
let metodoSeleccionado = "";
let donanteEncontrado = null;

// ---------- Elementos del panel de verificación ----------
const inputCedula = document.getElementById('cedulaBusqueda');
const datosDonante = document.getElementById('datosDonante');
const avisoRegistro = document.getElementById('avisoRegistro');
const panelDonacion = document.getElementById('panelDonacion');

// ---------- Buscar donante por cédula ----------
inputCedula.addEventListener('input', function () {
    const cedulaIngresada = this.value.trim();

    donantes = JSON.parse(localStorage.getItem('donantes')) || [];
    donanteEncontrado = donantes.find(d => d.cedula === cedulaIngresada);

    if (donanteEncontrado) {
        // Cédula verificada: mostramos el resto del formulario
        datosDonante.textContent = `✅ Donante encontrado: ${donanteEncontrado.nombres} ${donanteEncontrado.apellidos}`;
        datosDonante.style.color = "green";
        document.getElementById('nombre').value = donanteEncontrado.nombres + " " + donanteEncontrado.apellidos;
        document.getElementById('correo').value = donanteEncontrado.email;

        avisoRegistro.style.display = "none";
        panelDonacion.style.display = "contents";

    } else if (cedulaIngresada.length === 10) {
        // Cédula completa pero no encontrada: mostramos el botón de registro
        datosDonante.textContent = "";
        avisoRegistro.style.display = "block";
        panelDonacion.style.display = "none";

    } else {
        // Todavía escribiendo: no mostramos nada
        datosDonante.textContent = "";
        avisoRegistro.style.display = "none";
        panelDonacion.style.display = "none";
    }
});

// ---------- Selección de área ----------
const botonesArea = document.querySelectorAll('.btn-area');
const detalleTexto = document.getElementById('detalleArea');

botonesArea.forEach(boton => {
    boton.addEventListener('click', function () {
        botonesArea.forEach(b => b.classList.remove('seleccionado'));
        this.classList.add('seleccionado');
        areaSeleccionada = this.dataset.area;
        detalleTexto.textContent = detalles[areaSeleccionada];
    });
});

// ---------- Selección de método de pago ----------
const botonesMetodo = document.querySelectorAll('.btn-metodo');

botonesMetodo.forEach(boton => {
    boton.addEventListener('click', function () {
        botonesMetodo.forEach(b => b.classList.remove('seleccionado'));
        this.classList.add('seleccionado');
        metodoSeleccionado = this.dataset.metodo;
    });
});

// ---------- Sonido de éxito ----------
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

    if (!donanteEncontrado) {
        res.textContent = "Por favor, verifica una cédula registrada antes de donar.";
        res.style.color = "red";
        return;
    }

    if (!areaSeleccionada) {
        res.textContent = "Por favor, selecciona un área para donar.";
        res.style.color = "red";
        return;
    }

    if (isNaN(montoInput) || montoInput < 5 || montoInput > 250) {
        res.textContent = "El monto debe estar entre $5 y $250.";
        res.style.color = "red";
        return;
    }

    if (!metodoSeleccionado) {
        res.textContent = "Por favor, selecciona un método de pago.";
        res.style.color = "red";
        return;
    }

    const nuevaDonacion = new Donacion(
        donanteEncontrado.cedula,
        donanteEncontrado.nombres + " " + donanteEncontrado.apellidos,
        donanteEncontrado.email,
        areaSeleccionada,
        metodoSeleccionado,
        montoInput
    );

    donaciones.push(nuevaDonacion);
    localStorage.setItem('donaciones', JSON.stringify(donaciones));

    fondos[areaSeleccionada] += montoInput;
    localStorage.setItem('fondos', JSON.stringify(fondos));

    const comprobante = document.getElementById('comprobante');
    comprobante.innerHTML = `
        <h3>COMPROBANTE</h3>
        <p>Donante: ${nuevaDonacion.nombre}</p>
        <p>Cédula: ${nuevaDonacion.cedula}</p>
        <p>Correo: ${nuevaDonacion.correo}</p>
        <p>Área: ${nuevaDonacion.area}</p>
        <p>Método: ${nuevaDonacion.metodoPago}</p>
        <p>Monto: $${nuevaDonacion.monto.toFixed(2)}</p>
    `;

    res.textContent = "¡Donación registrada con éxito!";
    res.style.color = "green";
    reproducirSonidoExito();
    console.log("Objeto Donacion Creado:", nuevaDonacion);

    document.getElementById('formdonacion').reset();
    detalleTexto.textContent = "";
    datosDonante.textContent = "";
    avisoRegistro.style.display = "none";
    panelDonacion.style.display = "none";
    botonesArea.forEach(b => b.classList.remove('seleccionado'));
    botonesMetodo.forEach(b => b.classList.remove('seleccionado'));
    areaSeleccionada = "";
    metodoSeleccionado = "";
    donanteEncontrado = null;
});

// ---------- Exportar a Excel ----------
document.getElementById('btnExportarExcel').addEventListener('click', function () {
    if (donaciones.length === 0) {
        alert("Todavía no hay donaciones registradas para exportar.");
        return;
    }

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

// ---------- Cargar desde Excel ----------
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
                fila.Cedula, fila.Nombre, fila.Correo, fila.Area, fila.MetodoPago, parseFloat(fila.Monto)
            );
            donaciones.push(donacionImportada);
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
