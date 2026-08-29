// Metas definidas en el proyecto (alineadas con donacion.js)
const metas = {
    Audiovisual: 1000,
    Investigacion: 1500,
    Artes: 800
};

// 1. Recuperar los datos guardados por donacion.js en el LocalStorage
const donaciones = JSON.parse(localStorage.getItem('donaciones')) || [];
const fondosGuardados = JSON.parse(localStorage.getItem('fondos')) || {};

// Unificamos claves: soportamos datos antiguos con "Becas" y los nuevos con "Investigacion"
const fondos = {
    Audiovisual: fondosGuardados.Audiovisual || 0,
    Investigacion: fondosGuardados.Investigacion || fondosGuardados.Becas || 0,
    Artes: fondosGuardados.Artes || 0
};

// 2. Cálculos globales
const totalRecaudado = fondos.Audiovisual + fondos.Investigacion + fondos.Artes;
const metaTotal = metas.Audiovisual + metas.Investigacion + metas.Artes;
const porcentajeTotal = metaTotal > 0 ? ((totalRecaudado / metaTotal) * 100).toFixed(2) : 0;

// Determinar el proyecto más apoyado
let proyectoLider = "Sin donaciones";
if (fondos.Audiovisual > fondos.Investigacion && fondos.Audiovisual > fondos.Artes) {
    proyectoLider = "AUDIOVISUAL";
} else if (fondos.Investigacion > fondos.Audiovisual && fondos.Investigacion > fondos.Artes) {
    proyectoLider = "INVESTIGACIÓN";
} else if (fondos.Artes > fondos.Audiovisual && fondos.Artes > fondos.Investigacion) {
    proyectoLider = "ARTES";
} else if (totalRecaudado > 0) {
    proyectoLider = "EMPATE";
}

// Conteo acumulado por método de pago
const metodosTotales = { Visa: 0, Mastercard: 0, Transferencia: 0 };
donaciones.forEach(d => {
    if (metodosTotales.hasOwnProperty(d.metodoPago)) {
        metodosTotales[d.metodoPago] += d.monto;
    }
});

// ---------- Proyección a la próxima semana ----------
const cantidadDonaciones = donaciones.length;
const promedioPorDonacion = cantidadDonaciones > 0 ? totalRecaudado / cantidadDonaciones : 0;
const factorCrecimiento = 1.20;
const donacionesEstimadasSemana = Math.max(Math.round(cantidadDonaciones * 0.35 * factorCrecimiento), cantidadDonaciones > 0 ? 2 : 0);
const proyeccionSemanalTotal = promedioPorDonacion * donacionesEstimadasSemana;

const pesoAudiovisual = totalRecaudado > 0 ? fondos.Audiovisual / totalRecaudado : 1 / 3;
const pesoInvestigacion = totalRecaudado > 0 ? fondos.Investigacion / totalRecaudado : 1 / 3;
const pesoArtes = totalRecaudado > 0 ? fondos.Artes / totalRecaudado : 1 / 3;

const proyeccion = {
    Audiovisual: proyeccionSemanalTotal * pesoAudiovisual,
    Investigacion: proyeccionSemanalTotal * pesoInvestigacion,
    Artes: proyeccionSemanalTotal * pesoArtes
};

const totalProyectadoProximaSemana = totalRecaudado + proyeccionSemanalTotal;

// 3. Renderizar valores en el DOM (Tarjetas y Tabla)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('totalRecaudado').textContent = `$${totalRecaudado.toFixed(2)}`;
    document.getElementById('progresoGeneral').textContent = `${porcentajeTotal}%`;
    document.getElementById('proyectoLider').textContent = proyectoLider;
    document.getElementById('cantidadDonantes').textContent = donaciones.length;

    const tbody = document.getElementById('tablaCuerpo');
    const areas = ['Audiovisual', 'Investigacion', 'Artes'];
    const etiquetas = {
        Audiovisual: 'Audiovisual',
        Investigacion: 'Investigación',
        Artes: 'Artes'
    };

    areas.forEach(area => {
        const recaudado = fondos[area] || 0;
        const meta = metas[area];
        const porcentaje = ((recaudado / meta) * 100).toFixed(2);

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${etiquetas[area]}</td>
            <td>$${recaudado.toFixed(2)}</td>
            <td>$${meta.toFixed(2)}</td>
            <td>${porcentaje}%</td>
        `;
        tbody.appendChild(fila);
    });

    document.getElementById('proyeccionSemana').textContent = `$${proyeccionSemanalTotal.toFixed(2)}`;
    document.getElementById('totalProyectado').textContent = `$${totalProyectadoProximaSemana.toFixed(2)}`;
    document.getElementById('donacionesEstimadas').textContent = donacionesEstimadasSemana;

    const tbodyProy = document.getElementById('tablaProyeccion');
    areas.forEach(area => {
        const actual = fondos[area] || 0;
        const extra = proyeccion[area] || 0;
        const proyectado = actual + extra;
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${etiquetas[area]}</td>
            <td>$${actual.toFixed(2)}</td>
            <td>+$${extra.toFixed(2)}</td>
            <td>$${proyectado.toFixed(2)}</td>
        `;
        tbodyProy.appendChild(fila);
    });

    renderizarGraficos();
});

function renderizarGraficos() {
    const ctxBarras = document.getElementById('graficoBarras').getContext('2d');
    new Chart(ctxBarras, {
        type: 'bar',
        data: {
            labels: ['Audiovisual', 'Investigación', 'Artes'],
            datasets: [
                {
                    label: 'Recaudado ($)',
                    data: [fondos.Audiovisual, fondos.Investigacion, fondos.Artes],
                    backgroundColor: 'rgba(2, 132, 199, 0.8)',
                    borderColor: '#0284c7',
                    borderWidth: 1
                },
                {
                    label: 'Meta ($)',
                    data: [metas.Audiovisual, metas.Investigacion, metas.Artes],
                    backgroundColor: 'rgba(203, 213, 225, 0.6)',
                    borderColor: '#94a3b8',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    const ctxMetodos = document.getElementById('graficoMetodos').getContext('2d');
    new Chart(ctxMetodos, {
        type: 'doughnut',
        data: {
            labels: ['Visa', 'Mastercard', 'Transferencia'],
            datasets: [{
                data: [
                    metodosTotales.Visa,
                    metodosTotales.Mastercard,
                    metodosTotales.Transferencia
                ],
                backgroundColor: ['#38bdf8', '#f59e0b', '#10b981']
            }]
        },
        options: {
            responsive: true
        }
    });

    const ctxProyeccion = document.getElementById('graficoProyeccion').getContext('2d');
    new Chart(ctxProyeccion, {
        type: 'bar',
        data: {
            labels: ['Audiovisual', 'Investigación', 'Artes'],
            datasets: [
                {
                    label: 'Actual ($)',
                    data: [fondos.Audiovisual, fondos.Investigacion, fondos.Artes],
                    backgroundColor: 'rgba(2, 132, 199, 0.8)',
                    borderColor: '#0284c7',
                    borderWidth: 1
                },
                {
                    label: 'Proyectado (+1 semana) ($)',
                    data: [
                        fondos.Audiovisual + proyeccion.Audiovisual,
                        fondos.Investigacion + proyeccion.Investigacion,
                        fondos.Artes + proyeccion.Artes
                    ],
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: '#10b981',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}