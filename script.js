

// a lista "cars" vem do cars.js (carregado antes deste arquivo no index.html)


const heroCars = [

    {
        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/BMW%20X1%20%282022-present%29.jpg?width=640"
    },


    {
        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Volkswagen%20Golf%20GTI%20%282021%29%20%2852926196503%29.jpg?width=640"
    },


    {
        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/2023%20Toyota%20Corolla%20Altis%20HEV%20GR%20Sport.jpg?width=640"
    }

];


let currentSlide = 0;

// nomes dos carros favoritados pelo usuário logado
const favorites = new Set();




const carsGrid =
    document.querySelector("#carsGrid");


let visibleCars = cars;


function renderCars(list = cars) {

    visibleCars = list;

    carsGrid.innerHTML = "";


    list.forEach((car, index) => {

        const card =
            document.createElement("article");


        card.className = "car-card";


        card.innerHTML = `

            <div class="car-image" data-index="${index}" title="Ver detalhes">

                <span class="car-tag">
                    SEMINOVO
                </span>


                <button
                    class="favorite"
                    title="Favoritar"
                >
                    ♡
                </button>


                <img
                    src="${car.image}"
                    alt="${car.name}"
                    loading="lazy"
                    decoding="async"
                >

            </div>


            <div class="car-info">

                <h3>
                    ${car.name}
                </h3>


                <div class="car-specs">

                    ${car.version}

                    &nbsp; • &nbsp;

                    ${car.year}

                    &nbsp; • &nbsp;

                    ${car.km}

                </div>


                <div class="car-bottom">

                    <strong class="car-price">
                        ${car.price}
                    </strong>


                    <button
                        class="details-button"
                        data-index="${index}"
                    >
                        Ver detalhes →
                    </button>

                </div>

            </div>

        `;


        const heart = card.querySelector(".favorite");

        heart.dataset.name = car.name;
        paintFavorite(heart, favorites.has(car.name));

        carsGrid.appendChild(card);

    });


}


renderCars();


// um único listener para todos os cards (delegação de eventos)
carsGrid.addEventListener("click", event => {

    // coração: favoritar (não abre os detalhes)
    const favorite = event.target.closest(".favorite");

    if (favorite) {
        toggleFavorite(favorite);
        return;
    }

    // foto, título ou botão: abre a tela do carro
    const opener = event.target.closest(".details-button, .car-image, .car-info h3");

    if (opener) {

        const card  = opener.closest(".car-card");
        const index = card.querySelector(".details-button").dataset.index;

        openCar(visibleCars[index]);
    }
});


/* ================= TELA DO CARRO (foto + informações) ================= */

const carModal    = document.querySelector("#carModal");
const carFavorite = document.querySelector("#carFavorite");

let openedCar = null;


function openCar(car) {

    openedCar = car;

    const image = document.querySelector("#carModalImage");

    image.src = car.image;
    image.alt = car.name;

    document.querySelector("#carModalTitle").textContent   = car.name;
    document.querySelector("#carModalVersion").textContent = car.version;
    document.querySelector("#carModalPrice").textContent   = car.price;
    document.querySelector("#carModalYear").textContent    = car.year;
    document.querySelector("#carModalKm").textContent      = car.km;
    document.querySelector("#carModalEngine").textContent  = car.version;

    document.querySelector("#carModalLink").href = "veiculo.html?id=" + car.id;

    paintCarFavorite();

    carModal.classList.add("open");
    carModal.setAttribute("aria-hidden", "false");

    document.querySelector("#closeCar").focus();
}


function closeCar() {
    carModal.classList.remove("open");
    carModal.setAttribute("aria-hidden", "true");
    openedCar = null;
}


function paintCarFavorite() {

    if (!openedCar) return;

    const liked = favorites.has(openedCar.name);

    carFavorite.textContent = liked ? "♥ Nos favoritos" : "♡ Favoritar";
}


document.querySelector("#closeCar").addEventListener("click", closeCar);

// fecha clicando no fundo escuro ou apertando ESC
carModal.addEventListener("click", event => {
    if (event.target === carModal) closeCar();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCar();
});


