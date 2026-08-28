const EMAILJS_PUBLIC_KEY = "Gsii5jCnpre2jsQdA";
const EMAILJS_SERVICE_ID = "service_w6jqios";
const EMAILJS_TEMPLATE_POSTULANTE = "template_i8keu9i";
const EMAILJS_TEMPLATE_ADMIN = "template_iyrfg1q";

// Correo donde llega la copia de la postulación para nuestro control interno. 
const CORREO_ADMIN = "jahillandrade42@gmail.com";

// Inicializamos EmailJS una sola vez, apenas carga la página. El "if" evita que el sitio se rompa.
if (typeof emailjs !== "undefined") {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

let postulaciones = JSON.parse(localStorage.getItem("postulaciones")) || [];

class Postulacion {
  constructor(nombre, email, telefono, portafolio, titulo, categoria, resumen, monto, duracion, desglose, dossier) {
    this.nombre = nombre;
    this.email = email;
    this.telefono = telefono;
    this.portafolio = portafolio;
    this.proyecto = titulo;
    this.categoria = categoria;
    this.resumen = resumen;
    this.montoSolicitado = monto;
    this.duracion = duracion;
    this.desglose = desglose;
    this.dossier = dossier;
    this.fecha = new Date().toLocaleString("es-EC");
  }
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
function validarTelefono(telefono) {
  const regex = /^\d{10}$/;
  return regex.test(telefono);
}
// El portafolio y el informe son opcionales: el campo vacío se considera válido. Si el usuario escribió algo, debe ser una URL real.
function validarLink(link) {
  if (link === "") return true;
  try {
    new URL(link);
    return true;
  } catch {
    return false;
  }
}
// Valida todo el formulario de una sola vez y muestra el mensaje de error correspondiente. Devuelve true si todo está bien, false si hay algún error.
function validarFormulario(datos) {
  const res = document.getElementById("mensaje-validacion");

  const reglas = [
    [datos.nombre === "", "Por favor, ingresa tu nombre o el nombre del colectivo."],
    [!validarEmail(datos.email), "Por favor, ingresa un correo electrónico válido."],
    [!validarTelefono(datos.telefono), "Por favor, ingresa un número de teléfono válido (10 dígitos)."],
    [!validarLink(datos.portafolio), "El enlace de portafolio no es válido."],
    [datos.titulo === "", "Por favor, ingresa el título del proyecto."],
    [datos.categoria === "", "Por favor, selecciona una categoría."],
    [datos.resumen === "", "Por favor, escribe un resumen del proyecto."],
    [isNaN(datos.monto) || datos.monto <= 0, "Por favor, ingresa un monto solicitado válido."],
    [datos.duracion === "", "Por favor, indica el tiempo de ejecución."],
    [datos.desglose === "", "Por favor, indica el desglose del presupuesto."],
    [!validarLink(datos.dossier), "El enlace del dossier/PDF no es válido."],
  ];

  for (const [condicionDeError, mensaje] of reglas) {
    if (condicionDeError) {
      res.textContent = mensaje;
      res.style.color = "red";
      return false;
    }
  }
  return true;
}

function exportarAExcel(datos) {
  const worksheet = XLSX.utils.json_to_sheet(datos);

  const colWidths = Object.keys(datos[0] || {}).map((key) => ({
    wch: Math.max(key.length + 3, 18),
  }));
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Postulaciones");

  XLSX.writeFile(workbook, "Base_Datos_Postulaciones.xlsx");
}

// Función para enviar correos usando EmailJS
//Correo 1:confirmación para el postulante (le confirma que su formulario se registró correctamente).
function enviarCorreoPostulante(p) {
  if (typeof emailjs === "undefined") {
    return Promise.reject("EmailJS no está cargado.");
  }
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_POSTULANTE, {
    to_name: p.nombre,
    to_email: p.email,
    proyecto: p.proyecto,
    categoria: p.categoria,
    monto: p.montoSolicitado.toFixed(2),
    fecha: p.fecha,
  });
}
// Correo 2: aviso interno para nosotros, con todo el contenido del formulario.
function enviarCorreoInterno(p) {
  if (typeof emailjs === "undefined") {
    return Promise.reject("EmailJS no está cargado.");
  }
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ADMIN, {
    to_email: CORREO_ADMIN,
    nombre: p.nombre,
    email: p.email,
    telefono: p.telefono,
    portafolio: p.portafolio || "No especificado",
    proyecto: p.proyecto,
    categoria: p.categoria,
    resumen: p.resumen,
    monto: p.montoSolicitado.toFixed(2),
    duracion: p.duracion,
    desglose: p.desglose,
    dossier: p.dossier || "No especificado",
    fecha: p.fecha,
  });
}
//Control de la interfaz
document.getElementById("formPostulacion").addEventListener("submit", function (event) {
  event.preventDefault();

  const res = document.getElementById("mensaje-validacion");

 // Capturamos todos los valores del formulario en un solo objeto
  const datos = {
    nombre: document.getElementById("postulanteNombre").value.trim(),
    email: document.getElementById("postulanteEmail").value.trim(),
    telefono: document.getElementById("postulanteTelefono").value.trim(),
    portafolio: document.getElementById("postulantePortafolio").value.trim(),
    titulo: document.getElementById("proyectoTitulo").value.trim(),
    categoria: document.getElementById("proyectoCategoria").value,
    resumen: document.getElementById("proyectoResumen").value.trim(),
    monto: parseFloat(document.getElementById("proyectoMonto").value),
    duracion: document.getElementById("proyectoDuracion").value.trim(),
    desglose: document.getElementById("proyectoDesglose").value.trim(),
    dossier: document.getElementById("proyectoDossier").value.trim(),
  };

  if (!validarFormulario(datos)) return;

  // Objeto Postulación
  const nuevaPostulacion = new Postulacion(
    datos.nombre,
    datos.email,
    datos.telefono,
    datos.portafolio,
    datos.titulo,
    datos.categoria,
    datos.resumen,
    datos.monto,
    datos.duracion,
    datos.desglose,
    datos.dossier
  );

  // Guardamos en el arreglo y en localStorage
  postulaciones.push(nuevaPostulacion);
  localStorage.setItem("postulaciones", JSON.stringify(postulaciones));
  // Se envia los correos en forma paralela: uno al postulante y otro a la nosotros.
  Promise.all([enviarCorreoPostulante(nuevaPostulacion), enviarCorreoInterno(nuevaPostulacion)])
    .then(() => {
      console.log("Ambos correos se enviaron correctamente.");
    })
    .catch((err) => {
      console.error("Error al enviar uno o ambos correos:", err);
    });

  // Ya no exportamos el Excel automáticamente aquí: ahora es una
  // acción aparte, con su propio botón (ver sección 9).
  actualizarBotonDescarga();

  res.textContent = "¡Postulación guardada con éxito! Revisa tu correo para la confirmación. Cuando quieras, usa el botón 'Descargar Excel' para bajar el archivo.";
  res.style.color = "green";
  console.log("Objeto Postulacion Creado:", nuevaPostulacion);

  // Limpiamos el formulario
  document.getElementById("formPostulacion").reset();
});

// Descarga del Excel con todas las postulaciones guardadas
const btnDescargar = document.getElementById("btnDescargar");

// El botón solo se activa si ya hay al menos una postulación guardada.
function actualizarBotonDescarga() {
  btnDescargar.disabled = postulaciones.length === 0;
}

btnDescargar.addEventListener("click", function () {
  if (postulaciones.length === 0) return;
  exportarAExcel(postulaciones);
});

actualizarBotonDescarga();
