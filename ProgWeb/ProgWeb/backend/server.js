const express = require("express");
const cors = require("cors");
const fs = require("fs"); // 👈 MOVER ARRIBA

app.use('/prograweb/ProgWeb/ProgWeb', express.static('/var/www/html/prograweb/ProgWeb/ProgWeb'));

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// 👤 USUARIOS
// =========================
let usuarios = [
    { id: 1, username: "admin@admin.com", password: "1234", nombre: "Administrador", rol: "Admin" },
    { id: 2, username: "miguel@gmail.com", password: "1234", nombre: "Miguel", rol: "Usuario" }
];

// =========================
// 📅 CITAS
// =========================
let citas = [];

// =========================
// 🔐 LOGIN
// =========================
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Faltan datos" });
    }

    const user = usuarios.find(u =>
        u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    res.json({
        username: user.username,
        nombre: user.nombre,
        rol: user.rol
    });
});

// =========================
// 📝 REGISTRO
// =========================
app.post("/registro", (req, res) => {
    const { username, password, nombre } = req.body;

    if (!username || !password || !nombre) {
        return res.status(400).json({ message: "Faltan datos" });
    }

    const existe = usuarios.find(u => u.username === username);
    if (existe) {
        return res.status(409).json({ message: "El usuario ya existe" });
    }

    const nuevo = {
        id: Date.now(),
        username,
        password,
        nombre,
        rol: "Usuario"
    };

    usuarios.push(nuevo);

    res.json({
        message: "Usuario creado",
        usuario: nuevo
    });
});

// =========================
// 📅 CREAR CITA (DESDE PAGOS)
// =========================
app.post("/citas", (req, res) => {
    const { especialidad, fecha, hora, usuario } = req.body;

    if (!especialidad || !fecha || !hora || !usuario) {
        return res.status(400).json({ message: "Faltan datos de la cita" });
    }

    const nueva = {
        id: Date.now(),
        especialidad,
        fecha,
        hora,
        estado: "Confirmada",
        usuario
    };

    citas.push(nueva);

    res.json(nueva);
});

// =========================
// 📥 TODAS LAS CITAS (ADMIN)
// =========================
app.get("/citas", (req, res) => {
    res.json(citas);
});

// =========================
// 📥 MIS CITAS (USUARIO)
// =========================
app.get("/mis-citas/:usuario", (req, res) => {
    const usuario = req.params.usuario;

    const misCitas = citas.filter(c => c.usuario === usuario);
    res.json(misCitas);
});

// =========================
// ❌ ELIMINAR CITA
// =========================
app.delete("/citas/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const existe = citas.find(c => c.id === id);
    if (!existe) {
        return res.status(404).json({ message: "Cita no encontrada" });
    }

    citas = citas.filter(c => c.id !== id);

    res.json({ message: "Cita eliminada" });
});

// =========================
// 👤 USUARIOS (ADMIN)
// =========================
app.get("/usuarios", (req, res) => {
    res.json(usuarios);
});

app.put("/usuarios/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { rol } = req.body;

    const user = usuarios.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.rol = rol;

    res.json({ message: "Rol actualizado", user });
});

app.delete("/usuarios/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const existe = usuarios.find(u => u.id === id);
    if (!existe) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    usuarios = usuarios.filter(u => u.id !== id);

    res.json({ message: "Usuario eliminado" });
});

// =========================
// 📤 EXPORTAR CITAS (RUBY)
// =========================
app.get("/exportar-citas", (req, res) => {
    fs.writeFileSync("citas.json", JSON.stringify(citas, null, 2));
    res.json({ message: "Citas exportadas a citas.json" });
});

// =========================
// 🚀 SERVIDOR (SIEMPRE AL FINAL)
// =========================
app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});