carFavorite.addEventListener("click", async () => {

    if (!openedCar) return;

    // favoritar exige login
    if (!authToken) {
        closeCar();
        openLogin();
        return;
    }

    const heart = [...document.querySelectorAll(".favorite")]
        .find(button => button.dataset.name === openedCar.name);

    if (!heart) return;

    const pending = toggleFavorite(heart);

    paintCarFavorite();

    await pending;

    paintCarFavorite();
});


document
    .querySelector("#searchForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const search =
                document
                    .querySelector("#searchInput")
                    .value
                    .toLowerCase()
                    .trim();


            if (!search) {

                renderCars(cars);

                return;

            }


            const results =
                cars.filter(car => {

                    return (

                        car.name +
                        " " +
                        car.version +
                        " " +
                        car.year

                    )
                    .toLowerCase()
                    .includes(search);

                });


            renderCars(results);


            if (results.length === 0) {

                alert(
                    "Nenhum veículo encontrado.\n\n" +
                    "Tente:\n" +
                    "Golf\n" +
                    "Corolla\n" +
                    "BMW\n" +
                    "Compass"
                );

            }

        }
    );




document
    .querySelector("#showAll")
    .addEventListener(
        "click",
        function() {

            renderCars(cars);

            document
                .querySelector("#veiculos")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


const heroImage =
    document.querySelector("#heroImage");


const dots =
    document.querySelectorAll(
        ".slider-dots span"
    );


function changeSlide(direction) {

    currentSlide += direction;


    if (currentSlide < 0) {

        currentSlide =
            heroCars.length - 1;

    }


    if (
        currentSlide >=
        heroCars.length
    ) {

        currentSlide = 0;

    }


    heroImage.style.opacity = "0";


    setTimeout(() => {

        heroImage.src =
            heroCars[currentSlide].image;

        heroImage.style.opacity = "1";

    }, 200);


    dots.forEach(
        (dot, index) => {

            dot.classList.toggle(
                "active",
                index === currentSlide
            );

        }
    );

}


document
    .querySelector("#previous")
    .addEventListener(
        "click",
        () => changeSlide(-1)
    );


document
    .querySelector("#next")
    .addEventListener(
        "click",
        () => changeSlide(1)
    );


const chat =
    document.querySelector("#chat");


const closeChat =
    document.querySelector("#closeChat");


const openChat =
    document.querySelector("#openChat");


closeChat.addEventListener(
    "click",
    function() {

        chat.style.display = "none";

    }
);


openChat.addEventListener(
    "click",
    function() {

        chat.style.display = "block";

    }
);


document
    .querySelectorAll(".quick-option")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                sendMessage(
                    this.textContent
                );

            }
        );

    });


document
    .querySelector("#chatForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const input =
                document.querySelector(
                    "#chatInput"
                );


            sendMessage(input.value);


            input.value = "";

        }
    );


function sendMessage(text) {

    if (!text.trim()) {
        return;
    }


    const content =
        document.querySelector(
            "#chatContent"
        );


    const user =
        document.createElement("div");


    user.className =
        "message";


    user.textContent =
        text;


    content.appendChild(user);


    setTimeout(() => {

        const response =
            document.createElement("div");


        response.className =
            "message";


        response.textContent =

            "Claro! Posso te ajudar " +
            "com isso. 🚗 " +
            "Escolha um dos veículos " +
            "disponíveis ou fale com " +
            "um de nossos atendentes.";


        content.appendChild(response);


        content.scrollTop =
            content.scrollHeight;

    }, 500);

}



/* ================= CADASTRO ================= */

const registerModal = document.querySelector("#registerModal");
const registerForm  = document.querySelector("#registerForm");
const successMsg    = document.querySelector("#registerSuccess");


function openRegister() {
    registerModal.classList.add("open");
    registerModal.setAttribute("aria-hidden", "false");
    document.querySelector("#regName").focus();
}


function closeRegister() {
    registerModal.classList.remove("open");
    registerModal.setAttribute("aria-hidden", "true");
}


document.querySelector("#openRegister").addEventListener("click", openRegister);
document.querySelector("#closeRegister").addEventListener("click", closeRegister);


// fecha clicando no fundo escuro ou apertando ESC
registerModal.addEventListener("click", event => {
    if (event.target === registerModal) closeRegister();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeRegister();
});


