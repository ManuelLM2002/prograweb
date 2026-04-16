const express = require("express");
const cors = require("cors");
const fs = require("fs");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

// =========================
// CONEXIÓN A MYSQL
// =========================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "4132mzJ9",
    database: "hospital"
});

db.connect(err => {
    if (err) {
        console.error("Error DB:", err);
    } else {
        console.log("Conectado a MySQL");
    }
});

// =========================
// LOGIN
// =========================
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM usuarios WHERE username=? AND password=?";

    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length === 0) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const user = result[0];

        res.json({
            username: user.username,
            nombre: user.nombre,
            rol: user.rol || "Usuario"
        });
    });
});

// =========================
// REGISTRO (ARREGLADO)
// =========================
app.post("/registro", (req, res) => {
    const { username, password, nombre } = req.body;

    const nuevo = {
        username,
        password,
        nombre,
        rol: "Usuario"
    };

    db.query("INSERT INTO usuarios SET ?", nuevo, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        res.json({
            message: "Usuario creado",
            id: result.insertId,
            ...nuevo
        });
    });
});

// =========================
// CREAR USUARIO DESDE ADMIN (NUEVO Y CORRECTO)
// =========================
app.post("/usuarios", (req, res) => {
    const { username, password, nombre, rol } = req.body;

    const nuevo = {
        username,
        password,
        nombre,
        rol: rol || "Usuario"
    };

    db.query("INSERT INTO usuarios SET ?", nuevo, (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({
            message: "Usuario creado",
            id: result.insertId,
            ...nuevo
        });
    });
});

// =========================
// USUARIOS
// =========================
app.get("/usuarios", (req, res) => {
    db.query("SELECT * FROM usuarios", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// =========================
// EDITAR USUARIO
// =========================
app.put("/usuarios/:id", (req, res) => {
    const id = req.params.id;

    db.query("UPDATE usuarios SET ? WHERE id=?", [req.body, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Actualizado" });
    });
});

// =========================
// ELIMINAR USUARIO
// =========================
app.delete("/usuarios/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM usuarios WHERE id=?", [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Eliminado" });
    });
});

// =========================
// CITAS
// =========================
app.post("/citas", (req, res) => {
    const { especialidad, fecha, hora, usuario } = req.body;

    const nueva = {
        id: Date.now(),
        especialidad,
        fecha,
        hora,
        estado: "Confirmada",
        usuario
    };

    db.query("INSERT INTO citas SET ?", nueva, (err) => {
        if (err) return res.status(500).json(err);
        res.json(nueva);
    });
});

app.get("/citas", (req, res) => {
    db.query("SELECT * FROM citas", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.delete("/citas/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM citas WHERE id=?", [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Eliminada" });
    });
});

// =========================
// EXPORTAR
// =========================
app.get("/exportar-citas", (req, res) => {
    db.query("SELECT * FROM citas", (err, result) => {
        if (err) return res.status(500).json(err);

        fs.writeFileSync("citas.json", JSON.stringify(result, null, 2));
        res.json({ message: "Exportado correctamente" });
    });
});

// =========================
// SERVIDOR
// =========================
app.listen(3000, "0.0.0.0", () => {
    console.log("Servidor en http://192.168.0.10:3000");
});