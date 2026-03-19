// ==========================================
// 1. PRECARGA DE DATOS (Simulación de Base de Datos)
// ==========================================

// Citas por defecto para que la tabla no esté vacía la primera vez
const citasIniciales = [
    { id: 1715000000000, especialidad: 'Medicina General', fecha: '2026-05-20', hora: '10:00', estado: 'Confirmada' },
    { id: 1715000000001, especialidad: 'Dermatología', fecha: '2026-05-25', hora: '12:00', estado: 'Pendiente' }
];

// Comprobamos si ya existen citas guardadas en el navegador. Si no, las creamos.
if (!localStorage.getItem('citas_san_rafael')) {
    localStorage.setItem('citas_san_rafael', JSON.stringify(citasIniciales));
}

// Funciones para leer y guardar datos fácilmente
function obtenerCitas() {
    return JSON.parse(localStorage.getItem('citas_san_rafael'));
}

function guardarCitas(citas) {
    localStorage.setItem('citas_san_rafael', JSON.stringify(citas));
}


// ==========================================
// 2. RUTEO (Saber en qué página estamos para ejecutar el código correcto)
// ==========================================
const rutaActual = window.location.pathname;

// ------------------------------------------
// LÓGICA PARA AGENDAR CITA (panel.html)
// ------------------------------------------
if (rutaActual.includes('panel.html')) {
    const formCita = document.getElementById('form-agendar');
    
    if (formCita) {
        formCita.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita que la página se recargue
            
            // 1. Capturamos lo que el usuario escribió
            const especialidad = document.getElementById('especialidad').value;
            const fecha = document.getElementById('fecha').value;
            const hora = document.getElementById('hora').value;

            // 2. Creamos un nuevo objeto (la nueva cita)
            const nuevaCita = {
                id: Date.now(), // Generamos un ID único usando la fecha y hora exacta
                especialidad: especialidad,
                fecha: fecha,
                hora: hora,
                estado: 'Pendiente'
            };

            // 3. Traemos las citas viejas, agregamos la nueva y volvemos a guardar
            const citas = obtenerCitas();
            citas.push(nuevaCita);
            guardarCitas(citas);

            // 4. Avisamos al usuario y lo mandamos a ver su tabla
            alert('¡Cita agendada con éxito!');
            window.location.href = 'citas.html'; 
        });
    }
}


// ------------------------------------------
// LÓGICA PARA VER Y ELIMINAR CITAS (citas.html)
// ------------------------------------------
if (rutaActual.includes('citas.html')) {
    
    function renderizarTabla() {
        const citas = obtenerCitas();
        const tbody = document.getElementById('tabla-citas-body');
        
        // Limpiamos el texto de "Cargando..."
        tbody.innerHTML = ''; 

        // Si no hay citas, mostramos un mensaje bonito
        if (citas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-muted">No tienes citas programadas.</td></tr>';
            return;
        }

        // Si hay citas, las dibujamos una por una en la tabla
        citas.forEach(cita => {
            // Decidimos el color de la etiqueta según el estado
            let colorEstado = cita.estado === 'Confirmada' ? 'bg-success' : 'bg-warning text-dark';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="align-middle">${cita.especialidad}</td>
                <td class="align-middle">${cita.fecha}</td>
                <td class="align-middle">${cita.hora}</td>
                <td class="align-middle"><span class="badge ${colorEstado}">${cita.estado}</span></td>
                <td class="align-middle">
                    <button class="btn btn-danger btn-sm shadow-sm" onclick="eliminarCita(${cita.id})">Cancelar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Función para borrar una cita (la hacemos global con 'window' para que el botón la encuentre)
    window.eliminarCita = function(id) {
        if (confirm('¿Estás seguro de cancelar esta cita? Esta acción no se puede deshacer.')) {
            let citas = obtenerCitas();
            // Filtramos las citas, guardando todas MENOS la que tiene el ID que queremos borrar
            citas = citas.filter(cita => cita.id !== id);
            guardarCitas(citas);
            renderizarTabla(); // Recargamos la tabla para que desaparezca visualmente
        }
    };

    // Al entrar a la página, dibujamos la tabla inmediatamente
    renderizarTabla();
}