// Arreglo para guardar las donaciones, recuperando lo que ya había antes
let donaciones = JSON.parse(localStorage.getItem('donaciones')) || [];

// Fondos acumulados por área (recuperamos lo que ya había o iniciamos en 0)
let fondos = JSON.parse(localStorage.getItem('fondos')) || {
    Audiovisual: 0,
    Becas: 0,
    Artes: 0
};

// Metas de cada fondo, para calcular el porcentaje alcanzado
const metas = {
    Audiovisual: 1000,
    Becas: 1500,
    Artes: 800
};

// Listas para que se vea en que se usara el dinero
const detalles = {
    Audiovisual: "Se usará en: 1. Cámaras, 2. Equipos de sonido, 3. Iluminación",
    Becas: "Se usará en: 1. Becas, 2. Material académico, 3. Eventos estudiantiles",
    Artes: "Se usará en: 1. Pintura, 2. Música, 3. Teatro"
};

class Donacion {
    constructor(nombre, correo, area, metodoPago, monto) {
        this.nombre = nombre;
        this.correo = correo;
        this.area = area;
        this.metodoPago = metodoPago;
        this.monto = monto;
    }
}

// Función para validar el correo electrónico (igual que en registro.js)
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Cuando el usuario cambia el área, mostramos la listita correspondiente
document.getElementById('area').addEventListener('change', function () {
    const areaSeleccionada = this.value;
    const detalleTexto = document.getElementById('detalleArea');

    if (areaSeleccionada) {
        detalleTexto.textContent = detalles[areaSeleccionada];
    } else {
        detalleTexto.textContent = "";
    }
});

// Control de la interfaz (DOM)
document.getElementById('formdonacion').addEventListener('submit', function (event) {
    event.preventDefault();

    // Captura de valores de los inputs
    const areaInput = document.getElementById('area').value;
    const nombreInput = document.getElementById('nombre').value.trim();
    const correoInput = document.getElementById('correo').value.trim();
    const montoInput = parseFloat(document.getElementById('monto').value);
    const metodoInput = document.getElementById('metodoPago').value;

    const res = document.getElementById('mensaje-validacion');

    // Validación de área
    if (!areaInput) {
        res.textContent = "Por favor, selecciona un área para donar.";
        res.style.color = "red";
        return;
    }

    // Validación de nombre
    if (nombreInput === "") {
        res.textContent = "Por favor, ingresa tu nombre.";
        res.style.color = "red";
        return;
    }

    // Validación de correo
    if (!validarEmail(correoInput)) {
        res.textContent = "Por favor, ingresa un correo electrónico válido.";
        res.style.color = "red";
        return;
    }

    // Validación de monto
    if (isNaN(montoInput) || montoInput <= 0) {
        res.textContent = "Por favor, ingresa un monto válido mayor a 0.";
        res.style.color = "red";
        return;
    }

    // Validación de método de pago
    if (!metodoInput) {
        res.textContent = "Por favor, selecciona un método de pago.";
        res.style.color = "red";
        return;
    }

    // Si todo es válido, creamos la instancia del objeto Donacion
    const nuevaDonacion = new Donacion(nombreInput, correoInput, areaInput, metodoInput, montoInput);

    // Guardamos la donación en el arreglo y en localStorage
    donaciones.push(nuevaDonacion);
    localStorage.setItem('donaciones', JSON.stringify(donaciones));

    // Sumamos el monto al fondo del área correspondiente
    fondos[areaInput] += montoInput;
    localStorage.setItem('fondos', JSON.stringify(fondos));

    // Calculamos el porcentaje alcanzado de la meta
    const porcentaje = ((fondos[areaInput] / metas[areaInput]) * 100).toFixed(2);

    // Mostramos el comprobante
    const comprobante = document.getElementById('comprobante');
    comprobante.innerHTML = `
        <h3>COMPROBANTE</h3>
        <p>Donante: ${nuevaDonacion.nombre}</p>
        <p>Correo: ${nuevaDonacion.correo}</p>
        <p>Área: ${nuevaDonacion.area}</p>
        <p>Método: ${nuevaDonacion.metodoPago}</p>
        <p>Monto: $${nuevaDonacion.monto.toFixed(2)}</p>
        <p>Progreso de la meta en ${nuevaDonacion.area}: ${porcentaje}%</p>
    `;

    res.textContent = "¡Donación registrada con éxito!";
    res.style.color = "green";
    console.log("Objeto Donacion Creado:", nuevaDonacion);

    // Limpiamos el formulario después de una donación exitosa
    document.getElementById('formdonacion').reset();
    document.getElementById('detalleArea').textContent = "";
});
