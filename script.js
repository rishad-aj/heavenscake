// Location icon in sidebar
function openLocation() {
    window.open('https://maps.app.goo.gl/Ccc5uSfPwaU4ZJDN7', '_blank');
}

// Sidebar Toggle Script
document.addEventListener('DOMContentLoaded', function () {
    const navIcon = document.getElementById('nav-icon');
    const sidebar = document.getElementById('sidebar');
    let startX;

    navIcon?.addEventListener('click', function () {
        navIcon.classList.toggle('open');
        sidebar.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    sidebar?.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
    });

    sidebar?.addEventListener('touchmove', function (e) {
        let moveX = e.touches[0].clientX;
        let distance = startX - moveX;
        if (sidebar.classList.contains('active') && distance > 50) {
            sidebar.classList.remove('active');
            navIcon.classList.remove('open');
            document.body.classList.remove('no-scroll');
        }
    });
});

// Focus Input on search icon click
document.querySelector('.search-icon')?.addEventListener('click', function () {
    document.querySelector('.input')?.focus();
});

// Cake list for suggestion
const cakes = [
    'Vanilla','White Forest','Black Forest','German Black Forest','Chocolate Cake','Chocolate Truffle',
    'White Choco Truffle','Vancho','Kitkat','Ferrero Rocher','Nutella','Snickers','Oreo Cake','Nutty Bubble',
    'Red Velvet','Red Velvet Cream Cheese','Raffaello Cake','Toffee Cake','Tender Coconut','Butterscotch',
    'Russian Honey Cake','Tres Leches Cake','Milky Nut','Mexican Toffee','Red Bee Cake','Golden Vancho',
    'Kulfi Cake','Choco Velvet','Choco Nuts','Loaded Chocolate','Spanish Delight','Lotus Biscoff','Kifaya',
    'Loaded Cashew','Rasmalai Cake','Honey Almond','Pineapple','Rainbow','Strawberry','Pista','Blueberry',
    'Orange Truffle','Mango Truffle','Van Strawberry','Neapolitan Cake','Mango Strawberry','Tres Leches Pudding',
    'Pista Tres Leches','Dream Cake','Donuts','Cupcakes','Cakepops','Cakesickles','Brownies','Pudding','Hampers'
];

const searchBar = document.getElementById('searchBar');
const suggestionsBox = document.getElementById('suggestions')?.querySelector('ul');

