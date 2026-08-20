// Metas definidas en el proyecto
const metas = {
    Audiovisual: 1000,
    Becas: 1500,
    Artes: 800
};

// 1. Recuperar los datos guardados por donacion.js en el LocalStorage
const donaciones = JSON.parse(localStorage.getItem('donaciones')) || [];
const fondos = JSON.parse(localStorage.getItem('fondos')) || {
    Audiovisual: 0,
    Becas: 0,
    Artes: 0
};

// 2. Cálculos globales y de lógica Java
const totalRecaudado = fondos.Audiovisual + fondos.Becas + fondos.Artes;
const metaTotal = metas.Audiovisual + metas.Becas + metas.Artes;
const porcentajeTotal = metaTotal > 0 ? ((totalRecaudado / metaTotal) * 100).toFixed(2) : 0;

// Determinar el proyecto más apoyado (Lógica idéntica a tu switch/if en Java)
let proyectoLider = "Sin donaciones";
if (fondos.Audiovisual > fondos.Becas && fondos.Audiovisual > fondos.Artes) {
    proyectoLider = "AUDIOVISUAL";
} else if (fondos.Becas > fondos.Audiovisual && fondos.Becas > fondos.Artes) {
    proyectoLider = "BECAS";
} else if (fondos.Artes > fondos.Audiovisual && fondos.Artes > fondos.Becas) {
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

// 3. Renderizar valores en el DOM (Tarjetas y Tabla)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('totalRecaudado').textContent = `$${totalRecaudado.toFixed(2)}`;
    document.getElementById('progresoGeneral').textContent = `${porcentajeTotal}%`;
    document.getElementById('proyectoLider').textContent = proyectoLider;
    document.getElementById('cantidadDonantes').textContent = donaciones.length;

    // Llenar tabla de resumen
    const tbody = document.getElementById('tablaCuerpo');
    const areas = ['Audiovisual', 'Becas', 'Artes'];
    
    areas.forEach(area => {
        const recaudado = fondos[area] || 0;
        const meta = metas[area];
        const porcentaje = ((recaudado / meta) * 100).toFixed(2);

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${area}</td>
            <td>$${recaudado.toFixed(2)}</td>
            <td>$${meta.toFixed(2)}</td>
            <td>${porcentaje}%</td>
        `;
        tbody.appendChild(fila);
    });

    // 4. Inicializar Gráficos con Chart.js
    renderizarGraficos();
});

function renderizarGraficos() {
    // Gráfico 1: Barras (Recaudado vs Meta)
    const ctxBarras = document.getElementById('graficoBarras').getContext('2d');
    new Chart(ctxBarras, {
        type: 'bar',
        data: {
            labels: ['Audiovisual', 'Becas', 'Artes'],
            datasets: [
                {
                    label: 'Recaudado ($)',
                    data: [fondos.Audiovisual, fondos.Becas, fondos.Artes],
                    backgroundColor: 'rgba(2, 132, 199, 0.8)',
                    borderColor: '#0284c7',
                    borderWidth: 1
                },
                {
                    label: 'Meta ($)',
                    data: [metas.Audiovisual, metas.Becas, metas.Artes],
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

    // Gráfico 2: Dona (Métodos de Pago)
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
}