// máscara do telefone: (85) 99999-9999
document.querySelector("#regPhone").addEventListener("input", function() {

    let n = this.value.replace(/\D/g, "").slice(0, 11);

    if (n.length > 6) {
        n = `(${n.slice(0, 2)}) ${n.slice(2, n.length - 4)}-${n.slice(-4)}`;
    } else if (n.length > 2) {
        n = `(${n.slice(0, 2)}) ${n.slice(2)}`;
    }

    this.value = n;
});


// mostra ou limpa a mensagem de erro de um campo
function setError(input, message) {

    const small = input.closest("label").querySelector(".error");

    small.textContent = message;
    input.classList.toggle("invalid", Boolean(message));

    return !message;
}


registerForm.addEventListener("submit", async function(event) {

    event.preventDefault();
    successMsg.textContent = "";

    const name     = document.querySelector("#regName");
    const email    = document.querySelector("#regEmail");
    const phone    = document.querySelector("#regPhone");
    const password = document.querySelector("#regPassword");
    const confirm  = document.querySelector("#regConfirm");
    const terms    = document.querySelector("#regTerms");

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const phoneDigits = phone.value.replace(/\D/g, "").length;

    const results = [

        setError(name,
            name.value.trim().split(" ").length >= 2
                ? "" : "Digite nome e sobrenome."),

        setError(email,
            emailOk ? "" : "Digite um e-mail válido."),

        setError(phone,
            phoneDigits >= 10 ? "" : "Digite um telefone com DDD."),

        setError(password,
            password.value.length >= 6
                ? "" : "A senha precisa ter ao menos 6 caracteres."),

        setError(confirm,
            confirm.value === password.value && confirm.value
                ? "" : "As senhas não coincidem.")

    ];

    const termsOk = terms.checked;

    document.querySelector("#termsError").textContent =
        termsOk ? "" : "Você precisa aceitar os termos.";


    // se algum campo falhou, para aqui
    if (results.includes(false) || !termsOk) return;


    const button = registerForm.querySelector(".submit-button");
    button.disabled = true;

    try {

        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phone.value,
                password: password.value
            })
        });

        const data = await response.json();

        if (!response.ok) {

            if (response.status === 409) {
                setError(email, data.error);
            } else {
                showMessage(successMsg, data.error || "Não foi possível criar a conta.", false);
            }

            return;
        }

        // o cadastro já entra logado: guarda a sessão e volta para a tela inicial
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name);

        showMessage(
            successMsg,
            `Conta criada com sucesso, ${data.name.split(" ")[0]}! 🎉`,
            true
        );

        registerForm.reset();

        setTimeout(goHome, 1200);

    } catch (error) {

        showMessage(successMsg, "Sem conexão com o servidor. Tente novamente.", false);

    } finally {

        button.disabled = false;
    }
});




/* ================= LOGIN ================= */

const loginModal = document.querySelector("#loginModal");
const loginForm  = document.querySelector("#loginForm");
const loginOk    = document.querySelector("#loginSuccess");


function openLogin() {
    loginModal.classList.add("open");
    loginModal.setAttribute("aria-hidden", "false");
    document.querySelector("#loginEmail").focus();
}


function closeLogin() {
    loginModal.classList.remove("open");
    loginModal.setAttribute("aria-hidden", "true");
}


document.querySelector("#openLogin").addEventListener("click", openLogin);
document.querySelector("#closeLogin").addEventListener("click", closeLogin);


// fecha clicando no fundo escuro ou apertando ESC
loginModal.addEventListener("click", event => {
    if (event.target === loginModal) closeLogin();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeLogin();
});


// link "Criar conta" dentro do login: troca de modal
document.querySelector("#goToRegister").addEventListener("click", event => {
    event.preventDefault();
    closeLogin();
    openRegister();
});


loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();
    loginOk.textContent = "";

    const email    = document.querySelector("#loginEmail");
    const password = document.querySelector("#loginPassword");

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

    const results = [

        setError(email,
            emailOk ? "" : "Digite um e-mail válido."),

        setError(password,
            password.value ? "" : "Digite sua senha.")

    ];

    if (results.includes(false)) return;


    const button = loginForm.querySelector(".submit-button");
    button.disabled = true;

    try {

        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.value.trim(),
                password: password.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(loginOk, data.error || "Não foi possível entrar.", false);
            return;
        }

        // guarda a sessão no navegador
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name);

        // administrador: vai direto para o painel
        if (data.admin) {

            showMessage(loginOk, "Acesso de administrador! Abrindo o painel...", true);

            setTimeout(() => { window.location.href = "/admin.html"; }, 800);

            return;
        }

        showMessage(loginOk, `Bem-vindo, ${data.name.split(" ")[0]}! 🎉`, true);

        loginForm.reset();

        setTimeout(goHome, 1000);

    } catch (error) {

        showMessage(loginOk, "Sem conexão com o servidor. Tente novamente.", false);

    } finally {

        button.disabled = false;
    }
});




/* ================= DESEMPENHO ================= */

// depois do load, baixa as imagens do slider para a troca ser instantânea
window.addEventListener("load", () => {
    heroCars.forEach(car => { new Image().src = car.image; });
});




/* ================= MENSAGENS DOS FORMULÁRIOS ================= */

function showMessage(element, text, ok) {
    element.textContent = text;
    element.style.color = ok ? "#5bc96b" : "#ff4d5e";
}



/* ================= SESSÃO: AVATAR, LOGOUT E FAVORITOS ================= */

const authToken = localStorage.getItem("token");

const openLoginBtn    = document.querySelector("#openLogin");
const openRegisterBtn = document.querySelector("#openRegister");
const userBox         = document.querySelector("#userBox");
const avatarImg       = document.querySelector("#avatarImg");
const avatarInitial   = document.querySelector("#avatarInitial");


// volta para a tela inicial já com a página atualizada
function goHome() {
    history.replaceState(null, "", "/");
    window.location.reload();
}


function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    goHome();
}

document.querySelector("#logoutBtn").addEventListener("click", logout);


// troca "Login / Criar conta" pelo avatar + Sair
function showLoggedIn(name, avatar) {

    openLoginBtn.hidden    = true;
    openRegisterBtn.hidden = true;
    userBox.hidden         = false;

    avatarInitial.textContent = (name || "?").trim().charAt(0).toUpperCase();

    if (avatar) {
        avatarImg.src = avatar;
        avatarImg.hidden = false;
        avatarInitial.hidden = true;
    }
}


function paintFavorite(button, liked) {
    button.textContent = liked ? "♥️" : "♡";
    button.style.color = liked ? "#ed142b" : "white";
}


async function toggleFavorite(button) {

    // favoritar exige login
    if (!authToken) {
        openLogin();
        return;
    }

    const name  = button.dataset.name;
    const liked = !favorites.has(name);

    // atualiza na hora e desfaz se o servidor recusar
    liked ? favorites.add(name) : favorites.delete(name);
    paintFavorite(button, liked);

    try {

        const response = await fetch(
            liked ? "/api/me/favorites" : "/api/me/favorites?name=" + encodeURIComponent(name),
            {
                method: liked ? "POST" : "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + authToken
                },
                body: liked ? JSON.stringify({ name }) : undefined
            }
        );

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) throw new Error();

    } catch (error) {

        liked ? favorites.delete(name) : favorites.add(name);
        paintFavorite(button, !liked);
    }
}


async function loadSession() {

    if (!authToken) return;

    // mostra a inicial do nome na hora; a foto chega logo depois
    showLoggedIn(localStorage.getItem("userName"), null);

    try {

        const response = await fetch("/api/me", {
            headers: { Authorization: "Bearer " + authToken }
        });

        // sessão vencida: limpa e volta ao site deslogado
        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) return;

        const data = await response.json();

        localStorage.setItem("userName", data.user.name);
        showLoggedIn(data.user.name, data.user.avatar);

        data.favorites.forEach(car => favorites.add(car.name));

        document.querySelectorAll(".favorite").forEach(button => {
            paintFavorite(button, favorites.has(button.dataset.name));
        });

        paintCarFavorite();

    } catch (error) {
        // sem conexão: continua com o que já está na tela
    }
}

loadSession();
