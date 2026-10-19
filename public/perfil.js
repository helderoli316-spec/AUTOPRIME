/* ================= TELA DE PERFIL ================= */

const token = localStorage.getItem("token");

const $ = selector => document.querySelector(selector);

const statusEl = $("#status");


// ---------- sessão ----------

function leave() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.replace("/");
}

$("#logout").addEventListener("click", leave);

// só entra quem está logado
if (!token) {
    window.location.replace("/");
}


// ---------- utilidades ----------

const money = value => Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
});

const date = value => new Date(value).toLocaleDateString("pt-BR");


async function api(path, options = {}) {

    const response = await fetch(path, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        }
    });

    // sessão vencida: volta para o site
    if (response.status === 401) {
        leave();
        throw new Error("Sessão expirada.");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Erro ao falar com o servidor.");
    }

    return data;
}


// ---------- dados na tela ----------

let state = { user: null, favorites: [], purchases: [], listings: [] };


function renderUser() {

    const { name, email, phone, avatar, created_at } = state.user;

    $("#infoName").textContent  = name;
    $("#infoEmail").textContent = email;
    $("#infoPhone").textContent = phone || "Não informado";
    $("#infoSince").textContent = date(created_at);

    $("#avatarLetter").textContent = name.trim().charAt(0).toUpperCase();

    $("#avatarPhoto").hidden  = !avatar;
    $("#avatarLetter").hidden = Boolean(avatar);
    $("#avatarRemove").hidden = !avatar;

    if (avatar) $("#avatarPhoto").src = avatar;

    localStorage.setItem("userName", name);
}


// monta um cartão de carro (textContent: nunca innerHTML com dados de usuário)
function carCard(car, { note, onRemove } = {}) {

    const card = document.createElement("article");
    card.className = "p-car";

    const title = document.createElement("h3");
    title.textContent = car.name;

    const specs = document.createElement("p");
    specs.className = "p-specs";
    specs.textContent = [
        car.version,
        car.year,
        car.km != null ? Number(car.km).toLocaleString("pt-BR") + " km" : ""
    ].filter(Boolean).join(" • ");

    card.append(title);

    if (specs.textContent) card.append(specs);

    if (car.price != null) {
        const price = document.createElement("strong");
        price.textContent = money(car.price);
        card.append(price);
    }

    if (note) {
        const small = document.createElement("p");
        small.className = "p-note";
        small.textContent = note;
        card.append(small);
    }

    if (onRemove) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "btn-link";
        remove.textContent = "Remover anúncio";
        remove.addEventListener("click", () => onRemove(remove));
        card.append(remove);
    }

    return card;
}


function fillList(container, cars, emptyText, options) {

    container.textContent = "";

    if (!cars.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = emptyText;
        container.append(empty);
        return;
    }

    cars.forEach(car => container.append(carCard(car, options ? options(car) : {})));
}


function renderLists() {

    fillList(
        $("#listPurchases"),
        state.purchases,
        "Você ainda não comprou nenhum carro.",
        car => ({ note: "Comprado em " + date(car.sold_at) })
    );

    fillList(
        $("#listFavorites"),
        state.favorites,
        "Você ainda não favoritou nenhum carro. Clique no ♡ de um carro no site."
    );

    fillList(
        $("#listListings"),
        state.listings,
        "Você ainda não anunciou nenhum carro.",
        car => ({
            note: "Anunciado em " + date(car.created_at),
            onRemove: button => removeListing(car.id, button)
        })
    );

    $("#countPurchases").textContent = state.purchases.length;
    $("#countFavorites").textContent = state.favorites.length;
    $("#countListings").textContent  = state.listings.length;
}


// ---------- abas ----------

document.querySelectorAll(".tab").forEach(tab => {

    tab.addEventListener("click", () => {

        document.querySelectorAll(".tab").forEach(t =>
            t.classList.toggle("active", t === tab)
        );

        document.querySelectorAll(".tab-panel").forEach(panel => {
            panel.hidden = panel.id !== "tab-" + tab.dataset.tab;
        });
    });
});


