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

