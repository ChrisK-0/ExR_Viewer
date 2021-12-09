import Viewer from "./views/Viewer.js";
import Calculator from "./views/Calculator.js";


// express navigation and views
const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

// express navigation and views
const router = async () => {
    const routes = [
        { path: "/", view: Viewer },
        { path: "/calculator", view: Calculator }
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }

    const view = new match.route.view();

    // if match is homepage aka "/", then render the exchange rates from API
    if (match.route.path == "/") {
        // setTimeout(function(){ renderRates(); }, 250);
        // renderRates();

        if (jsonStatus === 'ready') {
            setTimeout(function () { renderRates(); }, 250);
        }
    }

    // if match is calculator page aka "/calculator", then render the exchange rates to the calculator
    if (match.route.path == "/calculator") {
        if (jsonStatus === 'ready') {
            setTimeout(function () { renderCalculator(); }, 250);
        }
    }

    document.querySelector('#app').innerHTML = await view.getHtml();
};

// Make browser buttons to be in sync with address path
window.addEventListener("popstate", router);

// delegated event listener for injected HTML
document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    })

    router();
});


// * JS for site functions can be found below here

// Hamburger menu
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
};

// Close hamburger menu on link click
const navLink = document.querySelectorAll(".nav-link");

navLink.forEach(n => n.addEventListener("click", closeMenu));

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
};


// Exchange rates API JS

// This app was built around exchangeratesapi.io API, for which I did not include my own access key
// simply because I don't have a purchased premium variation and am limited to 1000 requests per month.
// I used the same JSON format the mentioned API uses in a fake API making site.

// API url building variables
const exrUrl = 'https://mocki.io/';
// const exrApi = 'v1/8c964b11-e5a2-40a8-9f6a-d1f58d423cd2'; // old
const exrApi = 'v1/2d11ea6b-a1f6-4136-bb6f-94eed43099ea';
const exrJSON = exrUrl + exrApi;

// Global variables to be modified by other functions inside getRates function
// Also global variables to be used by rendering
let parsedExrJSON;
let ratesList = '';
let ratesOptions = '';

// I might be a bit unexperienced with NODE express, because it likes to render unfetched data before fetching
// so I used the next variable and setTimeout functions in a couple of places
let jsonStatus = 'unready';

// fetch the exchange rates from api
const ratesRequest = new Request(exrJSON);

setTimeout(function () {
    fetch(ratesRequest)
        .then(response => response.json())
        .then(data => {
            console.log('Fetch request successful;');
            parsedExrJSON = data;
            console.log('API parsed to JSON;');


            // fetch variables for generating rates list or inserting into options
            let exchangeRates = data.rates; //let exchangeRates = parsedExrJSON.rates;
            let ratesbuffer = '';
            let optionsbuffer = '';


            // Rate row generator
            for (let [key, value] of Object.entries(exchangeRates)) {
                let insertHtml = `
                <li>${key} -> ${value}</li>
            `;

                ratesbuffer += insertHtml;
            };
            ratesList = ratesbuffer;


            // Rate select options inserter
            // also add base currency!
            optionsbuffer += `
            <option>${parsedExrJSON.base}</option>
        `;
            // ratesOptions filler
            for (let i of Object.keys(exchangeRates)) {
                let insertHtml = `
                <option>${i}</option>
            `;

                optionsbuffer += insertHtml;
            };
            ratesOptions = optionsbuffer;

            // console.log('jsonStatus is ready;')
            jsonStatus = 'ready';

            // render rates function if at home OR else if calculator if at calculator
            if (location.pathname === "/") {
                renderRates();
            }

            if (location.pathname === "/calculator") {
                renderCalculator();
            }


        })
        .catch(console.error);
}, 1000);


// render rates to HTML
function renderRates() {
    // Render rates to HTML
    let ratesContainer = document.querySelector('.exr-rates');
    ratesContainer.innerHTML = ratesList;

    // Get the base for the currency the rates are based on
    let ratesBase = parsedExrJSON.base; // default for the app is EUR

    // Set the currency span to the base of the given API
    let currencySpan = document.getElementById('exr-currency');
    currencySpan.innerHTML = ratesBase;
};

let calculatedSpan = document.getElementById('calculated_value');

// renders calculator functions on visit
function renderCalculator() {
    // Get select elements to render options into
    let selectContainer = document.querySelectorAll('.select-rate');

    for (let i = 0; i < selectContainer.length; i++) {
        selectContainer[i].innerHTML = ratesOptions;
    }

    // ON RENDER, BIND EVENT LISTENERS
    // first and second input on the calculator page
    let calculationInputs = document.querySelectorAll('.calculation-input');
    // select elements
    let selectRates = document.querySelectorAll('.select-rate');
    // value span
    calculatedSpan = document.getElementById('calculated_value');
    // currently active rate
    let currentInputValue;

    calculationInputs.forEach(inputElement => inputElement.addEventListener('change', function () {
            this.setAttribute('value', this.value)
            currentInputValue = this.value;

            calculatorCalculation(currentInputValue);
        })
    );

    selectRates.forEach(inputElement => inputElement.addEventListener('change', function () {
            calculatorCalculation(currentInputValue);
        })
    );
};

// calculator function
// inputValue = value user inserted into input field
function calculatorCalculation(inputValue) {
    // select elements
    let selectFirst = document.getElementById('calc-select-one');
    let selectSecond = document.getElementById('calc-select-two');

    // get exchange rate value accordingly to selected currency to use in multplication
    let firstSelectCurrency = selectFirst.value;
    let secondSelectCurrency = selectSecond.value;

    // used, when the currency in the first select is not EUR
    // value buffer
    let actualValue;

    // if comparing same currencies
    if (selectFirst.value === selectSecond.value) {
        if (inputValue == undefined || inputValue != Number || inputValue === NaN) {
            actualValue = 0;
        } else {
            actualValue = roundDecimals(inputValue);
        }
    } else {
        // if base is EUR, multiply
        if (selectFirst.value == parsedExrJSON.base && selectSecond.value != parsedExrJSON.base) {
            // console.log('calculatorCalculation: base is EUR(API)')
            actualValue = roundDecimals(inputValue * parsedExrJSON.rates[secondSelectCurrency]);
        }

        // if none of the select elements are EUR, use this formula
        // else if calculated to EUR, divide
        if (selectFirst.value != parsedExrJSON.base && selectSecond.value != parsedExrJSON.base) {
            actualValue = roundDecimals((inputValue / parsedExrJSON.rates[firstSelectCurrency]) * parsedExrJSON.rates[secondSelectCurrency]);
        } else if (selectFirst.value != parsedExrJSON.base && selectSecond.value == parsedExrJSON.base) {
            actualValue = roundDecimals(inputValue / parsedExrJSON.rates[firstSelectCurrency]);
        }
    }

    // change calculated span value
    calculatedSpan.innerHTML = actualValue;
}

// for rounding the calculated currency value
function roundDecimals(num) {
    return +(Math.round(num + "e+2") + "e-2");
}