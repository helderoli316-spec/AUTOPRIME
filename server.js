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

// e-mail que tem acesso ao painel de administrador
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "leviangelo.celular@gmail.com")
    .trim()
    .toLowerCase();

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
            "SELECT id, name, email, password_hash FROM users WHERE email = $1",
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

        // "admin" só serve para o navegador decidir para onde ir;
        // quem protege os dados de verdade é o middleware requireAdmin
        res.json({ token, name: user.name, admin: user.email === ADMIN_EMAIL });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro no servidor. Tente novamente." });
    }
});



// ---------- ADMINISTRADOR ----------

// confere o token E confere no banco se o dono do token é o administrador
async function requireAdmin(req, res, next) {

    const header = req.headers.authorization || "";
    const token  = header.startsWith("Bearer ") ? header.slice(7) : "";

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

        const { rows } = await pool.query(
            "SELECT email FROM users WHERE id = $1",
            [payload.id]
        );

        if (!rows[0]) {
            return res.status(401).json({ error: "Sessão inválida." });
        }

        if (rows[0].email !== ADMIN_EMAIL) {
            return res.status(403).json({ error: "Acesso negado." });
        }

        next();

    } catch (error) {
        res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
    }
}


app.get("/api/admin/stats", requireAdmin, async (req, res) => {

    res.set("Cache-Control", "no-store");

    try {
        const [users, usersTotal, usersByMonth, cars, sales, salesByYear, topModels] = await Promise.all([

            pool.query(`
                SELECT id, name, email, created_at
                FROM users
                ORDER BY created_at DESC
                LIMIT 500
            `),

            pool.query("SELECT COUNT(*)::int AS total FROM users"),

            // últimos 6 meses, incluindo meses sem cadastro (valor 0)
            pool.query(`
                SELECT to_char(m, 'YYYY-MM') AS month, COUNT(u.id)::int AS count
                FROM generate_series(
                         date_trunc('month', now()) - interval '5 months',
                         date_trunc('month', now()),
                         interval '1 month'
                     ) AS m
                LEFT JOIN users u ON date_trunc('month', u.created_at) = m
                GROUP BY m
                ORDER BY m
            `),

            pool.query("SELECT COUNT(*)::int AS total FROM cars"),

            pool.query("SELECT COUNT(*)::int AS total FROM sales"),

            pool.query(`
                SELECT EXTRACT(YEAR FROM sold_at)::int AS year, COUNT(*)::int AS count
                FROM sales
                GROUP BY year
                ORDER BY year
            `),

            pool.query(`
                SELECT model, COUNT(*)::int AS count
                FROM sales
                GROUP BY model
                ORDER BY count DESC, model
                LIMIT 8
            `)
        ]);

        // preenche anos sem venda com 0 e calcula a média por ano
        const byYear = [];
        const found  = salesByYear.rows;

        if (found.length) {
            for (let y = found[0].year; y <= found[found.length - 1].year; y++) {
                const row = found.find(r => r.year === y);
                byYear.push({ year: y, count: row ? row.count : 0 });
            }
        }

        const soldTotal = sales.rows[0].total;
        const average   = byYear.length ? soldTotal / byYear.length : 0;

        res.json({
            users: {
                total:   usersTotal.rows[0].total,
                list:    users.rows,
                byMonth: usersByMonth.rows
            },
            cars: {
                onSite: cars.rows[0].total,
                sold:   soldTotal
            },
            sales: {
                total:   soldTotal,
                average: Math.round(average * 10) / 10,
                byYear,
                topModels: topModels.rows
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao carregar os dados." });
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

    // carros do site
    await pool.query(`
        CREATE TABLE IF NOT EXISTS cars (
            id      SERIAL PRIMARY KEY,
            name    TEXT UNIQUE NOT NULL,
            version TEXT,
            year    INT,
            km      INT,
            price   NUMERIC(12,2)
        )
    `);

    // uma linha por carro vendido
    await pool.query(`
        CREATE TABLE IF NOT EXISTS sales (
            id      SERIAL PRIMARY KEY,
            model   TEXT NOT NULL,
            price   NUMERIC(12,2),
            sold_at DATE NOT NULL DEFAULT CURRENT_DATE
        )
    `);

    await seedCars();

    if (process.env.SEED_DEMO === "true") {
        await seedDemoSales();
    }
}


// cadastra os 4 carros que hoje aparecem no site (só se ainda não existirem)
async function seedCars() {

    const initial = [
        ["Volkswagen Golf GTI",  "2.0 TSI DSG",       2021, 42000, 189900],
        ["Toyota Corolla GR-S",  "2.0 Dynamic Force", 2023, 29000, 169900],
        ["BMW X1 sDrive20i",     "2.0 Turbo",         2022, 35000, 219900],
        ["Jeep Compass S",       "1.3 T270 Turbo",    2022, 31000, 179900]
    ];

    for (const car of initial) {
        await pool.query(
            `INSERT INTO cars (name, version, year, km, price)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (name) DO NOTHING`,
            car
        );
    }
}


// SOMENTE PARA TESTE: cria vendas fictícias para você ver os gráficos.
// Só roda com SEED_DEMO=true e só se a tabela estiver vazia.
async function seedDemoSales() {

    const { rows } = await pool.query("SELECT COUNT(*)::int AS total FROM sales");

    if (rows[0].total > 0) return;

    const models = [
        ["Toyota Corolla GR-S", 169900],
        ["Jeep Compass S",      179900],
        ["Volkswagen Golf GTI", 189900],
        ["BMW X1 sDrive20i",    219900],
        ["Honda Civic Touring", 159900],
        ["Hyundai HB20 Platinum", 89900]
    ];

    // pesos diferentes para os modelos terem vendas diferentes
    const weights = [30, 24, 18, 10, 12, 6];

    const names = [], prices = [], dates = [];
    const now = new Date();

    for (let i = 0; i < 120; i++) {

        let r = Math.random() * 100, index = 0;

        while (r > weights[index]) { r -= weights[index]; index++; }

        // data aleatória nos últimos ~4 anos
        const days = Math.floor(Math.random() * 365 * 4);
        const date = new Date(now.getTime() - days * 86400000);

        names.push(models[index][0]);
        prices.push(models[index][1]);
        dates.push(date.toISOString().slice(0, 10));
    }

    await pool.query(
        `INSERT INTO sales (model, price, sold_at)
         SELECT * FROM unnest($1::text[], $2::numeric[], $3::date[])`,
        [names, prices, dates]
    );
}


init()
    .then(() => app.listen(PORT, () => console.log("Auto Prime rodando na porta " + PORT)))
    .catch(error => {
        console.error("Erro ao conectar no banco:", error);
        process.exit(1);
    });
