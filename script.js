// Location icon in sidebar
function openLocation() {
    window.open('https://maps.app.goo.gl/Ccc5uSfPwaU4ZJDN7', '_blank');
}

// Sidebar Toggle Script
document.addEventListener('DOMContentLoaded', function () {
    const navIcon = document.getElementById('nav-icon');
    const sidebar = document.getElementById('sidebar');
    let startX;

    navIcon.addEventListener('click', function () {
        navIcon.classList.toggle('open');
        sidebar.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    sidebar.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
    });

    sidebar.addEventListener('touchmove', function (e) {
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
    'Vanilla', 'White Forest', 'Black Forest', 'German Black Forest', 'Chocolate Cake', 'Chocolate Truffle',
    'White Choco Truffle', 'Vancho', 'Kitkat', 'Ferrero Rocher', 'Nutella', 'Snickers', 'Oreo Cake',
    'Nutty Bubble', 'Red Velvet', 'Red Velvet Cream Cheese', 'Raffaello Cake', 'Toffee Cake', 'Tender Coconut',
    'Butterscotch', 'Russian Honey Cake', 'Tres Leches Cake', 'Milky Nut', 'Mexican Toffee', 'Red Bee Cake',
    'Golden Vancho', 'Kulfi Cake', 'Choco Velvet', 'Choco Nuts', 'Loaded Chocolate', 'Spanish Delight',
    'Lotus Biscoff', 'Kifaya', 'Loaded Cashew', 'Rasmalai Cake', 'Honey Almond', 'Pineapple', 'Rainbow',
    'Strawberry', 'Pista', 'Blueberry', 'Orange Truffle', 'Mango Truffle', 'Van Strawberry',
    'Neapolitan Cake', 'Mango Strawberry', 'Tres Leches Pudding', 'Pista Tres Leches', 'Dream Cake',
    'Donuts', 'Cupcakes', 'Cakepops', 'Cakesickles', 'Brownies', 'Pudding', 'Hampers'
];

const searchBar = document.getElementById('searchBar');
const suggestionsBox = document.getElementById('suggestions')?.querySelector('ul');

// Enhanced search function with query parameter support
function performSearch(searchQuery) {
    if (searchQuery && searchQuery.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(searchQuery.trim())}`;
    }
}

// Handle search input with query parameter support
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

// Handle search form submission
document.querySelector('.search-bar')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const searchQuery = searchBar.value.trim();
    performSearch(searchQuery);
});

// Handle Enter key in search bar
searchBar?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const searchQuery = searchBar.value.trim();
        performSearch(searchQuery);
    }
});

function displayAllResults(matches) {
    suggestionsBox.innerHTML = '';
    matches.sort((a, b) => a.localeCompare(b));
    matches.forEach(match => {
        const suggestion = document.createElement('li');
        suggestion.textContent = match;
        suggestion.addEventListener('click', () => {
            performSearch(match);
        });
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

// Enhanced filter products with query parameter support and better matching
function filterCakes(retryCount = 10) {
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get("search");
    
    if (searchTerm) {
        // Update search bar value if we're on products page
        if (searchBar) {
            searchBar.value = searchTerm;
        }
        
        const allProducts = document.querySelectorAll(".cake-card");
        if (allProducts.length === 0 && retryCount > 0) {
            setTimeout(() => filterCakes(retryCount - 1), 100);
            return;
        }

        const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
        let foundResults = false;
        
        allProducts.forEach(card => {
            const name = card.querySelector(".cake-name")?.textContent.toLowerCase();
            if (name) {
                // Check if all search terms are present in the cake name
                const matchesAllTerms = searchTerms.every(term => name.includes(term));
                if (matchesAllTerms) {
                    card.style.display = "block";
                    foundResults = true;
                    // Remove any borders from previous searches
                    card.style.border = "";
                } else {
                    card.style.display = "none";
                }
            } else {
                card.style.display = "none";
            }
        });

        // Remove existing message if any
        const existingMessage = document.querySelector('.no-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Show message only if no results found
        if (!foundResults) {
            showNoResultsMessage();
        }
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
    if (menuGrid) {
        menuGrid.parentNode.insertBefore(message, menuGrid);
    }
}

// Initialize search functionality on page load
document.addEventListener("DOMContentLoaded", () => {
    filterCakes();
    
    // If we're on products page with search parameter, ensure search bar reflects it
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get("search");
    if (searchTerm && searchBar) {
        searchBar.value = searchTerm;
    }
});

// Add buttons to cake cards
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.cake-card').forEach(card => {
        const cakeNameElem = card.querySelector('.cake-name');
        const buttonContainer = card.querySelector('.button-container');

        if (!cakeNameElem || !buttonContainer) return; // Prevent null errors

        const cakeName = cakeNameElem.textContent;
        buttonContainer.innerHTML = '';

        const orderBtn = document.createElement('a');
        orderBtn.className = 'order-btn';
        orderBtn.textContent = 'Order Now';
        orderBtn.href = `https://wa.me/918301088697?text=I%20would%20like%20to%20order%20${encodeURIComponent(cakeName)}`;
        orderBtn.target = '_blank';

        // Detect if in cakes section
        let isCakeMenu = false;
        let prev = card;
        while (prev = prev.previousElementSibling) {
            if (prev.classList && prev.classList.contains('content')) {
                if (prev.textContent.includes('Cakes')) isCakeMenu = true;
                break;
            }
        }
        if (!isCakeMenu) {
            const allGrids = document.querySelectorAll('.menu-grid');
            isCakeMenu = allGrids[0] && allGrids[0].contains(card);
        }

        let searchQuery;
        if (isCakeMenu) {
            if (cakeName.toLowerCase().includes('cake')) {
                searchQuery = cakeName;
            } else {
                searchQuery = cakeName + ' cake';
            }
        } else {
            searchQuery = cakeName;
        }

        const viewBtn = document.createElement('a');
        viewBtn.className = 'view-btn';
        viewBtn.textContent = 'View More Images';
        viewBtn.href = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`;
        viewBtn.target = '_blank';

        buttonContainer.appendChild(orderBtn);
        buttonContainer.appendChild(viewBtn);
    });

    // Swiper Init
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
    bootAnimation?.addEventListener('animationend', function () {
        bootAnimation.remove();
    });
});

/* ============================================================
   3D STACK CAKE SLIDESHOW (Responsive, Dynamic, No HTML Needed)
   Replaces previous CakeSlideshow() entirely
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    class CakeStackSlideshow {

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

            this.container = document.querySelector(".cake-slideshow-stack");
            if (!this.container) return;

            this.current = 0;

            this.createStyle();
            this.buildStack();
            this.updateStack();

            setInterval(() => this.next(), 2500);
        }

        /* Add CSS directly from JS */
        createStyle() {
            const css = `
                .cake-slideshow-stack {
                    position: relative;
                    margin: auto;
                    width: 90%;
                    max-width: 360px;
                    height: 220px;
                    transform-style: preserve-3d;
                }

                @media(min-width: 768px){
                    .cake-slideshow-stack {
                        width: 420px;
                        height: 260px;
                    }
                }

                .cake-card {
                    position: absolute;
                    inset: 0;
                    border-radius: 16px;
                    background-size: cover;
                    background-position: center;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    transition: transform 0.7s ease, opacity 0.6s ease;
                }
            `;
            const style = document.createElement("style");
            style.innerHTML = css;
            document.head.appendChild(style);
        }

        /* Build 3 layered cards dynamically */
        buildStack() {
            this.cards = [];

            for (let i = 0; i < 3; i++) {
                const card = document.createElement("div");
                card.className = "cake-card";
                this.container.appendChild(card);
                this.cards.push(card);
            }

            this.updateImages();
        }

        updateImages() {
            for (let i = 0; i < 3; i++) {
                const index = (this.current + i) % this.images.length;
                this.cards[i].style.backgroundImage = `url("images/${this.images[index].file}")`;
                this.cards[i].setAttribute("alt", this.images[index].alt);
            }
        }

        updateStack() {
            this.cards.forEach((card, i) => {
                const diff = i;

                card.style.transform = `
                    translateZ(${-diff * 80}px)
                    translateY(${diff * 18}px)
                    scale(${1 - diff * 0.1})
                `;

                card.style.opacity = diff === 0 ? 1 : 0.6;
            });
        }

        next() {
            this.current = (this.current + 1) % this.images.length;
            this.updateImages();
            this.updateStack();
        }
    }

    /* Start slideshow */
    new CakeStackSlideshow();

});
