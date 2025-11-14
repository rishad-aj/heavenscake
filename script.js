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

// Enhanced 3D Card Stack Slideshow
class CakeSlideshow3D {
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

        this.currentIndex = 0;
        this.interval = null;
        this.slideDuration = 3000;
        this.isAnimating = false;
        this.stackElement = null;
        this.cards = [];
        this.totalCards = 5; // Number of cards in stack
        
        this.init();
    }

    init() {
        this.createSlideshow();
        this.preloadImages();
        this.setupEventListeners();
        this.startSlideshow();
    }

    createSlideshow() {
        // Remove existing cake-img if present
        const existingImg = document.querySelector('.cake-img');
        if (existingImg) {
            existingImg.remove();
        }

        // Create stack container
        this.stackElement = document.createElement('div');
        this.stackElement.className = 'cake-stack';
        
        // Add CSS styles
        this.addStyles();
        
        // Create cards
        for (let i = 0; i < this.totalCards; i++) {
            const card = document.createElement('div');
            card.className = 'stack-card';
            card.style.zIndex = this.totalCards - i;
            this.stackElement.appendChild(card);
            this.cards.push(card);
        }
        
        // Insert into DOM - replace the existing image container
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            const existingStack = document.querySelector('.cake-stack');
            if (existingStack) {
                existingStack.remove();
            }
            heroContent.appendChild(this.stackElement);
        }
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .cake-stack {
                position: relative;
                width: 100%;
                max-width: 400px;
                height: 250px;
                margin: 0 auto;
                transform-style: preserve-3d;
                perspective: 1000px;
            }

            .stack-card {
                position: absolute;
                width: 100%;
                height: 100%;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                border-radius: 16px;
                box-shadow: 
                    0 10px 25px rgba(0,0,0,0.3),
                    0 5px 10px rgba(0,0,0,0.2);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                backface-visibility: hidden;
                transform-origin: center bottom;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .cake-stack {
                    height: 200px;
                    max-width: 320px;
                }
                
                .stack-card {
                    border-radius: 12px;
                }
            }

            @media (max-width: 480px) {
                .cake-stack {
                    height: 180px;
                    max-width: 280px;
                }
            }

            /* Hover effects for desktop */
            @media (hover: hover) and (pointer: fine) {
                .cake-stack:hover .stack-card {
                    transition-duration: 0.8s;
                }
                
                .cake-stack:hover {
                    transform: translateY(-5px);
                }
            }

            /* Touch feedback for mobile */
            .stack-card:active {
                transform: scale(0.98) !important;
                transition-duration: 0.2s;
            }
        `;
        document.head.appendChild(style);
    }

    preloadImages() {
        this.images.forEach(img => {
            const image = new Image();
            image.src = `images/${img.file}`;
        });
    }

    setupEventListeners() {
        this.stackElement?.addEventListener('click', () => this.nextCard());
        this.stackElement?.addEventListener('mouseenter', () => this.pause());
        this.stackElement?.addEventListener('mouseleave', () => this.resume());
        this.stackElement?.addEventListener('touchstart', () => this.pause(), { passive: true });
        this.stackElement?.addEventListener('touchend', () => {
            setTimeout(() => this.resume(), 2000);
        }, { passive: true });

        // Pause on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    updateCards() {
        this.cards.forEach((card, i) => {
            const diff = (i - this.currentIndex + this.cards.length) % this.cards.length;
            const imageIndex = (this.currentIndex + i) % this.images.length;
            const image = this.images[imageIndex];

            // Set background image
            card.style.backgroundImage = `url('images/${image.file}')`;
            card.setAttribute('data-alt', image.alt);

            // Apply 3D transformations
            card.style.transform = `
                translateZ(${-diff * 30}px)
                translateY(${diff * 8}px)
                scale(${1 - diff * 0.08})
            `;
            
            // Adjust opacity and z-index for depth
            card.style.opacity = 1 - (diff * 0.2);
            card.style.zIndex = this.cards.length - diff;

            // Add blur effect to background cards for better depth
            if (diff > 0) {
                card.style.filter = `blur(${diff * 0.5}px) brightness(${1 - diff * 0.1})`;
            } else {
                card.style.filter = 'blur(0px) brightness(1)';
            }
        });
    }

    nextCard() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateCards();

        // Reset animation flag after transition
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    }

    startSlideshow() {
        // Initialize first set of cards
        this.updateCards();
        
        // Start auto-rotation
        this.interval = setInterval(() => this.nextCard(), this.slideDuration);
    }

    pause() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    resume() {
        if (!this.interval) {
            this.nextCard();
            this.interval = setInterval(() => this.nextCard(), this.slideDuration);
        }
    }

    // Method to manually go to specific image
    goToImage(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.updateCards();
        }
    }

    // Cleanup method
    destroy() {
        this.pause();
        this.stackElement?.remove();
    }
}

// Replace the existing CakeSlideshow initialization with:
document.addEventListener('DOMContentLoaded', () => {
    // Remove existing slideshow if any
    const existingSlideshow = document.querySelector('.cake-img');
    if (existingSlideshow) {
        existingSlideshow.style.display = 'none';
    }
    
    // Initialize new 3D slideshow
    new CakeSlideshow3D();
});

// Keep all your existing functionality below...
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