// ---------- avatar ----------

const avatarMsg = $("#avatarMsg");

function avatarMessage(text, ok) {
    avatarMsg.textContent = text;
    avatarMsg.style.color = ok ? "#5bc96b" : "#ff4d5e";
}


// recorta no centro e reduz para 256x256 JPEG (fica leve para enviar e guardar)
function resizeImage(file) {

    return new Promise((resolve, reject) => {

        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {

            const size = 256;
            const side = Math.min(img.width, img.height);

            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;

            canvas.getContext("2d").drawImage(
                img,
                (img.width - side) / 2, (img.height - side) / 2, side, side,
                0, 0, size, size
            );

            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Não foi possível ler essa imagem."));
        };

        img.src = url;
    });
}


$("#avatarFile").addEventListener("change", async function() {

    const file = this.files[0];
    this.value = "";                         // permite escolher o mesmo arquivo de novo

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        avatarMessage("Escolha um arquivo de imagem.", false);
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        avatarMessage("A imagem deve ter até 10 MB.", false);
        return;
    }

    try {

        avatarMessage("Enviando...", true);

        const image = await resizeImage(file);

        await api("/api/me/avatar", {
            method: "PUT",
            body: JSON.stringify({ image })
        });

        state.user.avatar = image;
        renderUser();
        avatarMessage("Foto atualizada!", true);

    } catch (error) {
        avatarMessage(error.message, false);
    }
});


$("#avatarRemove").addEventListener("click", async () => {

    try {
        await api("/api/me/avatar", { method: "DELETE" });

        state.user.avatar = null;
        renderUser();
        avatarMessage("Foto removida.", true);

    } catch (error) {
        avatarMessage(error.message, false);
    }
});


// ---------- anunciar carro ----------

const sellForm = $("#sellForm");
const sellMsg  = $("#sellMsg");

$("#toggleSell").addEventListener("click", () => {
    sellForm.hidden = !sellForm.hidden;
    if (!sellForm.hidden) $("#sellName").focus();
});


sellForm.addEventListener("submit", async event => {

    event.preventDefault();

    sellMsg.className = "sell-msg";
    sellMsg.textContent = "";

    const body = {
        name:    $("#sellName").value.trim(),
        version: $("#sellVersion").value.trim(),
        year:    $("#sellYear").value,
        km:      $("#sellKm").value,
        price:   $("#sellPrice").value
    };

    if (body.name.length < 3 || !body.year || body.km === "" || !body.price) {
        sellMsg.textContent = "Preencha modelo, ano, km e preço.";
        return;
    }

    const button = sellForm.querySelector("button[type=submit]");
    button.disabled = true;

    try {

        const listing = await api("/api/me/listings", {
            method: "POST",
            body: JSON.stringify(body)
        });

        state.listings.unshift(listing);
        renderLists();

        sellForm.reset();
        sellForm.hidden = true;

    } catch (error) {

        sellMsg.textContent = error.message;

    } finally {

        button.disabled = false;
    }
});


async function removeListing(id, button) {

    if (!confirm("Remover este anúncio?")) return;

    button.disabled = true;

    try {
        await api("/api/me/listings/" + id, { method: "DELETE" });

        state.listings = state.listings.filter(item => item.id !== id);
        renderLists();

    } catch (error) {
        button.disabled = false;
        alert(error.message);
    }
}


// ---------- carregar ----------

async function load() {

    try {

        state = await api("/api/me");

        renderUser();
        renderLists();

        $("#userCard").hidden   = false;
        $("#tabsPanel").hidden  = false;

        statusEl.textContent = "Olá, " + state.user.name.split(" ")[0] + "!";

    } catch (error) {

        statusEl.textContent = error.message || "Sem conexão com o servidor.";
        statusEl.classList.add("error");
    }
}


if (token) load();
