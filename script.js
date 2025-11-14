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

// Enhanced WebP Image Slideshow with Improved Features
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
        this.slideshowContainer = document.querySelector('.slideshow-container');
        this.currentIndex = 0;
        this.interval = null;
        this.transitionTime = 600; // Smoother transition
        this.slideDuration = 4000; // 4 seconds per slide
        this.isAnimating = false;
        this.preloadBuffer = 3; // Preload next 3 images
        this.touchStartX = 0;
        this.touchEndX = 0;

        if (this.cakeImg && this.slideshowContainer) {
            this.init();
        }
    }

    init() {
        this.createSlideshowElements();
        this.preloadImages();
        this.setupEventListeners();
        this.startSlideshow();
        this.updateProgressIndicator();
    }

    createSlideshowElements() {
        // Create progress indicator
        this.progressContainer = document.createElement('div');
        this.progressContainer.className = 'slideshow-progress';
        this.progressContainer.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 10;
        `;

        // Create progress dots
        this.images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            dot.style.cssText = `
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${index === 0 ? 'white' : 'rgba(255,255,255,0.5)'};
                cursor: pointer;
                transition: background 0.3s ease;
            `;
            dot.addEventListener('click', () => this.goToSlide(index));
            this.progressContainer.appendChild(dot);
        });

        // Create navigation arrows
        this.prevBtn = document.createElement('button');
        this.prevBtn.innerHTML = '‹';
        this.prevBtn.className = 'slideshow-nav slideshow-prev';
        this.prevBtn.style.cssText = `
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            z-index: 10;
            transition: background 0.3s ease;
        `;

        this.nextBtn = document.createElement('button');
        this.nextBtn.innerHTML = '›';
        this.nextBtn.className = 'slideshow-nav slideshow-next';
        this.nextBtn.style.cssText = this.prevBtn.style.cssText;
        this.nextBtn.style.left = 'auto';
        this.nextBtn.style.right = '15px';

        // Add elements to slideshow container
        this.slideshowContainer.style.position = 'relative';
        this.slideshowContainer.appendChild(this.progressContainer);
        this.slideshowContainer.appendChild(this.prevBtn);
        this.slideshowContainer.appendChild(this.nextBtn);

        // Add CSS for image transitions
        this.cakeImg.style.cssText += `
            transition: opacity ${this.transitionTime}ms ease-in-out, transform ${this.transitionTime}ms ease-in-out;
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;
    }

    preloadImages() {
        // Preload images with buffer
        for (let i = 1; i <= this.preloadBuffer; i++) {
            const nextIndex = (this.currentIndex + i) % this.images.length;
            const img = new Image();
            img.src = `images/${this.images[nextIndex].file}`;
        }
    }

    setupEventListeners() {
        // Mouse events
        this.cakeImg.addEventListener('mouseenter', () => this.pause());
        this.cakeImg.addEventListener('mouseleave', () => this.resume());

        // Touch events for swipe
        this.cakeImg.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.pause();
        }, { passive: true });

        this.cakeImg.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            setTimeout(() => this.resume(), 3000);
        }, { passive: true });

        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
            if (e.key === ' ') {
                e.preventDefault();
                this.togglePlayPause();
            }
        });

        // Visibility API - pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    async changeSlide(direction = 1) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Add slide-out animation
        this.cakeImg.style.transform = direction > 0 ? 'translateX(-20px)' : 'translateX(20px)';
        this.cakeImg.style.opacity = '0';

        await new Promise(resolve => setTimeout(resolve, this.transitionTime));

        this.currentIndex = (this.currentIndex + direction + this.images.length) % this.images.length;
        const nextImg = this.images[this.currentIndex];
        
        // Preload next images
        this.preloadImages();
        
        this.cakeImg.src = `images/${nextImg.file}`;
        this.cakeImg.alt = nextImg.alt;

        // Reset transform and fade in
        this.cakeImg.style.transform = direction > 0 ? 'translateX(20px)' : 'translateX(-20px)';
        
        requestAnimationFrame(() => {
            this.cakeImg.style.transform = 'translateX(0)';
            this.cakeImg.style.opacity = '1';
            
            // Update progress indicator
            this.updateProgressIndicator();
            
            this.isAnimating = false;
        });
    }

    nextSlide() {
        this.changeSlide(1);
        this.restartInterval();
    }

    previousSlide() {
        this.changeSlide(-1);
        this.restartInterval();
    }

    goToSlide(index) {
        const direction = index > this.currentIndex ? 1 : -1;
        this.currentIndex = index;
        this.changeSlide(0); // Direct jump
        this.restartInterval();
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
        }
    }

    updateProgressIndicator() {
        const dots = this.progressContainer.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            dot.style.background = index === this.currentIndex ? 'white' : 'rgba(255,255,255,0.5)';
        });
    }

    startSlideshow() {
        const firstImg = this.images[0];
        this.cakeImg.src = `images/${firstImg.file}`;
        this.cakeImg.alt = firstImg.alt;
        this.cakeImg.loading = 'eager';
        this.cakeImg.style.opacity = '1';

        this.interval = setInterval(() => this.changeSlide(1), this.slideDuration);
    }

    pause() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        // Show navigation buttons on hover
        this.prevBtn.style.opacity = '1';
        this.nextBtn.style.opacity = '1';
    }

    resume() {
        if (!this.interval) {
            this.interval = setInterval(() => this.changeSlide(1), this.slideDuration);
        }
        // Hide navigation buttons
        this.prevBtn.style.opacity = '0';
        this.nextBtn.style.opacity = '0';
    }

    restartInterval() {
        this.pause();
        this.resume();
    }

    togglePlayPause() {
        if (this.interval) {
            this.pause();
        } else {
            this.resume();
        }
    }
}

// Initialize improved slideshow
document.addEventListener('DOMContentLoaded', () => {
    new CakeSlideshow();
});

// Add CSS for the new slideshow features
const slideshowStyles = `
    .slideshow-container {
        position: relative;
        overflow: hidden;
    }

    .slideshow-nav {
        opacity: 0;
        transition: opacity 0.3s ease, background 0.3s ease;
    }

    .slideshow-container:hover .slideshow-nav {
        opacity: 1;
    }

    .slideshow-nav:hover {
        background: rgba(0,0,0,0.8) !important;
    }

    .progress-dot:hover {
        transform: scale(1.2);
        transition: transform 0.2s ease;
    }

    .cake-img {
        will-change: transform, opacity;
        backface-visibility: hidden;
        transform: translateZ(0);
    }

    @media (max-width: 768px) {
        .slideshow-nav {
            opacity: 1;
            width: 35px !important;
            height: 35px !important;
            font-size: 18px !important;
        }
        
        .progress-dot {
            width: 6px !important;
            height: 6px !important;
        }
    }
`;

// Inject styles into the document
const styleSheet = document.createElement('style');
styleSheet.textContent = slideshowStyles;
document.head.appendChild(styleSheet);
