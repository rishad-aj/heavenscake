// ==========================================
// 1. UI & NAVIGATION (Sidebar, Splash, Scroll)
// ==========================================

// Location icon in sidebar
function openLocation() {
    window.open('https://maps.app.goo.gl/Ccc5uSfPwaU4ZJDN7', '_blank');
}

// Sidebar Toggle & Touch Script
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

    // Focus Input on search icon click
    document.querySelector('.search-icon')?.addEventListener('click', function () {
        const searchInput = document.querySelector('#searchBar, .input');
        if (searchInput) {
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            searchInput.focus();
        }
    });
});

// Boot animation remove (Splash Screen)
document.body.classList.add("loading");
window.addEventListener("load", () => {
    const boot = document.getElementById("boot-animation");
    if(boot) {
        setTimeout(() => {
            boot.classList.add("hide");
            boot.addEventListener("transitionend", () => {
                boot.remove();
                document.body.classList.remove("loading");
            }, { once: true });
        }, 1000);
    } else {
        document.body.classList.remove("loading");
    }
});

// Scroll Reveal Observer
document.addEventListener('DOMContentLoaded', () => {
    const services = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    services.forEach(service => observer.observe(service));
});


// ==========================================
// 2. DATA FETCHING & DYNAMIC APP INIT
// ==========================================

let globalCakesData = [];
let globalAllProducts = [];
let globalCakeNames = [];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize search listeners immediately so URL params and input work without delay
    initSearchLogic();

    // Fetch products dynamically instead of hardcoding
    fetch('data/products.json')
        .then(response => response.json())
        .then(data => {
            if (data) {
                globalCakesData = data.cakes || [];
                const dessertsData = data.desserts || [];
                globalAllProducts = [
                    ...globalCakesData.map(item => ({ ...item, category: 'cake' })),
                    ...dessertsData.map(item => ({ ...item, category: 'dessert' }))
                ];
                globalCakeNames = globalAllProducts.map(item => item.name);
                
                // If user already typed in home search bar before JSON finished loading, refresh suggestions
                const searchBar = document.getElementById('searchBar');
                const suggestionsBox = document.getElementById('suggestions')?.querySelector('ul');
                if (searchBar && suggestionsBox && searchBar.value.trim()) {
                    searchBar.dispatchEvent(new Event('input'));
                }

                // Initialize features that depend on JSON data
                initSlideshow();
                initProductCardButtons();
            }
        })
        .catch(error => console.error("Error loading products.json:", error));
});


// ==========================================
// 3. SEARCH CONTROLLER (Home vs Products)
// ==========================================

function getMatchingProductNames(rawQuery) {
    const query = rawQuery.trim().toLowerCase();
    if (!query) return [];

    const queryCompact = query.replace(/\s+/g, '');
    const queryTerms = query.split(/\s+/).filter(Boolean);

    const startingMatches = [];
    const nameContainsMatches = [];
    const extendedMatches = [];

    globalAllProducts.forEach(product => {
        const name = (product.name || '').trim();
        const nameLower = name.toLowerCase();
        const nameCompact = nameLower.replace(/\s+/g, '');
        const altLower = (product.alt || '').toLowerCase();
        const descLower = (product.description || '').toLowerCase();
        const categoryTag = product.category === 'cake' ? 'cake cakes' : 'dessert desserts';
        const searchableText = `${nameLower} ${nameCompact} ${altLower} ${descLower} ${categoryTag}`;

        if (nameLower.startsWith(query) || nameCompact.startsWith(queryCompact)) {
            startingMatches.push(name);
        } else if (
            nameLower.includes(query) ||
            nameCompact.includes(queryCompact) ||
            queryTerms.every(term => `${nameLower} ${altLower} ${product.category === 'cake' ? 'cake' : ''}`.includes(term))
        ) {
            nameContainsMatches.push(name);
        } else if (queryTerms.every(term => searchableText.includes(term))) {
            extendedMatches.push(name);
        }
    });

    startingMatches.sort((a, b) => a.localeCompare(b));
    nameContainsMatches.sort((a, b) => a.localeCompare(b));
    extendedMatches.sort((a, b) => a.localeCompare(b));

    return [...new Set([...startingMatches, ...nameContainsMatches, ...extendedMatches])];
}

let searchInitialized = false;