// Enhanced search function
function performSearch(searchQuery) {
    if (searchQuery && searchQuery.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(searchQuery.trim())}`;
    }
}

// Suggestions logic
searchBar?.addEventListener('input', () => {
    const query = searchBar.value.trim().toLowerCase();
    suggestionsBox.innerHTML = '';

    if (!query) {
        document.querySelector('.suggestions-box').style.display = 'none';
        return;
    }

    let startingMatches = cakes.filter(cake => cake.toLowerCase().startsWith(query));
    startingMatches.sort((a, b) => a.localeCompare(b));

    let containingMatches = cakes.filter(cake =>
        !startingMatches.includes(cake) && cake.toLowerCase().includes(query)
    );
    containingMatches.sort((a, b) => a.localeCompare(b));

    const allMatches = [...startingMatches, ...containingMatches];
    const matches = allMatches.slice(0, 5);

    if (matches.length === 0) {
        const noResults = document.createElement('li');
        noResults.textContent = 'No results found!';
        Object.assign(noResults.style, {
            textAlign: 'center',
            pointerEvents: 'none',
            color: 'white'
        });
        suggestionsBox.appendChild(noResults);
    } else {
        matches.forEach(match => {
            const suggestion = document.createElement('li');
            suggestion.textContent = match;
            suggestion.addEventListener('click', () => {
                performSearch(match);
            });
            suggestionsBox.appendChild(suggestion);
        });

        if (allMatches.length > 5) {
            const moreResults = document.createElement('li');
            moreResults.textContent = 'More results...';
            Object.assign(moreResults.style, {
                textAlign: 'center',
                cursor: 'pointer',
                color: 'white'
            });
            moreResults.addEventListener('click', () => {
                displayAllResults(allMatches);
            });
            suggestionsBox.appendChild(moreResults);
        }
    }

    document.querySelector('.suggestions-box').style.display = 'block';
});

// Form submit + Enter support
document.querySelector('.search-bar')?.addEventListener('submit', function (e) {
    e.preventDefault();
    performSearch(searchBar.value.trim());
});

searchBar?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') performSearch(searchBar.value.trim());
});

function displayAllResults(matches) {
    suggestionsBox.innerHTML = '';
    matches.sort((a, b) => a.localeCompare(b));

    matches.forEach(match => {
        const suggestion = document.createElement('li');
        suggestion.textContent = match;
        suggestion.addEventListener('click', () => performSearch(match));
        suggestionsBox.appendChild(suggestion);
    });

    const closeResults = document.createElement('li');
    closeResults.textContent = 'Show less';
    Object.assign(closeResults.style, {
        textAlign: 'center',
        cursor: 'pointer',
        color: 'white'
    });
    closeResults.addEventListener('click', () => {
        searchBar.dispatchEvent(new Event('input'));
    });
    suggestionsBox.appendChild(closeResults);
}

// Product filter with search param
function filterCakes(retryCount = 10) {
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get("search");

    if (searchTerm) {
        if (searchBar) searchBar.value = searchTerm;

        const allProducts = document.querySelectorAll(".cake-card");
        if (allProducts.length === 0 && retryCount > 0) {
            setTimeout(() => filterCakes(retryCount - 1), 100);
            return;
        }

        const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length);
        let foundResults = false;

        allProducts.forEach(card => {
            const name = card.querySelector(".cake-name")?.textContent.toLowerCase();

            const matchesAll = name && searchTerms.every(term => name.includes(term));

            card.style.display = matchesAll ? "block" : "none";
            if (matchesAll) foundResults = true;
        });

        document.querySelector('.no-results-message')?.remove();

        if (!foundResults) showNoResultsMessage();
    }
}

function showNoResultsMessage() {
    const message = document.createElement('div');
    message.className = 'no-results-message';
    message.textContent = 'No results found';
    message.style.cssText = `
        text-align: center;
        padding: 2rem;
        color: white;
        font-size: 1.2rem;
        width: 100%;
    `;
    const menuGrid = document.querySelector('.menu-grid');
    menuGrid?.parentNode.insertBefore(message, menuGrid);
}

// Initialize filter & search bar update
document.addEventListener("DOMContentLoaded", () => {
    filterCakes();
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get("search");
    if (searchTerm && searchBar) searchBar.value = searchTerm;
});

// Add buttons to cake cards + swiper init
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.cake-card').forEach(card => {
        const cakeNameElem = card.querySelector('.cake-name');
        const buttonContainer = card.querySelector('.button-container');
        if (!cakeNameElem || !buttonContainer) return;

        const cakeName = cakeNameElem.textContent;
        buttonContainer.innerHTML = '';

        const orderBtn = document.createElement('a');
        orderBtn.className = 'order-btn';
        orderBtn.textContent = 'Order Now';
        orderBtn.href = `https://wa.me/918301088697?text=I%20would%20like%20to%20order%20${encodeURIComponent(cakeName)}`;
        orderBtn.target = '_blank';

        let searchQuery = cakeName.toLowerCase().includes('cake')
            ? cakeName
            : cakeName + ' cake';

        const viewBtn = document.createElement('a');
        viewBtn.className = 'view-btn';
        viewBtn.textContent = 'View More Images';
        viewBtn.href = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`;
        viewBtn.target = '_blank';

        buttonContainer.appendChild(orderBtn);
        buttonContainer.appendChild(viewBtn);
    });

    new Swiper('.card-wrapper', {
        loop: true,
        spaceBetween: 30,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        breakpoints: {
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    });
});

// Boot animation remove
document.addEventListener('DOMContentLoaded', function () {
    const bootAnimation = document.getElementById('boot-animation');
    bootAnimation?.addEventListener('animationend', () => bootAnimation.remove());
});

// WebP slideshow
class CakeSlideshow {
    constructor() {
        this.images = [
            { file: "vanilla-cake.webp", alt: "Vanilla Cake" },
            { file: "whiteforest-cake.webp", alt: "White Forest Cake" },
            { file: "blackforest-cake.webp", alt: "Black Forest Cake" },
            { file: "germanblackforest-cake.webp", alt: "German Black Forest Cake" },
            { file: "chocolate-cake.webp", alt: "Chocolate Cake" },
            { file: "chocolatetruffle-cake.webp", alt: "Chocolate Truffle Cake" },
            { file: "whitechocotruffle-cake.webp", alt: "White Chocolate Truffle Cake" },
            { file: "vancho-cake.webp", alt: "Vanilla Chocolate Cake" },
            { file: "kitkat-cake.webp", alt: "KitKat Cake" },
            { file: "ferrerorocher-cake.webp", alt: "Ferrero Rocher Cake" },
            { file: "nutella-cake.webp", alt: "Nutella Cake" },
            { file: "snickers-cake.webp", alt: "Snickers Cake" },
            { file: "oreo-cake.webp", alt: "Oreo Cake" },
            { file: "nuttybubble-cake.webp", alt: "Nutty Bubble Cake" },
            { file: "redvelvet-cake.webp", alt: "Red Velvet Cake" },
            { file: "redvelvetcreamcheese-cake.webp", alt: "Red Velvet Cream Cheese Cake" },
            { file: "raffaello-cake.webp", alt: "Raffaello Cake" },
            { file: "toffee-cake.webp", alt: "Toffee Cake" },
            { file: "tendercoconut-cake.webp", alt: "Tender Coconut Cake" },
            { file: "butterscotch-cake.webp", alt: "Butterscotch Cake" },
            { file: "russianhoney-cake.webp", alt: "Russian Honey Cake" },
            { file: "tresleches-cake.webp", alt: "Tres Leches Cake" },
            { file: "milkynut-cake.webp", alt: "Milky Nut Cake" },
            { file: "mexicantoffee-cake.webp", alt: "Mexican Toffee Cake" },
            { file: "redbee-cake.webp", alt: "Red Bee Cake" },
            { file: "goldenvancho-cake.webp", alt: "Golden Vanilla Chocolate Cake" },
            { file: "kulfi-cake.webp", alt: "Kulfi Cake" },
            { file: "chocovelvet-cake.webp", alt: "Chocolate Velvet Cake" },
            { file: "choconuts-cake.webp", alt: "Chocolate Nuts Cake" },
            { file: "loadedchocolate-cake.webp", alt: "Loaded Chocolate Cake" },
            { file: "spanishdelight-cake.webp", alt: "Spanish Delight Cake" },
            { file: "lotusbiscoff-cake.webp", alt: "Lotus Biscoff Cake" },
            { file: "kifaya-cake.webp", alt: "Kifaya Cake" },
            { file: "loadedcashew-cake.webp", alt: "Loaded Cashew Cake" },
            { file: "rasmalai-cake.webp", alt: "Rasmalai Cake" },
            { file: "honeyalmond-cake.webp", alt: "Honey Almond Cake" },
            { file: "pineapple-cake.webp", alt: "Pineapple Cake" },
            { file: "rainbow-cake.webp", alt: "Rainbow Cake" },
            { file: "strawberry-cake.webp", alt: "Strawberry Cake" },
            { file: "pista-cake.webp", alt: "Pista Cake" },
            { file: "blueberry-cake.webp", alt: "Blueberry Cake" },
            { file: "orangetruffle-cake.webp", alt: "Orange Truffle Cake" },
            { file: "mangotruffle-cake.webp", alt: "Mango Truffle Cake" },
            { file: "vanstrawberry-cake.webp", alt: "Vanilla Strawberry Cake" },
            { file: "neapolitan-cake.webp", alt: "Neapolitan Cake" },
            { file: "mangostrawberry-cake.webp", alt: "Mango Strawberry Cake" },
            { file: "treslechespudding-cake.webp", alt: "Tres Leches Pudding Cake" },
            { file: "pistatresleches-cake.webp", alt: "Pista Tres Leches Cake" },
            { file: "dream-cake.webp", alt: "Dream Cake" }
        ];

        this.cakeImg = document.querySelector('.cake-img');
        this.currentIndex = 0;
        this.interval = null;
        this.transitionTime = 500;
        this.slideDuration = 3500;
        this.isAnimating = false;

        if (this.cakeImg) this.init();
    }

    init() {
        this.preloadImages();
        this.setupEventListeners();
        this.startSlideshow();
        this.cakeImg.style.opacity = 1;
    }

    preloadImages() {
        this.images.forEach(img => {
            const image = new Image();
            image.src = `images/${img.file}`;
        });
    }

    setupEventListeners() {
        this.cakeImg.addEventListener('mouseenter', () => this.pause());
        this.cakeImg.addEventListener('mouseleave', () => this.resume());
        this.cakeImg.addEventListener('touchstart', () => this.pause(), { passive: true });
        this.cakeImg.addEventListener('touchend', () => this.resume(), { passive: true });
    }

    async changeSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.cakeImg.style.opacity = 0;
        await new Promise(resolve => setTimeout(resolve, this.transitionTime));

        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        const nextImg = this.images[this.currentIndex];

        this.cakeImg.src = `images/${nextImg.file}`;
        this.cakeImg.alt = nextImg.alt;

        requestAnimationFrame(() => {
            this.cakeImg.style.opacity = 1;
            this.isAnimating = false;
        });
    }

    startSlideshow() {
        const firstImg = this.images[0];
        this.cakeImg.src = `images/${firstImg.file}`;
        this.cakeImg.alt = firstImg.alt;

        this.interval = setInterval(() => this.changeSlide(), this.slideDuration);
    }

    pause() {
        clearInterval(this.interval);
        this.interval = null;
    }

    resume() {
        if (!this.interval) {
            this.changeSlide();
            this.interval = setInterval(() => this.changeSlide(), this.slideDuration);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CakeSlideshow();
});
