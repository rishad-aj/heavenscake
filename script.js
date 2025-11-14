// Location icon in sidebar
function openLocation() {
    window.open('https://maps.app.goo.gl/Ccc5uSfPwaU4ZJDN7', '_blank');
}

// Sidebar Toggle Script
document.addEventListener('DOMContentLoaded', function () {
    const navIcon = document.getElementById('nav-icon');
    const sidebar = document.getElementById('sidebar');
    
    if (!navIcon || !sidebar) return;

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

// Search functionality
const searchBar = document.getElementById('searchBar');
const suggestionsBox = document.getElementById('suggestions')?.querySelector('ul');

function performSearch(searchQuery) {
    if (searchQuery && searchQuery.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(searchQuery.trim())}`;
    }
}

function handleSearchInput() {
    if (!suggestionsBox) return;
    
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
}

function displayAllResults(matches) {
    if (!suggestionsBox) return;
    
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
        if (searchBar) {
            searchBar.dispatchEvent(new Event('input'));
        }
    });
    suggestionsBox.appendChild(closeResults);
}

// Initialize search
if (searchBar) {
    let searchTimeout;
    searchBar.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(handleSearchInput, 300);
    });
    
    document.querySelector('.search-bar')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchQuery = searchBar.value.trim();
        performSearch(searchQuery);
    });

    searchBar.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchQuery = searchBar.value.trim();
            performSearch(searchQuery);
        }
    });
}

// Product filtering
function filterCakes(retryCount = 10) {
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get("search");
    
    if (searchTerm && searchBar) {
        searchBar.value = searchTerm;
    }
    
    if (!searchTerm) return;

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
            const matchesAllTerms = searchTerms.every(term => name.includes(term));
            if (matchesAllTerms) {
                card.style.display = "block";
                foundResults = true;
            } else {
                card.style.display = "none";
            }
        } else {
            card.style.display = "none";
        }
    });

    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    if (!foundResults && allProducts.length > 0) {
        showNoResultsMessage();
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

// Cake card buttons
function initializeCakeCards() {
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

        let isCakeMenu = false;
        let prev = card;
        while (prev = prev.previousElementSibling) {
            if (prev.classList?.contains('content')) {
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
            searchQuery = cakeName.toLowerCase().includes('cake') ? cakeName : cakeName + ' cake';
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
}

// Swiper initialization
function initializeSwiper() {
    if (typeof Swiper !== 'undefined' && document.querySelector('.card-wrapper')) {
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
    }
}

// Boot animation remove
document.addEventListener('DOMContentLoaded', function () {
    const bootAnimation = document.getElementById('boot-animation');
    if (bootAnimation) {
        const removeBootAnimation = () => {
            if (document.body.contains(bootAnimation)) {
                bootAnimation.remove();
            }
        };
        
        bootAnimation.addEventListener('animationend', removeBootAnimation);
        
        // Fallback: remove after 3 seconds
        setTimeout(removeBootAnimation, 3000);
    }
});

// 3D Card Stack Slideshow - Mobile Optimized
class CakeSlideshow3D {
    constructor() {
        this.images = [
            { file: "vanilla-cake.webp", alt: "Vanilla Cake", desc: "Classic vanilla flavor with creamy frosting" },
            { file: "whiteforest-cake.webp", alt: "White Forest Cake", desc: "White chocolate and cherry delight" },
            { file: "blackforest-cake.webp", alt: "Black Forest Cake", desc: "Chocolate cake with cherries and cream" },
            { file: "germanblackforest-cake.webp", alt: "German Black Forest Cake", desc: "Authentic German recipe with kirsch" },
            { file: "chocolate-cake.webp", alt: "Chocolate Cake", desc: "Rich and moist chocolate masterpiece" },
            { file: "chocolatetruffle-cake.webp", alt: "Chocolate Truffle Cake", desc: "Decadent truffle with ganache" },
            { file: "whitechocotruffle-cake.webp", alt: "White Chocolate Truffle Cake", desc: "Creamy white chocolate perfection" }
        ];

        this.container = document.querySelector('.content');
        this.currentSlide = 0;
        this.autoAdvance = true;
        this.slideInterval = null;
        this.slideDuration = 4000;
        this.isMobile = window.innerWidth <= 768;

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.createSlideshow();
        this.startAutoAdvance();
        this.setupResizeHandler();
    }

    createSlideshow() {
        const originalShopButton = this.container.querySelector('.shop-button');
        this.container.innerHTML = '';

        const slideshowHTML = `
            <div class="slideshow-container">
                <div class="card-stack">
                    ${this.images.map((img, index) => `
                        <div class="slide ${this.getSlideClass(index)}" 
                             style="background-image: url('images/${img.file}')">
                            <div class="slide-content">
                                <h3 class="slide-title">${img.alt}</h3>
                                <p class="slide-desc">${img.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="nav-btn prev-btn" aria-label="Previous slide">❮</button>
                <button class="nav-btn next-btn" aria-label="Next slide">❯</button>
                
                <div class="indicators">
                    ${this.images.map((_, index) => `
                        <div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}"></div>
                    `).join('')}
                </div>

                <div class="progress-bar">
                    <div class="progress"></div>
                </div>
            </div>
        `;

        this.container.innerHTML = slideshowHTML;

        if (originalShopButton) {
            this.container.appendChild(originalShopButton);
        }

        this.setupEventListeners();
    }

    getSlideClass(index) {
        if (this.isMobile) {
            // Mobile: Only show active, prev, and next slides
            if (index === this.currentSlide) return 'active';
            if (index === (this.currentSlide + 1) % this.images.length) return 'next';
            if (index === (this.currentSlide - 1 + this.images.length) % this.images.length) return 'prev';
            return 'hidden';
        } else {
            // Desktop: Show all slides with different positions
            if (index === this.currentSlide) return 'active';
            if (index === (this.currentSlide + 1) % this.images.length) return 'next';
            if (index === (this.currentSlide - 1 + this.images.length) % this.images.length) return 'prev';
            if (index === (this.currentSlide + 2) % this.images.length) return 'far-next';
            if (index === (this.currentSlide - 2 + this.images.length) % this.images.length) return 'far-prev';
            return 'hidden';
        }
    }

    setupEventListeners() {
        const slides = this.container.querySelectorAll('.slide');
        const indicators = this.container.querySelectorAll('.indicator');
        const prevBtn = this.container.querySelector('.prev-btn');
        const nextBtn = this.container.querySelector('.next-btn');
        const progressBar = this.container.querySelector('.progress');
        const slideshowContainer = this.container.querySelector('.slideshow-container');

        if (!slides.length) return;

        // Button events
        prevBtn?.addEventListener('click', () => {
            this.navigate(-1);
            this.resetAutoAdvance();
        });

        nextBtn?.addEventListener('click', () => {
            this.navigate(1);
            this.resetAutoAdvance();
        });

        // Indicator events
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const targetIndex = parseInt(indicator.getAttribute('data-index'));
                this.navigateToSlide(targetIndex);
                this.resetAutoAdvance();
            });
        });

        // Slide click events
        slides.forEach(slide => {
            slide.addEventListener('click', () => {
                this.navigate(1);
                this.resetAutoAdvance();
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.navigate(-1);
                this.resetAutoAdvance();
            } else if (e.key === 'ArrowRight') {
                this.navigate(1);
                this.resetAutoAdvance();
            }
        });

        // Touch events for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        slideshowContainer?.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slideshowContainer?.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });

        // Pause auto-advance on hover/touch
        slideshowContainer?.addEventListener('mouseenter', () => {
            this.pauseAutoAdvance();
        });

        slideshowContainer?.addEventListener('mouseleave', () => {
            if (this.autoAdvance) {
                this.startAutoAdvance();
            }
        });

        this.slides = slides;
        this.indicators = indicators;
        this.progressBar = progressBar;
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.navigate(1); // Swipe left - next
            } else {
                this.navigate(-1); // Swipe right - previous
            }
            this.resetAutoAdvance();
        }
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.isMobile = window.innerWidth <= 768;
                this.updateSlides();
            }, 250);
        });
    }

    navigate(direction) {
        this.currentSlide = (this.currentSlide + direction + this.images.length) % this.images.length;
        this.updateSlides();
    }

    navigateToSlide(index) {
        this.currentSlide = index;
        this.updateSlides();
    }

    updateSlides() {
        if (!this.slides || !this.slides.length) return;

        this.slides.forEach((slide, index) => {
            slide.className = 'slide ' + this.getSlideClass(index);
        });

        if (this.indicators) {
            this.indicators.forEach((indicator, index) => {
                if (index === this.currentSlide) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }

        if (this.progressBar) {
            this.progressBar.style.width = '0%';
            setTimeout(() => {
                this.progressBar.style.width = '100%';
            }, 50);
        }
    }

    startAutoAdvance() {
        if (this.autoAdvance && !this.slideInterval) {
            this.slideInterval = setInterval(() => {
                this.navigate(1);
            }, this.slideDuration);
        }
    }

    pauseAutoAdvance() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    resetAutoAdvance() {
        this.pauseAutoAdvance();
        this.startAutoAdvance();
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize search and filtering
    filterCakes();
    
    // Update search bar with current search term
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get("search");
    if (searchTerm && searchBar) {
        searchBar.value = searchTerm;
    }

    // Initialize cake cards
    initializeCakeCards();
    
    // Initialize Swiper if available
    initializeSwiper();
    
    // Initialize 3D slideshow
    new CakeSlideshow3D();
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Script error:', e.error);
});
