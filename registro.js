//Arreglo para guardar los donantes, recuperando lo que ya había antes
let donantes = JSON.parse(localStorage.getItem('donantes')) || [];

class Donante {
    constructor(nombres, apellidos, ci, email, telefono) {
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.cedula = ci;
        this.email = email;
        this.telefono = telefono;
    }
}

// Función para validar que el nombre y apellido tengan al menos dos palabras
function tieneDosPalabras(texto) {
  
    const palabras = texto.trim().split(/\s+/);
    
    return palabras.length >= 2;
}

// Función para validar el correo electrónico

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función de validación cedula

function validarCedula(ci) {
   
    if (ci.length !== 10 || isNaN(ci)) {
        return false;}

        const provincia = parseInt(ci.substring(0, 2), 10);
        if (provincia < 1 || provincia > 24) {
        return false;}
        
        const tercerDigito = parseInt(ci.substring(2, 3), 10);
        if (tercerDigito >= 6) {
        return false;}
        
        let suma = 0;
        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    
     for (let i = 0; i < 9; i++) {
      let valor = parseInt(ci.charAt(i), 10) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;}

     const verificador = parseInt(ci.charAt(9), 10);
     const decenaSuperior = Math.ceil(suma / 10) * 10;
     let digitoCalculado = decenaSuperior - suma;
     if (digitoCalculado === 10) digitoCalculado = 0;
     return digitoCalculado === verificador;
    }

    // Función del # de teléfono
    function validarTelefono(telefono) {
        const regex = /^\d{10}$/; 
        return regex.test(telefono);
    }


   // Control de la interfaz (DOM)
    document.getElementById('formregistro').addEventListener('submit', function(event) {
    event.preventDefault(); 

    // Captura de valores de los inputs
    const nombresInput = document.getElementById('nombre').value.trim();
    const apellidosInput = document.getElementById('apellido').value.trim();
    const cedulaInput = document.getElementById('ci').value.trim();
    const emailInput = document.getElementById('email').value.trim();
    const telefonoInput = document.getElementById('telefono').value.trim();

    const res = document.getElementById('mensaje-validacion');

    // Validación de nombres (mínimo 2 palabras)
    if (!tieneDosPalabras(nombresInput)) {
        res.textContent = "Por favor, ingresa al menos dos nombres.";
        res.style.color = "red";
        return;
    }

    // Validación de apellidos (mínimo 2 palabras)
    if (!tieneDosPalabras(apellidosInput)) {
        res.textContent = "Por favor, ingresa al menos dos apellidos.";
        res.style.color = "red";
        return;
    }

    // Validación de cédula
    if (!validarCedula(cedulaInput)) {
        res.textContent = "Cédula incorrecta o no válida para Ecuador.";
        res.style.color = "red";
        return;
    }

    // Validación de correo electrónico
    if (!validarEmail(emailInput)) {
        res.textContent = "Por favor, ingresa un correo electrónico válido.";
        res.style.color = "red";
        return;
    }

    // Validación de # de telefono
    if (!validarTelefono(telefonoInput)) {
        res.textContent = "Por favor, ingresa un número de teléfono válido (10 dígitos).";
        res.style.color = "red";
        return;
    }
    //Validación de cédula duplicada
    if (donantes.some(d => d.cedula === cedulaInput)) {
        res.textContent = "Esta cédula ya está registrada.";
        res.style.color = "red";
        return;
    }

    // Si todo es válido, creamos la instancia del objeto Donante 
    const nuevoDonante = new Donante(
        nombresInput,
        apellidosInput,
        cedulaInput,
        emailInput,
        telefonoInput
    );
    // Guardamos el nuevo donante en el arreglo y en localStorage
    donantes.push(nuevoDonante);
    localStorage.setItem('donantes', JSON.stringify(donantes));

    res.textContent = "¡Registro exitoso! Todos los datos son válidos.";
    res.style.color = "green";
    console.log("Objeto Donante Creado:", nuevoDonante);
        
    //Limpiamos el formulario después de un registro exitoso
    document.getElementById('formregistro').reset();

    // Tiempo de espera para que el usuario alcance a leer el mensaje,
    // y luego se direcciona al formulario de donación.
    //NOTA: 'setTimeout' es un método global de la API Web del navegador. 
    setTimeout(() => {
        window.location.href = "donacion.html";
    }, 1500);

});

    


