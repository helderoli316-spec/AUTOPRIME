const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ---------- configuração ----------

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    console.error("Defina DATABASE_URL e JWT_SECRET nas variáveis de ambiente.");
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // só use DB_SSL=true se conectar de fora do Railway (URL pública)
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

const app = express();

app.set("trust proxy", 1);          // o Railway fica na frente do servidor
app.use(express.json({ limit: "10kb" }));


// limita tentativas para dificultar força bruta
app.use("/api", rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas tentativas. Tente novamente em alguns minutos." }
}));


// ---------- API ----------

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


app.post("/api/register", async (req, res) => {

    const name     = String(req.body.name || "").trim();
    const email    = String(req.body.email || "").trim().toLowerCase();
    const phone    = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");

    if (name.split(" ").length < 2 || !emailRegex.test(email) || password.length < 6) {
        return res.status(400).json({ error: "Dados inválidos." });
    }

    try {
        const hash = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4)",
            [name, email, phone, hash]
        );

        res.status(201).json({ ok: true });

    } catch (error) {

        if (error.code === "23505") {
            return res.status(409).json({ error: "Este e-mail já está cadastrado." });
        }

        console.error(error);
        res.status(500).json({ error: "Erro no servidor. Tente novamente." });
    }
});


app.post("/api/login", async (req, res) => {

    const email    = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    try {
        const { rows } = await pool.query(
            "SELECT id, name, password_hash FROM users WHERE email = $1",
            [email]
        );

        const user = rows[0];

        // mesma mensagem para e-mail ou senha errados
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "E-mail ou senha incorretos." });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, name: user.name });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro no servidor. Tente novamente." });
    }
});


// ---------- site (arquivos da pasta public) ----------

app.use(express.static(path.join(__dirname, "public")));


// ---------- inicialização ----------

async function init() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id            SERIAL PRIMARY KEY,
            name          TEXT NOT NULL,
            email         TEXT UNIQUE NOT NULL,
            phone         TEXT,
            password_hash TEXT NOT NULL,
            created_at    TIMESTAMPTZ DEFAULT now()
        )
    `);
}


init()
    .then(() => app.listen(PORT, () => console.log("Auto Prime rodando na porta " + PORT)))
    .catch(error => {
        console.error("Erro ao conectar no banco:", error);
        process.exit(1);
    });
