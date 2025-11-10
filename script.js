// Utility Functions
function safeQuerySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element not found: ${selector}`);
    }
    return element;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Application State
const AppState = {
    isSidebarOpen: false,
    currentSearch: '',
    slideshowPaused: false,
    activeSuggestionIndex: -1
};

// Analytics Tracking (optional)
const trackEvent = (category, action, label) => {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    // Development logging
    console.log(`Event: ${category} - ${action} - ${label}`);
};

// Location icon in sidebar
function openLocation() {
    trackEvent('Navigation', 'location_click', 'sidebar_location');
    window.open('https://maps.app.goo.gl/Ccc5uSfPwaU4ZJDN7', '_blank');
}

// Sidebar Toggle Script
document.addEventListener('DOMContentLoaded', function () {
    const navIcon = safeQuerySelector('#nav-icon');
    const sidebar = safeQuerySelector('#sidebar');
    let startX;

    if (navIcon && sidebar) {
        // Accessibility enhancements
        navIcon.setAttribute('aria-label', 'Toggle navigation menu');
        navIcon.setAttribute('aria-expanded', 'false');
        sidebar.setAttribute('aria-hidden', 'true');

        navIcon.addEventListener('click', function () {
            AppState.isSidebarOpen = !AppState.isSidebarOpen;
            
            navIcon.classList.toggle('open', AppState.isSidebarOpen);
            sidebar.classList.toggle('active', AppState.isSidebarOpen);
            document.body.classList.toggle('no-scroll', AppState.isSidebarOpen);
            
            // Update accessibility attributes
            navIcon.setAttribute('aria-expanded', AppState.isSidebarOpen.toString());
            sidebar.setAttribute('aria-hidden', (!AppState.isSidebarOpen).toString());
            
            trackEvent('Navigation', 'sidebar_toggle', AppState.isSidebarOpen ? 'open' : 'close');
        });

        sidebar.addEventListener('touchstart', function (e) {
            startX = e.touches[0].clientX;
        });

        sidebar.addEventListener('touchmove', function (e) {
            let moveX = e.touches[0].clientX;
            let distance = startX - moveX;
            if (sidebar.classList.contains('active') && distance > 50) {
                AppState.isSidebarOpen = false;
                sidebar.classList.remove('active');
                navIcon.classList.remove('open');
                document.body.classList.remove('no-scroll');
                
                // Update accessibility attributes
                navIcon.setAttribute('aria-expanded', 'false');
                sidebar.setAttribute('aria-hidden', 'true');
                
                trackEvent('Navigation', 'sidebar_swipe', 'close');
            }
        });
    }

    // Focus Input on search icon click
    const searchIcon = safeQuerySelector('.search-icon');
    const searchInput = safeQuerySelector('.input');
    
    if (searchIcon && searchInput) {
        searchIcon.addEventListener('click', function () {
            searchInput.focus();
            trackEvent('Search', 'search_icon_click', 'focus_input');
        });
    }
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

// Search functionality with debouncing and keyboard navigation
const searchBar = safeQuerySelector('#searchBar');
const suggestionsBox = safeQuerySelector('#suggestions')?.querySelector('ul');

if (searchBar && suggestionsBox) {
    // Accessibility
    searchBar.setAttribute('aria-label', 'Search for cakes');
    suggestionsBox.setAttribute('aria-label', 'Search suggestions');
    
    const debouncedSearch = debounce(() => {
        const query = searchBar.value.trim().toLowerCase();
        suggestionsBox.innerHTML = '';
        AppState.activeSuggestionIndex = -1;

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
            noResults.setAttribute('role', 'option');
            noResults.setAttribute('aria-disabled', 'true');
            Object.assign(noResults.style, {
                textAlign: 'center',
                pointerEvents: 'none',
                color: 'white'
            });
            suggestionsBox.appendChild(noResults);
        } else {
            matches.forEach((match, index) => {
                const suggestion = document.createElement('li');
                suggestion.textContent = match;
                suggestion.setAttribute('role', 'option');
                suggestion.setAttribute('id', `suggestion-${index}`);
                suggestion.addEventListener('click', () => {
                    trackEvent('Search', 'suggestion_click', match);
                    window.location.href = `products.html?search=${encodeURIComponent(match)}`;
                });
                suggestionsBox.appendChild(suggestion);
            });

            if (allMatches.length > 5) {
                const moreResults = document.createElement('li');
                moreResults.textContent = 'More results...';
                moreResults.setAttribute('role', 'option');
                moreResults.setAttribute('id', 'suggestion-more');
                Object.assign(moreResults.style, {
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: 'white'
                });
                moreResults.addEventListener('click', () => {
                    trackEvent('Search', 'show_more_results', query);
                    displayAllResults(allMatches);
                });
                suggestionsBox.appendChild(moreResults);
            }
        }

        document.querySelector('.suggestions-box').style.display = 'block';
        trackEvent('Search', 'input', query);
    }, 300);

    searchBar.addEventListener('input', debouncedSearch);

    // Keyboard navigation for search suggestions
    searchBar.addEventListener('keydown', (e) => {
        const suggestions = suggestionsBox.querySelectorAll('li[role="option"]:not([aria-disabled="true"])');
        if (!suggestions.length) return;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                AppState.activeSuggestionIndex = 
                    (AppState.activeSuggestionIndex + 1) % suggestions.length;
                updateSuggestionFocus(suggestions);
                break;
            case 'ArrowUp':
                e.preventDefault();
                AppState.activeSuggestionIndex = 
                    (AppState.activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
                updateSuggestionFocus(suggestions);
                break;
            case 'Enter':
                if (AppState.activeSuggestionIndex >= 0 && suggestions[AppState.activeSuggestionIndex]) {
                    e.preventDefault();
                    suggestions[AppState.activeSuggestionIndex].click();
                }
                break;
            case 'Escape':
                document.querySelector('.suggestions-box').style.display = 'none';
                AppState.activeSuggestionIndex = -1;
                break;
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchBar.contains(e.target) && !suggestionsBox.contains(e.target)) {
            document.querySelector('.suggestions-box').style.display = 'none';
            AppState.activeSuggestionIndex = -1;
        }
    });
}

function updateSuggestionFocus(suggestions) {
    suggestions.forEach((suggestion, index) => {
        if (index === AppState.activeSuggestionIndex) {
            suggestion.classList.add('focused');
            suggestion.setAttribute('aria-selected', 'true');
            suggestion.scrollIntoView({ block: 'nearest' });
        } else {
            suggestion.classList.remove('focused');
            suggestion.setAttribute('aria-selected', 'false');
        }
    });
}

function displayAllResults(matches) {
    suggestionsBox.innerHTML = '';
    AppState.activeSuggestionIndex = -1;
    
    matches.sort((a, b) => a.localeCompare(b));
    matches.forEach((match, index) => {
        const suggestion = document.createElement('li');
        suggestion.textContent = match;
        suggestion.setAttribute('role', 'option');
        suggestion.setAttribute('id', `suggestion-all-${index}`);
        suggestion.addEventListener('click', () => {
            trackEvent('Search', 'all_results_click', match);
            window.location.href = `products.html?search=${encodeURIComponent(match)}`;
        });
        suggestionsBox.appendChild(suggestion);
    });

    const closeResults = document.createElement('li');
    closeResults.textContent = 'Show less';
    closeResults.setAttribute('role', 'option');
    closeResults.setAttribute('id', 'suggestion-less');
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

// Filter products in products.html with retry if cards not loaded yet
function filterCakes(retryCount = 10) {
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get("search");
    if (searchTerm) {
        const allProducts = document.querySelectorAll(".cake-card");
        if (allProducts.length === 0 && retryCount > 0) {
            setTimeout(() => filterCakes(retryCount - 1), 100);
            return;
        }

        let foundCount = 0;
        allProducts.forEach(card => {
            const name = card.querySelector(".cake-name")?.textContent.toLowerCase();
            if (name && name.includes(searchTerm.toLowerCase())) {
                card.style.display = "block";
                foundCount++;
            } else {
                card.style.display = "none";
            }
        });

        // Add "No results found" label if no products match
        const existingNoResults = document.querySelector('.no-results-label');
        if (existingNoResults) {
            existingNoResults.remove();
        }

        if (foundCount === 0) {
            const noResultsLabel = document.createElement('div');
            noResultsLabel.className = 'no-results-label';
            noResultsLabel.textContent = `No results found for "${searchTerm}"`;
            noResultsLabel.style.cssText = `
                text-align: center;
                padding: 2rem;
                color: #666;
                font-size: 1.2rem;
                grid-column: 1 / -1;
            `;
            
            const menuGrid = document.querySelector('.menu-grid');
            if (menuGrid) {
                menuGrid.appendChild(noResultsLabel);
            }
        }

        trackEvent('Search', 'filter_results', `${searchTerm} (${foundCount} found)`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    filterCakes();
});

// Add buttons to cake cards
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
        orderBtn.setAttribute('aria-label', `Order ${cakeName} on WhatsApp`);
        orderBtn.addEventListener('click', () => {
            trackEvent('Order', 'whatsapp_click', cakeName);
        });

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
        viewBtn.setAttribute('aria-label', `View more images of ${cakeName}`);
        viewBtn.addEventListener('click', () => {
            trackEvent('Images', 'google_search', cakeName);
        });

        buttonContainer.appendChild(orderBtn);
        buttonContainer.appendChild(viewBtn);
    });

    // Swiper Init
    const swiperElement = safeQuerySelector('.card-wrapper');
    if (swiperElement) {
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
            },
            on: {
                init: function () {
                    trackEvent('Carousel', 'swiper_initialized', 'success');
                },
                slideChange: function () {
                    trackEvent('Carousel', 'slide_change', `slide_${this.activeIndex}`);
                }
            }
        });
    }
});

// Boot animation remove
document.addEventListener('DOMContentLoaded', function () {
    const bootAnimation = safeQuerySelector('#boot-animation');
    bootAnimation?.addEventListener('animationend', function () {
        bootAnimation.remove();
        trackEvent('App', 'boot_animation_complete', 'removed');
    });
});

// Enhanced WebP Image Slideshow with Error Handling
class EnhancedCakeSlideshow {
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

        this.cakeImg = safeQuerySelector('.cake-img');
        this.currentIndex = 0;
        this.interval = null;
        this.transitionTime = 500;
        this.slideDuration = 3500;
        this.isAnimating = false;
        this.failedImages = new Set();

        if (this.cakeImg) {
            this.init();
        }
    }

    async init() {
        try {
            await this.preloadImages();
            this.setupEventListeners();
            this.startSlideshow();
            this.cakeImg.style.opacity = 1;
            trackEvent('Slideshow', 'initialized', 'success');
        } catch (error) {
            console.error('Slideshow initialization failed:', error);
            trackEvent('Slideshow', 'initialization_failed', error.message);
        }
    }

    async preloadImages() {
        const preloadPromises = this.images.map(img => {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = resolve;
                image.onerror = () => {
                    this.failedImages.add(img.file);
                    reject(new Error(`Failed to load: ${img.file}`));
                };
                image.src = `images/${img.file}`;
            }).catch(error => {
                console.warn('Image preload warning:', error.message);
                // Don't reject the entire preload for one failed image
                return Promise.resolve();
            });
        });

        await Promise.allSettled(preloadPromises);
        
        if (this.failedImages.size > 0) {
            console.warn(`${this.failedImages.size} images failed to preload`);
        }
    }

    setupEventListeners() {
        this.cakeImg.addEventListener('mouseenter', () => this.pause());
        this.cakeImg.addEventListener('mouseleave', () => this.resume());
        this.cakeImg.addEventListener('touchstart', () => this.pause(), { passive: true });
        this.cakeImg.addEventListener('touchend', () => this.resume(), { passive: true });
        
        // Keyboard navigation
        this.cakeImg.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.pause();
            }
        });
    }

    async changeSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        try {
            // Fade out
            this.cakeImg.style.opacity = 0;
            await new Promise(resolve => setTimeout(resolve, this.transitionTime));

            // Find next valid image (skip failed ones)
            let nextIndex = (this.currentIndex + 1) % this.images.length;
            let attempts = 0;
            while (this.failedImages.has(this.images[nextIndex].file) && attempts < this.images.length) {
                nextIndex = (nextIndex + 1) % this.images.length;
                attempts++;
            }

            if (attempts >= this.images.length) {
                throw new Error('No valid images available');
            }

            this.currentIndex = nextIndex;
            const nextImg = this.images[this.currentIndex];
            
            // Verify image loads
            await this.preloadSingleImage(nextImg.file);
            
            this.cakeImg.src = `images/${nextImg.file}`;
            this.cakeImg.alt = nextImg.alt;

            // Fade in
            this.cakeImg.style.opacity = 1;
            trackEvent('Slideshow', 'slide_change', nextImg.alt);
            
        } catch (error) {
            console.error('Slideshow error:', error);
            // Try to continue with next image
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
        } finally {
            this.isAnimating = false;
        }
    }

    async preloadSingleImage(file) {
        if (this.failedImages.has(file)) {
            throw new Error(`Image previously failed: ${file}`);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = () => {
                this.failedImages.add(file);
                reject(new Error(`Failed to load: ${file}`));
            };
            img.src = `images/${file}`;
        });
    }

    startSlideshow() {
        if (this.images.length === 0) {
            console.error('No images available for slideshow');
            return;
        }

        const firstValidImage = this.images.find(img => !this.failedImages.has(img.file));
        if (!firstValidImage) {
            console.error('No valid images available for slideshow');
            return;
        }

        this.cakeImg.src = `images/${firstValidImage.file}`;
        this.cakeImg.alt = firstValidImage.alt;
        this.cakeImg.loading = 'eager';

        this.interval = setInterval(() => this.changeSlide(), this.slideDuration);
    }

    pause() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            AppState.slideshowPaused = true;
            trackEvent('Slideshow', 'paused', 'user_action');
        }
    }

    resume() {
        if (!this.interval && !AppState.slideshowPaused) {
            this.changeSlide();
            this.interval = setInterval(() => this.changeSlide(), this.slideDuration);
            AppState.slideshowPaused = false;
            trackEvent('Slideshow', 'resumed', 'user_action');
        }
    }

    destroy() {
        this.pause();
        this.cakeImg.removeEventListener('mouseenter', () => this.pause());
        this.cakeImg.removeEventListener('mouseleave', () => this.resume());
    }
}

// Initialize Enhanced Slideshow
document.addEventListener('DOMContentLoaded', () => {
    const cakeImg = safeQuerySelector('.cake-img');
    if (cakeImg) {
        new EnhancedCakeSlideshow();
    }
});

// Global error handler for better debugging
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    trackEvent('Error', 'global_error', e.error?.message || e.message);
});

// Page load tracking
window.addEventListener('load', function() {
    trackEvent('Page', 'load_complete', document.title);
});
