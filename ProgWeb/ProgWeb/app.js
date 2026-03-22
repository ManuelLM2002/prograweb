// 
// 1. PRECARGA DE DATOS
// 
const citasIniciales = [
    { id: 1715000000000, especialidad: 'Medicina General', fecha: '2026-05-20', hora: '10:00', estado: 'Confirmada' },
    { id: 1715000000001, especialidad: 'Dermatología', fecha: '2026-05-25', hora: '12:00', estado: 'Pendiente' }
];

if (!localStorage.getItem('citas_san_rafael')) {
    localStorage.setItem('citas_san_rafael', JSON.stringify(citasIniciales));
}

function obtenerCitas() {
    return JSON.parse(localStorage.getItem('citas_san_rafael'));
}

function guardarCitas(citas) {
    localStorage.setItem('citas_san_rafael', JSON.stringify(citas));
}

// 
// 2. RUTEO
// 
const rutaActual = window.location.pathname;

// 
// PANEL (AGENDAR CITA)
// 
if (rutaActual.includes('panel.html')) {
    const formCita = document.getElementById('form-agendar');

    if (formCita) {
        formCita.addEventListener('submit', function(e) {
            e.preventDefault();

            const especialidad = document.getElementById('especialidad').value;
            const fecha = document.getElementById('fecha').value;
            const hora = document.getElementById('hora').value;

            const nuevaCita = {
                id: Date.now(),
                especialidad,
                fecha,
                hora,
                estado: 'Pendiente'
            };

            // Guardar temporal
            localStorage.setItem('cita_temp', JSON.stringify(nuevaCita));

            // Ir a pagos
            window.location.href = 'pagos.html';
        });
    }
}

// ==========================================
// CITAS (TABLA)
// ==========================================
if (rutaActual.includes('citas.html')) {

    function renderizarTabla() {
        const citas = obtenerCitas();
        const tbody = document.getElementById('tabla-citas-body');

        tbody.innerHTML = '';

        if (citas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-muted">No tienes citas programadas.</td></tr>';
            return;
        }

        citas.forEach(cita => {
            let colorEstado = cita.estado === 'Confirmada' ? 'bg-success' : 'bg-warning text-dark';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cita.especialidad}</td>
                <td>${cita.fecha}</td>
                <td>${cita.hora}</td>
                <td><span class="badge ${colorEstado}">${cita.estado}</span></td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="eliminarCita(${cita.id})">Cancelar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.eliminarCita = function(id) {
        if (confirm('¿Cancelar cita?')) {
            let citas = obtenerCitas();
            citas = citas.filter(c => c.id !== id);
            guardarCitas(citas);
            renderizarTabla();
        }
    };

    renderizarTabla();
}

// ==========================================
// PAGOS (VALIDACIONES + MODAL)
// ==========================================
if (rutaActual.includes('pagos.html')) {

    const formPago = document.getElementById('form-pago');

    const inputNombre = document.getElementById("nombre");
    const inputTarjeta = document.getElementById("tarjeta");
    const inputCvv = document.getElementById("cvv");

    // VALIDACIONES EN TIEMPO REAL
    if (inputNombre) {
        inputNombre.addEventListener("input", function () {
            this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ\s]/g, "");
            document.getElementById("error-nombre").textContent =
                this.value.length === 0 ? "El nombre es obligatorio" : "";
        });
    }

    if (inputTarjeta) {
        inputTarjeta.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "");
            this.value = this.value.replace(/(.{4})/g, "$1 ").trim();

            document.getElementById("error-tarjeta").textContent =
                this.value.length < 19 ? "Tarjeta incompleta" : "";
        });
    }

    if (inputCvv) {
        inputCvv.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "");
            document.getElementById("error-cvv").textContent =
                this.value.length < 3 ? "CVV inválido" : "";
        });
    }

    // MODAL
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmar'));

    if (formPago) {
        formPago.addEventListener("submit", function(e){
            e.preventDefault();
            modal.show();
        });
    }

    const btnConfirmar = document.getElementById("btn-confirmar-pago");

    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", function(){

            const citaTemp = JSON.parse(localStorage.getItem('cita_temp'));
            if (!citaTemp) return;

            const citas = obtenerCitas();
            citaTemp.estado = "Confirmada";

            citas.push(citaTemp);
            guardarCitas(citas);

            localStorage.removeItem('cita_temp');

            modal.hide();

            window.location.href = "citas.html";
        });
    }
}