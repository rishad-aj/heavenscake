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

// 3D Card Stack Slideshow
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

        this.container = document.querySelector('.cake-img-container');
        this.currentIndex = 0;
        this.interval = null;
        this.slideDuration = 3000; // 3 seconds per slide
        this.isAnimating = false;
        this.stackSize = 5; // Number of visible cards in stack

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.createStack();
        this.setupEventListeners();
        this.startSlideshow();
    }

    createStack() {
        // Clear container
        this.container.innerHTML = '';
        
        // Create stack container with 3D perspective
        this.stackContainer = document.createElement('div');
        this.stackContainer.className = 'cake-stack-container';
        this.stackContainer.style.cssText = `
            position: relative;
            width: 100%;
            height: 400px;
            perspective: 1200px;
            transform-style: preserve-3d;
        `;

        // Create individual cards
        for (let i = 0; i < this.stackSize; i++) {
            const card = document.createElement('div');
            card.className = 'cake-stack-card';
            card.style.cssText = `
                position: absolute;
                width: 280px;
                height: 350px;
                top: 0;
                left: 50%;
                margin-left: -140px;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                            opacity 0.8s ease,
                            z-index 0.8s ease;
                transform-style: preserve-3d;
                cursor: pointer;
            `;

            const img = document.createElement('img');
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            `;

            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.8));
                color: white;
                padding: 20px;
                transform: translateZ(20px);
            `;

            const title = document.createElement('h3');
            title.style.cssText = `
                margin: 0;
                font-size: 1.2rem;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            `;

            card.appendChild(img);
            card.appendChild(overlay);
            overlay.appendChild(title);
            this.stackContainer.appendChild(card);
        }

        this.container.appendChild(this.stackContainer);
        this.cards = this.stackContainer.querySelectorAll('.cake-stack-card');
        this.updateStack();
    }

    updateStack() {
        this.cards.forEach((card, index) => {
            const imgIndex = (this.currentIndex + index) % this.images.length;
            const img = card.querySelector('img');
            const title = card.querySelector('h3');
            
            img.src = `images/${this.images[imgIndex].file}`;
            img.alt = this.images[imgIndex].alt;
            title.textContent = this.images[imgIndex].alt;

            // Calculate 3D positions for stack effect
            const zIndex = this.stackSize - index;
            const scale = 1 - (index * 0.1);
            const rotation = index * 2 - 4; // Slight rotation variation
            const translateY = index * 15; // Vertical offset for stack
            const translateX = index * 5 - 10; // Horizontal offset for stack
            const opacity = 1 - (index * 0.2);
            const blur = index * 0.5;

            card.style.zIndex = zIndex;
            card.style.transform = `
                translateX(${translateX}px) 
                translateY(${translateY}px) 
                scale(${scale}) 
                rotateY(${rotation}deg)
                translateZ(${-index * 30}px)
            `;
            card.style.opacity = opacity;
            card.style.filter = `blur(${blur}px)`;
            
            // Add hover effect for top card
            if (index === 0) {
                card.style.cursor = 'pointer';
                card.onclick = () => this.next();
                card.onmouseenter = () => {
                    card.style.transform = `
                        translateX(${translateX}px) 
                        translateY(${translateY}px) 
                        scale(${scale * 1.05}) 
                        rotateY(${rotation}deg)
                        translateZ(${-index * 30}px)
                    `;
                };
                card.onmouseleave = () => {
                    card.style.transform = `
                        translateX(${translateX}px) 
                        translateY(${translateY}px) 
                        scale(${scale}) 
                        rotateY(${rotation}deg)
                        translateZ(${-index * 30}px)
                    `;
                };
            }
        });
    }

    next() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Add animation class for smooth transition
        this.cards.forEach(card => {
            card.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });

        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        
        setTimeout(() => {
            this.updateStack();
            this.isAnimating = false;
        }, 100);
    }

    startSlideshow() {
        this.interval = setInterval(() => {
            this.next();
        }, this.slideDuration);
    }

    pause() {
        clearInterval(this.interval);
        this.interval = null;
    }

    resume() {
        if (!this.interval) {
            this.startSlideshow();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CakeStackSlideshow();
});
