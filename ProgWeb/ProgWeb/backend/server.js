const nodemailer = require("nodemailer");
const paypal = require("@paypal/checkout-server-sdk");

// CONFIGURAR PAYPAL
const environment = new paypal.core.SandboxEnvironment(
    "AY9FVZLT7BP0qRIGRBStw0wQnfR1v0sR0ZO9qhTfUTJCQb3nf8Cbz7750piRN1-96ZN0Rz4oXPYLyzrn",
    "EA0d-JryPHE7JG1Yiz-F2gXxT_BtFjFby0foAx_j3ucS0N6EeacEQmK2QrNezAZuzpBJ9Sp1EgEFWSdY"
);

const client = new paypal.core.PayPalHttpClient(environment);

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const mysql = require("mysql2");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..'));

// Crear orden de paypal
app.post("/crear-orden", async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");

    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
            amount: {
                currency_code: "MXN",
                value: "500" // precio cita
            }
        }]
    });

    try {
        const order = await client.execute(request);
        res.json({ id: order.result.id });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creando orden");
    }
});

// Capturar orden
app.post("/capturar-orden", async (req, res) => {
    const { orderID, cita } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        await client.execute(request);

        // S
        const nueva = {
            id: Date.now(),
            especialidad: cita.especialidad,
            fecha: cita.fecha,
            hora: cita.hora,
            estado: "Confirmada",
            usuario: cita.usuario
        };

        db.query("INSERT INTO citas SET ?", nueva, (err) => {
            if (err) return res.status(500).json(err);

            res.json({ message: "Pago exitoso y cita guardada" });
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error capturando pago");
    }
});

app.get("/pagos-paypal", (req, res) => {
    res.render("pagos-paypal");
});

app.get("/pago-exitoso", (req, res) => res.render("pago-exitoso"));

// VALIDACIÓN DE CONTRASEÑA SEGURA
function validarPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;
    return regex.test(password);
}

// RUTAS DE VISTAS FRONTEND (Agregadas)

app.get("/", (req, res) => {
    res.render("login"); 
});
app.get("/inicio", (req, res) => res.render("inicio"));
app.get("/login", (req, res) => res.render("login"));
app.get("/registro", (req, res) => res.render("registro"));
app.get("/panel", (req, res) => res.render("panel"));
app.get("/mis-citas-view", (req, res) => res.render("citas"));
app.get("/galeria", (req, res) => res.render("galeria"));
app.get("/pagos", (req, res) => res.render("pagos"));
app.get("/admin", (req, res) => res.render("admin"));


// CONEXIÓN A MYSQL
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

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "clinicahospitalsanrafael@gmail.com",
        pass: "wwcs tyvx vega utzt"
    }
});

// LOGIN

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

// REGISTRO 
app.post("/registro", (req, res) => {
    const { username, password, nombre } = req.body;

    if (!validarPassword(password)) {
        return res.status(400).json({
            message: "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial"
        });
    }

    const nuevo = {
        username,
        password,
        nombre,
        rol: "Usuario"
    };

    db.query("INSERT INTO usuarios SET ?", nuevo, (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({
            message: "Usuario creado",
            usuario: nuevo
        });
    });
});

// CREAR USUARIO DESDE ADMIN 
app.post("/usuarios", (req, res) => {
    const { username, password, nombre, rol } = req.body;

    if (!validarPassword(password)) {
        return res.status(400).json({
            message: "Contraseña insegura (mínimo 8 caracteres, mayúscula, número y símbolo)"
        });
    }

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

// USUARIOS
app.get("/usuarios", (req, res) => {
    db.query("SELECT * FROM usuarios", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// EDITAR USUARIO
app.put("/usuarios/:id", (req, res) => {
    const id = req.params.id;

    db.query("UPDATE usuarios SET ? WHERE id=?", [req.body, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Actualizado" });
    });
});

// ELIMINAR USUARIO
app.delete("/usuarios/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM usuarios WHERE id=?", [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Eliminado" });
    });
});



app.get("/test-correo", async (req, res) => {
    try {
        await transporter.sendMail({
            from: '"Prueba" <clinicahospitalsanrafael@gmail.com>',
            to: "miguel.angel.g1233@gmail.com",
            subject: "PRUEBA",
            text: "Si ves esto, funciona"
        });

        res.send("Correo enviado");
    } catch (err) {
        console.error(err);
        res.send("Error");
    }
});





// CITAS (Enviar confirmación por correo)
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

    db.query("INSERT INTO citas SET ?", nueva, async (err) => {
        if (err) return res.status(500).json(err);

        // ✉️ ENVIAR CORREO
        try {
            await transporter.sendMail({
                from: '"Clínica San Rafael" <TU_CORREO@gmail.com>',
                to: usuario,
                subject: "Confirmación de cita médica",
                html: `
                    <h2>✅ Cita Confirmada</h2>
                    <p>Hola, tu cita ha sido registrada correctamente:</p>

                    <ul>
                        <li><b>Especialidad:</b> ${especialidad}</li>
                        <li><b>Fecha:</b> ${new Date(fecha).toLocaleDateString()}</li>
                        <li><b>Hora:</b> ${hora}</li>
                    </ul>

                    <p>Gracias por confiar en Clínica San Rafael 🏥</p>
                `
            });

            console.log("Correo enviado");
        } catch (error) {
            console.error("Error enviando correo:", error);
        }

        res.json(nueva);
    });
});

app.get("/citas", (req, res) => {
    db.query("SELECT * FROM citas", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// MIS CITAS (POR USUARIO - Agregado)
app.get("/mis-citas/:correo", (req, res) => {
    const correo = req.params.correo;
    db.query("SELECT * FROM citas WHERE usuario=?", [correo], (err, result) => {
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

// EXPORTAR
app.get("/exportar-citas", (req, res) => {
    db.query("SELECT * FROM citas", (err, result) => {
        if (err) return res.status(500).json(err);

        fs.writeFileSync("citas.json", JSON.stringify(result, null, 2));
        res.json({ message: "Exportado correctamente" });
    });
});

// SERVIDOR
app.listen(3000, "0.0.0.0", () => {
    console.log("Servidor en http://localhost:3000");
});