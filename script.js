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
        searchBar.dispatchEvent(new Event('input'));
    });
    suggestionsBox.appendChild(closeResults);
}

// Initialize search
if (searchBar) {
    searchBar.addEventListener('input', handleSearchInput);
    
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
        bootAnimation.addEventListener('animationend', function () {
            bootAnimation.remove();
        });
        
        // Fallback: remove after 3 seconds if animationend doesn't fire
        setTimeout(() => {
            if (document.body.contains(bootAnimation)) {
                bootAnimation.remove();
            }
        }, 3000);
    }
});

// Optimized Mobile 3D Card Stack Slideshow
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

        // Handle window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            this.updateSlides();
        });
    }

    init() {
        this.createSlideshow();
        this.startAutoAdvance();
    }

    createSlideshow() {
        const originalShopButton = this.container.querySelector('.shop-button');
        this.container.innerHTML = '';

        const slideshowHTML = `
            <div class="slideshow-container">
                <div class="card-stack">
                    ${this.images.map((img, index) => `
                        <div class="slide ${index === 0 ? 'active' : index === 1 ? 'next' : index === this.images.length - 1 ? 'prev' : ''}" 
                             style="background-image: url('images/${img.file}')">
                            <div class="slide-content">
                                <h3 class="slide-title">${img.alt}</h3>
                                <p class="slide-desc">${img.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <!-- Navigation buttons removed for mobile optimization -->
                
                <div class="indicators">
                    ${this.images.map((_, index) => `
                        <div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
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

        this.addStyles();
        this.setupEventListeners();
    }

    addStyles() {
        if (document.querySelector('#cake-slideshow-styles')) return;

        const styles = `
            .slideshow-container {
                position: relative;
                height: 500px;
                margin: 0 auto 20px;
                perspective: 1200px;
                width: 100%;
                max-width: 900px;
                overflow: hidden;
            }

            .card-stack {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .slide {
                position: absolute;
                width: 80%;
                height: 85%;
                border-radius: 15px;
                background-size: cover;
                background-position: center;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
                transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                            opacity 0.8s ease, 
                            z-index 0.8s ease;
                transform-style: preserve-3d;
                overflow: hidden;
                cursor: pointer;
                border: none; /* Remove any white lines */
            }

            .slide.active {
                transform: translateZ(0);
                z-index: 5;
            }

            .slide.next {
                transform: translateX(30%) scale(0.9) rotateY(-15deg);
                z-index: 4;
                opacity: 0.8;
            }

            .slide.prev {
                transform: translateX(-30%) scale(0.9) rotateY(15deg);
                z-index: 3;
                opacity: 0.8;
            }

            .slide.far-prev {
                transform: translateX(-50%) scale(0.8) rotateY(25deg);
                z-index: 2;
                opacity: 0.5;
            }

            .slide.far-next {
                transform: translateX(50%) scale(0.8) rotateY(-25deg);
                z-index: 1;
                opacity: 0.5;
            }

            .slide-content {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
                padding: 25px;
                color: white;
                text-align: left;
                transform: translateZ(20px);
                border: none; /* Remove any white lines */
            }

            .slide-title {
                font-size: 1.8rem;
                margin-bottom: 8px;
                font-weight: 600;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }

            .slide-desc {
                font-size: 1.1rem;
                opacity: 0.9;
                line-height: 1.5;
                margin: 0;
            }

            .indicators {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-top: 20px;
            }

            .indicator {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .indicator.active {
                background: white;
                transform: scale(1.3);
            }

            .progress-bar {
                width: 100%;
                height: 5px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 5px;
                margin-top: 30px;
                overflow: hidden;
                border: none; /* Remove any white lines */
            }

            .progress {
                height: 100%;
                background: white;
                width: 0%;
                transition: width 0.3s ease;
                border: none; /* Remove any white lines */
            }

            /* Mobile Optimizations */
            @media (max-width: 768px) {
                .slideshow-container {
                    height: 400px;
                    margin: 0 auto 10px;
                }
                
                .slide {
                    width: 85%;
                    height: 80%;
                }
                
                .slide-title {
                    font-size: 1.4rem;
                }
                
                .slide-desc {
                    font-size: 0.9rem;
                }
                
                /* Hide very low opacity images on mobile */
                .slide.far-next, .slide.far-prev {
                    display: none !important;
                }
                
                /* Adjust next and prev for better mobile view */
                .slide.next {
                    transform: translateX(20%) scale(0.85) rotateY(-10deg);
                    opacity: 0.7;
                }
                
                .slide.prev {
                    transform: translateX(-20%) scale(0.85) rotateY(10deg);
                    opacity: 0.7;
                }
                
                .indicators {
                    margin-top: 15px;
                }
                
                .indicator {
                    width: 12px;
                    height: 12px;
                }
                
                .progress-bar {
                    margin-top: 20px;
                }
            }

            @media (max-width: 480px) {
                .slideshow-container {
                    height: 350px;
                }
                
                .slide {
                    width: 90%;
                    height: 75%;
                }
                
                .slide.next, .slide.prev {
                    transform: translateX(15%) scale(0.8) rotateY(-8deg);
                    opacity: 0.6;
                }
                
                .slide.prev {
                    transform: translateX(-15%) scale(0.8) rotateY(8deg);
                }
                
                .slide-content {
                    padding: 15px;
                }
                
                .slide-title {
                    font-size: 1.2rem;
                }
                
                .slide-desc {
                    font-size: 0.8rem;
                }
                
                .indicators {
                    gap: 8px;
                }
            }

            /* Remove any potential white lines from container */
            .content {
                border: none;
                outline: none;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'cake-slideshow-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupEventListeners() {
        const slides = this.container.querySelectorAll('.slide');
        const indicators = this.container.querySelectorAll('.indicator');
        const progressBar = this.container.querySelector('.progress');
        const slideshowContainer = this.container.querySelector('.slideshow-container');

        if (!slides.length) return;

        // Touch events for mobile navigation
        let touchStartX = 0;
        let touchEndX = 0;

        slideshowContainer?.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slideshowContainer?.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });

        // Click on indicators
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const targetIndex = parseInt(indicator.getAttribute('data-index'));
                this.navigateToSlide(targetIndex);
                this.resetAutoAdvance();
            });
        });

        // Click on slides to advance
        slides.forEach(slide => {
            slide.addEventListener('click', () => {
                this.navigate(1);
                this.resetAutoAdvance();
            });
        });

        // Keyboard navigation (for desktop)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.navigate(-1);
                this.resetAutoAdvance();
            } else if (e.key === 'ArrowRight') {
                this.navigate(1);
                this.resetAutoAdvance();
            }
        });

        // Pause auto-advance on hover (desktop) and touch (mobile)
        slideshowContainer?.addEventListener('mouseenter', () => {
            this.pauseAutoAdvance();
        });

        slideshowContainer?.addEventListener('mouseleave', () => {
            if (this.autoAdvance) {
                this.startAutoAdvance();
            }
        });

        // Pause on touch start for mobile
        slideshowContainer?.addEventListener('touchstart', () => {
            this.pauseAutoAdvance();
        }, { passive: true });

        slideshowContainer?.addEventListener('touchend', () => {
            if (this.autoAdvance) {
                setTimeout(() => this.startAutoAdvance(), 2000);
            }
        }, { passive: true });

        this.slides = slides;
        this.indicators = indicators;
        this.progressBar = progressBar;
    }

    handleSwipe(startX, endX) {
        const minSwipeDistance = 50;
        const distance = startX - endX;

        if (Math.abs(distance) < minSwipeDistance) return;

        if (distance > 0) {
            // Swipe left - next
            this.navigate(1);
        } else {
            // Swipe right - previous
            this.navigate(-1);
        }
        this.resetAutoAdvance();
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

        this.slides.forEach(slide => {
            slide.classList.remove('active', 'next', 'prev', 'far-next', 'far-prev');
        });

        this.slides[this.currentSlide].classList.add('active');

        if (this.isMobile) {
            // Mobile: Only show active, next, and prev (hide far-next and far-prev)
            const nextIndex = (this.currentSlide + 1) % this.slides.length;
            const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            
            this.slides[nextIndex].classList.add('next');
            this.slides[prevIndex].classList.add('prev');
        } else {
            // Desktop: Show all slides
            for (let i = 1; i <= 2; i++) {
                const nextIndex = (this.currentSlide + i) % this.slides.length;
                const prevIndex = (this.currentSlide - i + this.slides.length) % this.slides.length;
                
                if (i === 1) {
                    this.slides[nextIndex].classList.add('next');
                    this.slides[prevIndex].classList.add('prev');
                } else {
                    this.slides[nextIndex].classList.add('far-next');
                    this.slides[prevIndex].classList.add('far-prev');
                }
            }
        }

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

// Performance optimization: Debounce search input
let searchTimeout;
if (searchBar) {
    const originalHandler = searchBar.oninput;
    searchBar.oninput = function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            handleSearchInput.call(this, e);
        }, 300);
    };
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Script error:', e.error);
});
