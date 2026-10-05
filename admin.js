/* ================= PAINEL ADMINISTRATIVO ================= */

const token = localStorage.getItem("token");

const statusEl = document.querySelector("#status");

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const RED   = "#ed142b";
const GRAY  = "#8a8a93";
const TRACK = "#17171a";


// ---------- sessão ----------

function leave() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.replace("/");
}

document.querySelector("#logout").addEventListener("click", leave);

// sem token = nem tenta carregar
if (!token) {
    window.location.replace("/");
}

const savedName = localStorage.getItem("userName");

if (savedName) {
    document.querySelector("#adminName").textContent = "♔ " + savedName.split(" ")[0];
}


// ---------- utilidades ----------

const number = value => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 });

// escapa texto antes de colocar em SVG/HTML (nomes vêm de usuários!)
function esc(text) {
    return String(text).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

function monthLabel(value) {            // "2026-09" -> "set/26"
    const [year, month] = value.split("-");
    return MONTHS[Number(month) - 1] + "/" + year.slice(2);
}

function showEmpty(container, text) {
    container.innerHTML = `<div class="empty">${esc(text)}</div>`;
}


// ---------- gráfico de barras verticais (SVG) ----------

function barChart(container, items, average) {

    if (!items.length) {
        showEmpty(container, "Ainda não há dados para este gráfico.");
        return;
    }

    const W = 520, H = 260;
    const left = 34, right = 10, top = 28, bottom = 30;
    const plotW = W - left - right;
    const plotH = H - top - bottom;

    const biggest = Math.max(...items.map(i => i.value), average || 0, 1);
    const step    = Math.max(1, Math.ceil(biggest / 4));
    const max     = step * 4;

    const yOf = value => top + plotH - (value / max) * plotH;

    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de barras">`;

    // linhas de grade e valores do eixo Y
    for (let i = 0; i <= 4; i++) {

        const y = yOf(i * step);

        svg += `<line class="grid-line" x1="${left}" x2="${W - right}" y1="${y}" y2="${y}"/>`;
        svg += `<text class="axis-text" x="${left - 8}" y="${y + 4}" text-anchor="end">${i * step}</text>`;
    }

    // barras
    const slot  = plotW / items.length;
    const width = Math.min(48, slot * 0.6);

    items.forEach((item, index) => {

        const x = left + slot * index + (slot - width) / 2;
        const y = yOf(item.value);
        const h = top + plotH - y;

        svg += `<rect class="bar" x="${x}" y="${y}" width="${width}" height="${h}">
                    <title>${esc(item.label)}: ${item.value}</title>
                </rect>`;

        svg += `<text class="value-text" x="${x + width / 2}" y="${y - 7}" text-anchor="middle">${item.value}</text>`;
        svg += `<text class="axis-text" x="${x + width / 2}" y="${H - 9}" text-anchor="middle">${esc(item.label)}</text>`;
    });

    // linha da média
    if (average) {

        const y = yOf(average);

        svg += `<line class="avg-line" x1="${left}" x2="${W - right}" y1="${y}" y2="${y}"/>`;
        svg += `<text class="avg-text" x="${W - right}" y="${y - 6}" text-anchor="end">média ${number(average)}</text>`;
    }

    svg += "</svg>";

    container.innerHTML = svg;
}


// ---------- barras horizontais (modelos mais vendidos) ----------

function modelsChart(container, models) {

    if (!models.length) {
        showEmpty(container, "Nenhuma venda registrada ainda.");
        return;
    }

    container.textContent = "";

    const max = Math.max(...models.map(m => m.count));
    const fills = [];

    models.forEach(model => {

        const row = document.createElement("div");
        row.className = "hbar";

        const topLine = document.createElement("div");
        topLine.className = "hbar-top";

        const name  = document.createElement("span");
        const value = document.createElement("strong");

        name.textContent  = model.model;
        value.textContent = model.count;

        topLine.append(name, value);

        const track = document.createElement("div");
        track.className = "hbar-track";

        const fill = document.createElement("div");
        fill.className = "hbar-fill";

        track.appendChild(fill);
        row.append(topLine, track);
        container.appendChild(row);

        fills.push([fill, (model.count / max) * 100]);
    });

    // define a largura no próximo frame para a animação acontecer
    requestAnimationFrame(() => {
        fills.forEach(([fill, percent]) => { fill.style.width = percent + "%"; });
    });
}


// ---------- rosca (carros no site x vendidos) ----------

function donutChart(container, parts) {

    const total = parts.reduce((sum, part) => sum + part.value, 0);

    if (!total) {
        showEmpty(container, "Ainda não há carros cadastrados.");
        return;
    }

    const radius = 70;
    const circle = 2 * Math.PI * radius;

    let offset = 0;
    let rings  = "";

    parts.forEach(part => {

        const length = (part.value / total) * circle;

        if (length > 0) {
            rings += `<circle cx="100" cy="100" r="${radius}" fill="none"
                        stroke="${part.color}" stroke-width="26"
                        stroke-dasharray="${length} ${circle - length}"
                        stroke-dashoffset="${-offset}"
                        transform="rotate(-90 100 100)"/>`;
        }

        offset += length;
    });

    const legend = parts.map(part => `
        <div>
            <i style="background:${part.color}"></i>
            ${esc(part.label)}
            <strong>${number(part.value)}</strong>
        </div>`).join("");

    container.innerHTML = `
        <div class="donut">
            <svg viewBox="0 0 200 200" role="img" aria-label="Carros no site e vendidos">
                <circle cx="100" cy="100" r="${radius}" fill="none" stroke="${TRACK}" stroke-width="26"/>
                ${rings}
                <text class="center-number" x="100" y="106" text-anchor="middle">${number(total)}</text>
                <text class="center-label" x="100" y="124" text-anchor="middle">carros no total</text>
            </svg>
            <div class="legend">${legend}</div>
        </div>`;
}


// ---------- tabela de usuários ----------

let allUsers = [];

const usersBody  = document.querySelector("#usersBody");
const usersCount = document.querySelector("#usersCount");

function renderUsers(list) {

    usersBody.textContent = "";

    if (!list.length) {

        const row  = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 3;
        cell.className = "muted";
        cell.textContent = "Nenhum usuário encontrado.";

        row.appendChild(cell);
        usersBody.appendChild(row);

        return;
    }

    list.forEach(user => {

        const row = document.createElement("tr");

        const name  = document.createElement("td");
        const email = document.createElement("td");
        const date  = document.createElement("td");

        // textContent (nunca innerHTML): o nome vem de quem se cadastrou
        name.textContent  = user.name;
        email.textContent = user.email;

        date.className = "muted";
        date.textContent = new Date(user.created_at).toLocaleDateString("pt-BR");

        row.append(name, email, date);
        usersBody.appendChild(row);
    });
}

document.querySelector("#userSearch").addEventListener("input", function() {

    const term = this.value.toLowerCase().trim();

    renderUsers(allUsers.filter(user =>
        (user.name + " " + user.email).toLowerCase().includes(term)
    ));
});


// ---------- carregar os dados ----------

async function load() {

    try {

        const response = await fetch("/api/admin/stats", {
            headers: { Authorization: "Bearer " + token }
        });

        // não é admin (ou sessão vencida): volta para o site
        if (response.status === 401 || response.status === 403) {
            leave();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar.");
        }

        draw(data);

    } catch (error) {

        statusEl.textContent = error.message || "Sem conexão com o servidor.";
        statusEl.classList.add("error");
    }
}


function draw(data) {

    const { users, cars, sales } = data;

    // indicadores
    document.querySelector("#kpiUsers").textContent   = number(users.total);
    document.querySelector("#kpiCars").textContent    = number(cars.onSite);
    document.querySelector("#kpiSold").textContent    = number(cars.sold);
    document.querySelector("#kpiAverage").textContent = number(sales.average);

    // vendas por ano + linha da média
    barChart(
        document.querySelector("#chartYears"),
        sales.byYear.map(y => ({ label: String(y.year), value: y.count })),
        sales.average
    );

    document.querySelector("#yearNote").textContent = sales.byYear.length
        ? `Média de ${number(sales.average)} vendas por ano (${sales.byYear[0].year} a ${sales.byYear[sales.byYear.length - 1].year})`
        : "Nenhuma venda registrada ainda";

    // modelos mais vendidos
    modelsChart(document.querySelector("#chartModels"), sales.topModels);

    // carros no site x vendidos
    donutChart(document.querySelector("#chartCars"), [
        { label: "Carros no site", value: cars.onSite, color: GRAY },
        { label: "Carros vendidos", value: cars.sold,  color: RED  }
    ]);

    // cadastros por mês
    barChart(
        document.querySelector("#chartUsers"),
        users.byMonth.map(m => ({ label: monthLabel(m.month), value: m.count }))
    );

    // tabela
    allUsers = users.list;

    usersCount.textContent = users.total === 1
        ? "1 usuário cadastrado"
        : `${number(users.total)} usuários cadastrados`
          + (users.total > allUsers.length ? ` (mostrando os ${allUsers.length} mais recentes)` : "");

    renderUsers(allUsers);

    // mostra tudo
    document.querySelector("#kpis").hidden       = false;
    document.querySelector("#charts").hidden     = false;
    document.querySelector("#usersPanel").hidden = false;

    statusEl.textContent = "Atualizado em " + new Date().toLocaleString("pt-BR");
}


if (token) load();
