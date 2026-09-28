

const cars = [

    {
        name: "Volkswagen Golf GTI",

        version: "2.0 TSI DSG",

        year: "2021",

        km: "42.000 km",

        price: "R$ 189.900",

        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Volkswagen%20Golf%20GTI%20%282021%29%20%2852926196503%29.jpg?width=640"
    },


    {
        name: "Toyota Corolla GR-S",

        version: "2.0 Dynamic Force",

        year: "2023",

        km: "29.000 km",

        price: "R$ 169.900",

        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/2023%20Toyota%20Corolla%20Altis%20HEV%20GR%20Sport.jpg?width=640"
    },


    {
        name: "BMW X1 sDrive20i",

        version: "2.0 Turbo",

        year: "2022",

        km: "35.000 km",

        price: "R$ 219.900",

        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/BMW%20X1%20%282022-present%29.jpg?width=640"
    },


    {
        name: "Jeep Compass S",

        version: "1.3 T270 Turbo",

        year: "2022",

        km: "31.000 km",

        price: "R$ 179.900",

        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Jeep%20Compass%20MP%20Shishi%2001%202022-05-18.jpg?width=640"
    }

];


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

            <div class="car-image">

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


        carsGrid.appendChild(card);

    });


}


renderCars();


// um único listener para todos os cards (delegação de eventos)
carsGrid.addEventListener("click", event => {

    const details = event.target.closest(".details-button");

    if (details) {

        const car = visibleCars[details.dataset.index];

        alert(
            car.name + "\n\n" +
            car.version + "\n" +
            "Ano: " + car.year + "\n" +
            "Quilometragem: " + car.km + "\n\n" +
            "Preço: " + car.price
        );

        return;
    }

    const favorite = event.target.closest(".favorite");

    if (favorite) {

        const liked = favorite.textContent.trim() === "♡";

        favorite.textContent = liked ? "♥️" : "♡";
        favorite.style.color = liked ? "#ed142b" : "white";
    }

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

        showMessage(
            successMsg,
            `Conta criada com sucesso, ${name.value.trim().split(" ")[0]}! 🎉`,
            true
        );

        registerForm.reset();

        setTimeout(closeRegister, 2000);

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

        showMessage(loginOk, `Bem-vindo, ${data.name.split(" ")[0]}! 🎉`, true);

        loginForm.reset();

        setTimeout(closeLogin, 1500);

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
