

const cars = [

    {
        name: "Volkswagen Golf GTI",

        version: "2.0 TSI DSG",

        year: "2021",

        km: "42.000 km",

        price: "R$ 189.900",

        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Volkswagen%20Golf%20GTI%20%282021%29%20%2852926196503%29.jpg"
    },


    {
        name: "Toyota Corolla GR-S",

        version: "2.0 Dynamic Force",

        year: "2023",

        km: "29.000 km",

        price: "R$ 169.900",

        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/2023%20Toyota%20Corolla%20Altis%20HEV%20GR%20Sport.jpg"
    },


    {
        name: "BMW X1 sDrive20i",

        version: "2.0 Turbo",

        year: "2022",

        km: "35.000 km",

        price: "R$ 219.900",

        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/BMW%20X1%20%282022-present%29.jpg"
    },


    {
        name: "Jeep Compass S",

        version: "1.3 T270 Turbo",

        year: "2022",

        km: "31.000 km",

        price: "R$ 179.900",

        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Jeep%20Compass%20MP%20Shishi%2001%202022-05-18.jpg"
    }

];


const heroCars = [

    {
        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/BMW%20X1%20%282022-present%29.jpg"
    },


    {
        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Volkswagen%20Golf%20GTI%20%282021%29%20%2852926196503%29.jpg"
    },


    {
        image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/2023%20Toyota%20Corolla%20Altis%20HEV%20GR%20Sport.jpg"
    }

];


let currentSlide = 0;




const carsGrid =
    document.querySelector("#carsGrid");


function renderCars(list = cars) {

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


    activateButtons();

}


renderCars();


function activateButtons() {


    document
        .querySelectorAll(".details-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    const car =
                        cars[this.dataset.index];


                    alert(

                        car.name +
                        "\n\n" +

                        car.version +
                        "\n" +

                        "Ano: " +
                        car.year +
                        "\n" +

                        "Quilometragem: " +
                        car.km +
                        "\n\n" +

                        "Preço: " +
                        car.price

                    );

                }
            );

        });


    document
        .querySelectorAll(".favorite")
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    if (
                        this.textContent.trim()
                        === "♡"
                    ) {

                        this.textContent = "♥️";

                        this.style.color =
                            "#ed142b";

                    } else {

                        this.textContent = "♡";

                        this.style.color =
                            "white";

                    }

                }
            );

        });

}


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