function initSearchLogic() {
    if (searchInitialized) return;
    const searchBar = document.getElementById('searchBar');
    if (!searchBar) return;
    searchInitialized = true;

    const suggestionsContainer = document.getElementById('suggestions');
    const suggestionsBox = suggestionsContainer?.querySelector('ul');

    // SCENARIO A: HOME PAGE (Suggestions Box Exists)
    if (suggestionsBox) {
        searchBar.addEventListener('input', () => {
            const query = searchBar.value.trim();
            suggestionsBox.innerHTML = '';

            if (!query) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            const allMatches = getMatchingProductNames(query);
            const matches = allMatches.slice(0, 5);

            if (matches.length === 0) {
                const noResults = document.createElement('li');
                noResults.textContent = 'No results found!';
                Object.assign(noResults.style, { textAlign: 'center', pointerEvents: 'none', color: 'white' });
                suggestionsBox.appendChild(noResults);
            } else {
                matches.forEach(match => {
                    const suggestion = document.createElement('li');
                    suggestion.textContent = match;
                    suggestion.addEventListener('click', () => performSearchRedirect(match));
                    suggestionsBox.appendChild(suggestion);
                });

                if (allMatches.length > 5) {
                    const moreResults = document.createElement('li');
                    moreResults.textContent = 'More results...';
                    Object.assign(moreResults.style, { textAlign: 'center', cursor: 'pointer', color: 'white', fontWeight: 'bold' });
                    moreResults.addEventListener('click', (e) => {
                        e.stopPropagation();
                        displayAllResults(allMatches, suggestionsBox, searchBar);
                    });
                    suggestionsBox.appendChild(moreResults);
                }
            }
            suggestionsContainer.style.display = 'block';
        });

        // Re-open suggestions when focusing non-empty search input
        searchBar.addEventListener('focus', () => {
            if (searchBar.value.trim() && suggestionsBox.children.length > 0) {
                suggestionsContainer.style.display = 'block';
            }
        });

        // Close suggestions when clicking outside search container
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                suggestionsContainer.style.display = 'none';
            }
        });

        // Form submit + Enter / Escape key support
        searchBar.closest('form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            performSearchRedirect(searchBar.value.trim());
        });
        searchBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearchRedirect(searchBar.value.trim());
            } else if (e.key === 'Escape') {
                suggestionsContainer.style.display = 'none';
            }
        });
    } 
    // SCENARIO B: PRODUCTS PAGE (No Suggestions Box -> LIVE SEARCH)
    else {
        // Prevent form submission redirect on product page
        searchBar.closest('form')?.addEventListener('submit', (e) => e.preventDefault());

        // Check if user came from home page with a search query in the URL
        const params = new URLSearchParams(window.location.search);
        const urlSearchTerm = params.get("search");

        if (urlSearchTerm) {
            searchBar.value = urlSearchTerm;
            performLiveFilter(urlSearchTerm); // Filter immediately if cards exist, or rating.js will re-trigger
        }

        // Live typing filter
        searchBar.addEventListener('input', (e) => {
            performLiveFilter(e.target.value);
            
            // Update URL without reloading so sharing links works for current filter
            const trimmedVal = e.target.value.trim();
            const newUrl = trimmedVal 
                ? `${window.location.pathname}?search=${encodeURIComponent(trimmedVal)}` 
                : window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        });

        searchBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performLiveFilter(searchBar.value);
                searchBar.blur();
            }
        });
    }
}

