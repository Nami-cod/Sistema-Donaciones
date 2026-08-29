// Metas definidas en el proyecto (alineadas con donacion.js)
const metas = {
    Audiovisual: 1000,
    Investigacion: 1500,
    Artes: 800
};

const donaciones = JSON.parse(localStorage.getItem('donaciones')) || [];
const fondosGuardados = JSON.parse(localStorage.getItem('fondos')) || {};

const fondos = {
    Audiovisual: fondosGuardados.Audiovisual || 0,
    Investigacion: fondosGuardados.Investigacion || fondosGuardados.Becas || 0,
    Artes: fondosGuardados.Artes || 0
};

const totalRecaudado = fondos.Audiovisual + fondos.Investigacion + fondos.Artes;
const metaTotal = metas.Audiovisual + metas.Investigacion + metas.Artes;
const porcentajeTotal = metaTotal > 0 ? ((totalRecaudado / metaTotal) * 100).toFixed(2) : 0;

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

const metodosTotales = { Visa: 0, Mastercard: 0, Transferencia: 0 };
donaciones.forEach(d => {
    if (metodosTotales.hasOwnProperty(d.metodoPago)) {
        metodosTotales[d.metodoPago] += d.monto;
    }
});

// Base para proyección por días (1–10)
const cantidadDonaciones = donaciones.length;
const promedioPorDonacion = cantidadDonaciones > 0 ? totalRecaudado / cantidadDonaciones : 0;
const factorCrecimiento = 1.20;
const donacionesBasePorSemana = Math.max(
    Math.round(cantidadDonaciones * 0.35 * factorCrecimiento),
    cantidadDonaciones > 0 ? 2 : 0
);
const donacionesBasePorDia = donacionesBasePorSemana / 7;
const ingresoBasePorDia = promedioPorDonacion * donacionesBasePorDia;

const pesoAudiovisual = totalRecaudado > 0 ? fondos.Audiovisual / totalRecaudado : 1 / 3;
const pesoInvestigacion = totalRecaudado > 0 ? fondos.Investigacion / totalRecaudado : 1 / 3;
const pesoArtes = totalRecaudado > 0 ? fondos.Artes / totalRecaudado : 1 / 3;

const areas = ['Audiovisual', 'Investigacion', 'Artes'];
const etiquetas = {
    Audiovisual: 'Audiovisual',
    Investigacion: 'Investigación',
    Artes: 'Artes'
};

let chartProyeccion = null;

function calcularProyeccion(dias) {
    const donacionesEstimadas = Math.max(
        Math.round(donacionesBasePorDia * dias),
        dias > 0 && cantidadDonaciones > 0 ? 1 : 0
    );
    const ingresoProyectado = ingresoBasePorDia * dias;
    const proyeccion = {
        Audiovisual: ingresoProyectado * pesoAudiovisual,
        Investigacion: ingresoProyectado * pesoInvestigacion,
        Artes: ingresoProyectado * pesoArtes
    };
    const totalProyectado = totalRecaudado + ingresoProyectado;
    return { donacionesEstimadas, ingresoProyectado, proyeccion, totalProyectado, dias };
}

function actualizarProyeccionUI(dias) {
    const { donacionesEstimadas, ingresoProyectado, proyeccion, totalProyectado } = calcularProyeccion(dias);

    const labelDias = document.getElementById('labelDias');
    if (labelDias) {
        labelDias.textContent = dias === 1 ? '1 día' : `${dias} días`;
    }

    document.getElementById('donacionesEstimadas').textContent = donacionesEstimadas;
    document.getElementById('proyeccionPeriodo').textContent = `$${ingresoProyectado.toFixed(2)}`;
    document.getElementById('totalProyectado').textContent = `$${totalProyectado.toFixed(2)}`;

    const tbodyProy = document.getElementById('tablaProyeccion');
    tbodyProy.innerHTML = '';
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

    if (chartProyeccion) {
        chartProyeccion.data.datasets[1].data = [
            fondos.Audiovisual + proyeccion.Audiovisual,
            fondos.Investigacion + proyeccion.Investigacion,
            fondos.Artes + proyeccion.Artes
        ];
        chartProyeccion.data.datasets[1].label = `Proyectado (+${dias} ${dias === 1 ? 'día' : 'días'}) ($)`;
        chartProyeccion.update();
    }

    const tituloGrafico = document.getElementById('tituloGraficoProyeccion');
    if (tituloGrafico) {
        tituloGrafico.textContent = `Actual vs. proyectado (+${dias} ${dias === 1 ? 'día' : 'días'})`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('totalRecaudado').textContent = `$${totalRecaudado.toFixed(2)}`;
    document.getElementById('progresoGeneral').textContent = `${porcentajeTotal}%`;
    document.getElementById('proyectoLider').textContent = proyectoLider;
    document.getElementById('cantidadDonantes').textContent = donaciones.length;

    const tbody = document.getElementById('tablaCuerpo');
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

    renderizarGraficos();

    const slider = document.getElementById('sliderDias');
    if (slider) {
        slider.addEventListener('input', function () {
            actualizarProyeccionUI(parseInt(this.value, 10));
        });
        actualizarProyeccionUI(parseInt(slider.value, 10));
    }
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
            scales: { y: { beginAtZero: true } }
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
        options: { responsive: true }
    });

    const ctxProyeccion = document.getElementById('graficoProyeccion').getContext('2d');
    chartProyeccion = new Chart(ctxProyeccion, {
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
                    label: 'Proyectado (+1 día) ($)',
                    data: [fondos.Audiovisual, fondos.Investigacion, fondos.Artes],
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: '#10b981',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}