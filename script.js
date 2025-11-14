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
        this.slideDuration = 4000; // 4 seconds

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.createSlideshow();
        this.startAutoAdvance();
    }

    createSlideshow() {
        // Save the original shop button
        const originalShopButton = this.container.querySelector('.shop-button');
        
        // Clear the container but keep the shop button reference
        this.container.innerHTML = '';

        // Create slideshow container
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
                <button class="nav-btn prev-btn">❮</button>
                <button class="nav-btn next-btn">❯</button>
                
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

        // Add the shop button back
        if (originalShopButton) {
            this.container.appendChild(originalShopButton);
        }

        // Add CSS styles
        this.addStyles();

        // Initialize event listeners
        this.setupEventListeners();
    }

    addStyles() {
        const styles = `
            .slideshow-container {
                position: relative;
                height: 500px;
                margin: 0 auto 20px;
                perspective: 1200px;
                width: 100%;
                max-width: 900px;
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

            .nav-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                color: white;
                border: none;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                font-size: 1.8rem;
                cursor: pointer;
                z-index: 10;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }

            .nav-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-50%) scale(1.1);
            }

            .prev-btn {
                left: 10px;
            }

            .next-btn {
                right: 10px;
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
            }

            .progress {
                height: 100%;
                background: white;
                width: 0%;
                transition: width 0.3s ease;
            }

            @media (max-width: 768px) {
                .slideshow-container {
                    height: 400px;
                }
                
                .slide-title {
                    font-size: 1.5rem;
                }
                
                .slide-desc {
                    font-size: 1rem;
                }
                
                .nav-btn {
                    width: 50px;
                    height: 50px;
                    font-size: 1.5rem;
                }
            }

            @media (max-width: 480px) {
                .slideshow-container {
                    height: 350px;
                }
                
                .slide {
                    width: 90%;
                }
                
                .slide.next, .slide.prev {
                    transform: translateX(25%) scale(0.85) rotateY(-12deg);
                }
                
                .slide.prev {
                    transform: translateX(-25%) scale(0.85) rotateY(12deg);
                }
                
                .slide.far-next, .slide.far-prev {
                    display: none;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupEventListeners() {
        const slides = this.container.querySelectorAll('.slide');
        const indicators = this.container.querySelectorAll('.indicator');
        const prevBtn = this.container.querySelector('.prev-btn');
        const nextBtn = this.container.querySelector('.next-btn');
        const progressBar = this.container.querySelector('.progress');
        const slideshowContainer = this.container.querySelector('.slideshow-container');

        // Previous button event
        prevBtn?.addEventListener('click', () => {
            this.navigate(-1);
            this.resetAutoAdvance();
        });

        // Next button event
        nextBtn?.addEventListener('click', () => {
            this.navigate(1);
            this.resetAutoAdvance();
        });

        // Indicator click events
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const targetIndex = parseInt(indicator.getAttribute('data-index'));
                this.navigateToSlide(targetIndex);
                this.resetAutoAdvance();
            });
        });

        // Slide click events (click on any slide to go next)
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

        // Pause auto-advance on hover
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

    navigate(direction) {
        this.currentSlide = (this.currentSlide + direction + this.images.length) % this.images.length;
        this.updateSlides();
    }

    navigateToSlide(index) {
        this.currentSlide = index;
        this.updateSlides();
    }

    updateSlides() {
        if (!this.slides) return;

        // Remove all classes from slides
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'next', 'prev', 'far-next', 'far-prev');
        });

        // Update slide classes based on current position
        this.slides[this.currentSlide].classList.add('active');

        // Set next slides
        for (let i = 1; i <= 2; i++) {
            const nextIndex = (this.currentSlide + i) % this.slides.length;
            if (i === 1) {
                this.slides[nextIndex].classList.add('next');
            } else {
                this.slides[nextIndex].classList.add('far-next');
            }
        }

        // Set previous slides
        for (let i = 1; i <= 2; i++) {
            const prevIndex = (this.currentSlide - i + this.slides.length) % this.slides.length;
            if (i === 1) {
                this.slides[prevIndex].classList.add('prev');
            } else {
                this.slides[prevIndex].classList.add('far-prev');
            }
        }

        // Update indicators
        if (this.indicators) {
            this.indicators.forEach((indicator, index) => {
                if (index === this.currentSlide) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }

        // Reset and animate progress bar
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
            setTimeout(() => {
                this.progressBar.style.width = '100%';
            }, 50);
        }
    }

    startAutoAdvance() {
        if (this.autoAdvance) {
            this.slideInterval = setInterval(() => {
                this.navigate(1);
            }, this.slideDuration);
        }
    }

    pauseAutoAdvance() {
        clearInterval(this.slideInterval);
        this.slideInterval = null;
    }

    resetAutoAdvance() {
        this.pauseAutoAdvance();
        this.startAutoAdvance();
    }
}

// Initialize the 3D slideshow
document.addEventListener('DOMContentLoaded', () => {
    new CakeSlideshow3D();
});