// Redirect Helper for Home Page
function performSearchRedirect(searchQuery) {
    if (searchQuery && searchQuery.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(searchQuery.trim())}`;
    }
}

// Helper to expand suggestions on Home Page
function displayAllResults(matches, suggestionsBox, searchBar) {
    suggestionsBox.innerHTML = '';
    matches.forEach(match => {
        const suggestion = document.createElement('li');
        suggestion.textContent = match;
        suggestion.addEventListener('click', () => performSearchRedirect(match));
        suggestionsBox.appendChild(suggestion);
    });

    const closeResults = document.createElement('li');
    closeResults.textContent = 'Show less';
    Object.assign(closeResults.style, { textAlign: 'center', cursor: 'pointer', color: 'white', fontWeight: 'bold' });
    closeResults.addEventListener('click', (e) => {
        e.stopPropagation();
        searchBar.dispatchEvent(new Event('input'));
    });
    suggestionsBox.appendChild(closeResults);
}

// ==========================================
// Live Search Engine for Products Page (Gap Fix)
// ==========================================

function performLiveFilter(searchTerm) {
    const allProducts = document.querySelectorAll(".cake-card");
    // If product cards haven't been rendered into the DOM yet by rating.js, wait for rating.js to call performLiveFilter
    if (allProducts.length === 0) return;

    const rawQuery = (searchTerm || "").toLowerCase().trim();
    const queryCompact = rawQuery.replace(/\s+/g, '');
    const searchTerms = rawQuery.split(/\s+/).filter(term => term.length > 0);
    let foundResults = false;

    allProducts.forEach(card => {
        const name = card.querySelector(".cake-name")?.textContent.toLowerCase() || "";
        const nameCompact = name.replace(/\s+/g, '');
        const description = card.querySelector(".cake-description")?.textContent.toLowerCase() || "";
        const imgAlt = card.querySelector(".cake-image")?.getAttribute("alt")?.toLowerCase() || "";
        const isCakeSection = Boolean(card.closest('#cakes-grid'));
        const sectionKeywords = isCakeSection ? "cake cakes" : "dessert desserts";
        const searchableText = `${name} ${nameCompact} ${imgAlt} ${description} ${sectionKeywords}`;

        const matchesAll = searchTerms.length === 0 ||
            (queryCompact && nameCompact.includes(queryCompact)) ||
            searchTerms.every(term => searchableText.includes(term));

        const swiperParent = card.closest('.swiper-slide');
        const listParent = card.closest('li');
        const colParent = card.closest('.col');
        
        // Target the layout wrapper if it exists, otherwise target the card itself
        const elementToHide = swiperParent || listParent || colParent || card;

        if (matchesAll) {
            elementToHide.style.display = ""; 
            foundResults = true;
        } else {
            elementToHide.style.display = "none";
        }
    });

    // Hide/show section grids (#cakes-grid, #desserts-grid) and their section headers when empty
    ['cakes-grid', 'desserts-grid'].forEach(gridId => {
        const gridEl = document.getElementById(gridId);
        if (!gridEl) return;
        const cardsInGrid = gridEl.querySelectorAll('.cake-card');
        const hasVisibleCard = Array.from(cardsInGrid).some(card => {
            const wrapper = card.closest('.swiper-slide') || card.closest('li') || card.closest('.col') || card;
            return wrapper.style.display !== 'none';
        });
        gridEl.style.display = hasVisibleCard ? '' : 'none';
        const prevHeading = gridEl.previousElementSibling;
        if (prevHeading && prevHeading.classList.contains('content')) {
            prevHeading.style.display = hasVisibleCard ? '' : 'none';
        }
    });

    // If these are inside a regular product Swiper, update Swiper to recalculate spacing
    const swiperInstanceElement = document.querySelector('.card-wrapper');
    if (swiperInstanceElement && swiperInstanceElement.swiper) {
        swiperInstanceElement.swiper.update();
    }

    // Handle "No Results" Message
    let noResMsg = document.querySelector('.no-results-message');
    
    if (!foundResults) {
        if (!noResMsg) {
            noResMsg = document.createElement('div');
            noResMsg.className = 'no-results-message';
            noResMsg.textContent = 'No results found for your search.';
            noResMsg.style.cssText = `text-align: center; padding: 2rem; color: white; font-size: 1.2rem; width: 100%;`;
            const menuGrid = document.querySelector('.menu-grid');
            if(menuGrid) menuGrid.parentNode.insertBefore(noResMsg, menuGrid);
        }
        noResMsg.style.display = 'block';
    } else {
        if (noResMsg) noResMsg.style.display = 'none';
    }
}

window.performLiveFilter = performLiveFilter;


// ==========================================
// 4. 3D CAKE SLIDESHOW (Powered by JSON)
// ==========================================

function initSlideshow() {
    const wrapper = document.getElementById('hero-wrapper');
    let heroSwiper;

    if (wrapper && globalCakesData.length > 0) {
        // Clear out loading skeletons if any
        wrapper.innerHTML = '';

        globalCakesData.forEach(img => {
            // FIX: Exclude the fallback image from the slideshow
            if (img.image && img.image.includes('images.png')) {
                return; // Skips to the next cake in the loop
            }

            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            
            const imageElement = document.createElement('img');
            imageElement.src = img.image; // Uses JSON data
            imageElement.alt = img.alt || 'Cake Image';
            imageElement.loading = "lazy";

            imageElement.onerror = function() {
                slide.remove(); 
                if (heroSwiper) heroSwiper.update();
            };

            slide.appendChild(imageElement);
            wrapper.appendChild(slide);
        });

        heroSwiper = new Swiper(".swiper-hero", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            loop: true,
            breakpoints: {
                320: {
                    slidesPerView: "auto",
                    coverflowEffect: { rotate: 30, stretch: -20, depth: 200, modifier: 1, slideShadows: true }
                },
                768: {
                    slidesPerView: 5,
                    coverflowEffect: { rotate: 30, stretch: 0, depth: 150, modifier: 1, slideShadows: true }
                }
            },
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            }
        });
    }
}


// ==========================================
// 5. CAKE CARDS (Buttons & Swiper)
// ==========================================

function initProductCardButtons() {
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

        let searchQuery = cakeName.toLowerCase().includes('cake') ? cakeName : cakeName + ' cake';

        const viewBtn = document.createElement('a');
        viewBtn.className = 'view-btn';
        viewBtn.textContent = 'View More Images';
        viewBtn.href = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`;
        viewBtn.target = '_blank';

        buttonContainer.appendChild(orderBtn);
        buttonContainer.appendChild(viewBtn);
    });

    // Initialize regular card swipers (if they exist on the page)
    if(document.querySelector('.card-wrapper')) {
        new Swiper('.card-wrapper', {
            loop: true,
            spaceBetween: 30,
            pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: {
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    }
}
