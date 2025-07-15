// Location icon in sidebar
function openLocation()
{
   window.open('https://maps.app.goo.gl/Ccc5uSfPwaU4ZJDN7', '_blank');
}

// Sidebar Toggle Script
document.addEventListener('DOMContentLoaded', function ()
{
   const navIcon = document.getElementById('nav-icon');
   const sidebar = document.getElementById('sidebar');
   let startX;

   navIcon.addEventListener('click', function ()
   {
      navIcon.classList.toggle('open');
      sidebar.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
   });

   sidebar.addEventListener('touchstart', function (e)
   {
      startX = e.touches[0].clientX;
   });

   sidebar.addEventListener('touchmove', function (e)
   {
      let moveX = e.touches[0].clientX;
      let distance = startX - moveX;
      if (sidebar.classList.contains('active') && distance > 50)
      {
         sidebar.classList.remove('active');
         navIcon.classList.remove('open');
         document.body.classList.remove('no-scroll');
      }
   });
});

// Focus Input on search icon click
document.querySelector('.search-icon')?.addEventListener('click', function ()
{
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

searchBar?.addEventListener('input', () =>
{
   const query = searchBar.value.trim().toLowerCase();
   suggestionsBox.innerHTML = '';

   if (!query)
   {
      document.querySelector('.suggestions-box').style.display = 'none';
      return;
   }

   // First priority: matches that START with the query
   let startingMatches = cakes.filter(cake => cake.toLowerCase().startsWith(query));
   // Sort alphabetically
   startingMatches.sort((a, b) => a.localeCompare(b));

   // Second priority: matches that INCLUDE the query anywhere
   let containingMatches = cakes.filter(cake =>
      !startingMatches.includes(cake) && cake.toLowerCase().includes(query)
   );
   // Sort alphabetically
   containingMatches.sort((a, b) => a.localeCompare(b));

   const allMatches = [...startingMatches, ...containingMatches];
   const matches = allMatches.slice(0, 5);

   if (matches.length === 0)
   {
      const noResults = document.createElement('li');
      noResults.textContent = 'No results found!';
      Object.assign(noResults.style,
      {
         textAlign: 'center',
         pointerEvents: 'none',
         color: 'white'
      });
      suggestionsBox.appendChild(noResults);
   }
   else
   {
      matches.forEach(match =>
      {
         const suggestion = document.createElement('li');
         suggestion.textContent = match;
         suggestion.addEventListener('click', () =>
         {
            window.location.href = `products.html?search=${encodeURIComponent(match)}`;
         });
         suggestionsBox.appendChild(suggestion);
      });

      if (allMatches.length > 5)
      {
         const moreResults = document.createElement('li');
         moreResults.textContent = 'More results...';
         Object.assign(moreResults.style,
         {
            textAlign: 'center',
            cursor: 'pointer',
            color: 'white'
         });
         moreResults.addEventListener('click', () =>
         {
            displayAllResults(allMatches);
         });
         suggestionsBox.appendChild(moreResults);
      }
   }

   document.querySelector('.suggestions-box').style.display = 'block';
});

function displayAllResults(matches)
{
   suggestionsBox.innerHTML = '';

   // Sort all matches alphabetically
   matches.sort((a, b) => a.localeCompare(b));

   matches.forEach(match =>
   {
      const suggestion = document.createElement('li');
      suggestion.textContent = match;
      suggestion.addEventListener('click', () =>
      {
         window.location.href = `products?search=${encodeURIComponent(match)}`;
      });
      suggestionsBox.appendChild(suggestion);
   });

   const closeResults = document.createElement('li');
   closeResults.textContent = 'Show less';
   Object.assign(closeResults.style,
   {
      textAlign: 'center',
      cursor: 'pointer',
      color: 'white'
   });
   closeResults.addEventListener('click', () =>
   {
      searchBar.dispatchEvent(new Event('input'));
   });
   suggestionsBox.appendChild(closeResults);
}

// Filter products in products.html with retry if cards not loaded yet
function filterCakes(retryCount = 10)
{
   const params = new URLSearchParams(window.location.search);
   const searchTerm = params.get("search");
   if (searchTerm)
   {
      const allProducts = document.querySelectorAll(".cake-card");
      if (allProducts.length === 0 && retryCount > 0)
      {
         setTimeout(() => filterCakes(retryCount - 1), 100); // Retry after 100ms
         return;
      }

      allProducts.forEach(card =>
      {
         const name = card.querySelector(".cake-name")?.textContent.toLowerCase();
         if (name && name.includes(searchTerm.toLowerCase()))
         {
            card.style.display = "block";
         }
         else
         {
            card.style.display = "none";
         }
      });
   }
}

document.querySelectorAll('.cake-card').forEach(card => {
    const cakeName = card.querySelector('.cake-name').textContent;
    const buttonContainer = card.querySelector('.button-container');
    buttonContainer.innerHTML = '';

    const orderBtn = document.createElement('a');
    orderBtn.className = 'order-btn';
    orderBtn.textContent = 'Order Now';
    orderBtn.href = `https://wa.me/918301088697?text=I%20would%20like%20to%20order%20${encodeURIComponent(cakeName)}`;
    orderBtn.target = '_blank';

    // Detect if in cakes section
    let isCakeMenu = false;
    // Check if any previous sibling is a heading with "Cakes"
    let prev = card;
    while (prev = prev.previousElementSibling) {
        if (prev.classList && prev.classList.contains('content')) {
            if (prev.textContent.includes('Cakes')) isCakeMenu = true;
            break;
        }
    }
    // Or, fallback: if card is in the first menu-grid
    if (!isCakeMenu) {
        const allGrids = document.querySelectorAll('.menu-grid');
        isCakeMenu = allGrids[0].contains(card);
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

      const viewBtn = document.createElement('a');
      viewBtn.className = 'view-btn';
      viewBtn.textContent = 'View More Images';
      viewBtn.href = `https://www.google.com/search?q=${encodeURIComponent(cakeName + ' cake')}&tbm=isch`;
      viewBtn.target = '_blank';

      buttonContainer.appendChild(orderBtn);
      buttonContainer.appendChild(viewBtn);
   });

   // Swiper Init
   new Swiper('.card-wrapper',
   {
      loop: true,
      spaceBetween: 30,
      pagination:
      {
         el: '.swiper-pagination',
         clickable: true,
         dynamicBullets: true
      },
      navigation:
      {
         nextEl: '.swiper-button-next',
         prevEl: '.swiper-button-prev'
      },
      breakpoints:
      {
         0:
         {
            slidesPerView: 1
         },
         768:
         {
            slidesPerView: 2
         },
         1024:
         {
            slidesPerView: 3
         }
      }
   });
});

// Boot animation remove
document.addEventListener('DOMContentLoaded', function ()
{
   const bootAnimation = document.getElementById('boot-animation');
   bootAnimation?.addEventListener('animationend', function ()
   {
      bootAnimation.remove();
   });
});

// Enhanced WebP Image Slideshow
class CakeSlideshow
{
   constructor()
   {
      this.images = [
      {
         file: "vanilla-cake.webp",
         alt: "Vanilla Cake"
      },
      {
         file: "whiteforest-cake.webp",
         alt: "White Forest Cake"
      },
      {
         file: "blackforest-cake.webp",
         alt: "Black Forest Cake"
      },
      {
         file: "germanblackforest-cake.webp",
         alt: "German Black Forest Cake"
      },
      {
         file: "chocolate-cake.webp",
         alt: "Chocolate Cake"
      },
      {
         file: "chocolatetruffle-cake.webp",
         alt: "Chocolate Truffle Cake"
      },
      {
         file: "whitechocotruffle-cake.webp",
         alt: "White Chocolate Truffle Cake"
      },
      {
         file: "vancho-cake.webp",
         alt: "Vanilla Chocolate Cake"
      },
      {
         file: "kitkat-cake.webp",
         alt: "KitKat Cake"
      },
      {
         file: "ferrerorocher-cake.webp",
         alt: "Ferrero Rocher Cake"
      },
      {
         file: "nutella-cake.webp",
         alt: "Nutella Cake"
      },
      {
         file: "snickers-cake.webp",
         alt: "Snickers Cake"
      },
      {
         file: "oreo-cake.webp",
         alt: "Oreo Cake"
      },
      {
         file: "nuttybubble-cake.webp",
         alt: "Nutty Bubble Cake"
      },
      {
         file: "redvelvet-cake.webp",
         alt: "Red Velvet Cake"
      },
      {
         file: "redvelvetcreamcheese-cake.webp",
         alt: "Red Velvet Cream Cheese Cake"
      },
      {
         file: "raffaello-cake.webp",
         alt: "Raffaello Cake"
      },
      {
         file: "toffee-cake.webp",
         alt: "Toffee Cake"
      },
      {
         file: "tendercoconut-cake.webp",
         alt: "Tender Coconut Cake"
      },
      {
         file: "butterscotch-cake.webp",
         alt: "Butterscotch Cake"
      },
      {
         file: "russianhoney-cake.webp",
         alt: "Russian Honey Cake"
      },
      {
         file: "tresleches-cake.webp",
         alt: "Tres Leches Cake"
      },
      {
         file: "milkynut-cake.webp",
         alt: "Milky Nut Cake"
      },
      {
         file: "mexicantoffee-cake.webp",
         alt: "Mexican Toffee Cake"
      },
      {
         file: "redbee-cake.webp",
         alt: "Red Bee Cake"
      },
      {
         file: "goldenvancho-cake.webp",
         alt: "Golden Vanilla Chocolate Cake"
      },
      {
         file: "kulfi-cake.webp",
         alt: "Kulfi Cake"
      },
      {
         file: "chocovelvet-cake.webp",
         alt: "Chocolate Velvet Cake"
      },
      {
         file: "choconuts-cake.webp",
         alt: "Chocolate Nuts Cake"
      },
      {
         file: "loadedchocolate-cake.webp",
         alt: "Loaded Chocolate Cake"
      },
      {
         file: "spanishdelight-cake.webp",
         alt: "Spanish Delight Cake"
      },
      {
         file: "lotusbiscoff-cake.webp",
         alt: "Lotus Biscoff Cake"
      },
      {
         file: "kifaya-cake.webp",
         alt: "Kifaya Cake"
      },
      {
         file: "loadedcashew-cake.webp",
         alt: "Loaded Cashew Cake"
      },
      {
         file: "rasmalai-cake.webp",
         alt: "Rasmalai Cake"
      },
      {
         file: "honeyalmond-cake.webp",
         alt: "Honey Almond Cake"
      },
      {
         file: "pineapple-cake.webp",
         alt: "Pineapple Cake"
      },
      {
         file: "rainbow-cake.webp",
         alt: "Rainbow Cake"
      },
      {
         file: "strawberry-cake.webp",
         alt: "Strawberry Cake"
      },
      {
         file: "pista-cake.webp",
         alt: "Pista Cake"
      },
      {
         file: "blueberry-cake.webp",
         alt: "Blueberry Cake"
      },
      {
         file: "orangetruffle-cake.webp",
         alt: "Orange Truffle Cake"
      },
      {
         file: "mangotruffle-cake.webp",
         alt: "Mango Truffle Cake"
      },
      {
         file: "vanstrawberry-cake.webp",
         alt: "Vanilla Strawberry Cake"
      },
      {
         file: "neapolitan-cake.webp",
         alt: "Neapolitan Cake"
      },
      {
         file: "mangostrawberry-cake.webp",
         alt: "Mango Strawberry Cake"
      },
      {
         file: "treslechespudding-cake.webp",
         alt: "Tres Leches Pudding Cake"
      },
      {
         file: "pistatresleches-cake.webp",
         alt: "Pista Tres Leches Cake"
      },
      {
         file: "dream-cake.webp",
         alt: "Dream Cake"
      }];

      this.cakeImg = document.querySelector('.cake-img');
      this.currentIndex = 0;
      this.interval = null;
      this.transitionTime = 500; // Increased for smoother transition
      this.slideDuration = 3500; // 3.5 seconds per slide
      this.isAnimating = false;

      if (this.cakeImg)
      {
         this.init();
      }
   }

   init()
   {
      this.preloadImages();
      this.setupEventListeners();
      this.startSlideshow();
      this.cakeImg.style.opacity = 1; // Ensure visible on init
   }

   preloadImages()
   {
      this.images.forEach(img =>
      {
         const image = new Image();
         image.src = `images/${img.file}`;
      });
   }

   setupEventListeners()
   {
      this.cakeImg.addEventListener('mouseenter', () => this.pause());
      this.cakeImg.addEventListener('mouseleave', () => this.resume());
      this.cakeImg.addEventListener('touchstart', () => this.pause(),
      {
         passive: true
      });
      this.cakeImg.addEventListener('touchend', () => this.resume(),
      {
         passive: true
      });
   }

   async changeSlide()
   {
      if (this.isAnimating) return;
      this.isAnimating = true;

      // Fade out current image
      this.cakeImg.style.opacity = 0;

      // Wait for fade out to complete
      await new Promise(resolve => setTimeout(resolve, this.transitionTime));

      // Update to next image
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      const nextImg = this.images[this.currentIndex];
      this.cakeImg.src = `images/${nextImg.file}`;
      this.cakeImg.alt = nextImg.alt;

      // Fade in new image
      this.cakeImg.style.opacity = 0;
      requestAnimationFrame(() =>
      {
         this.cakeImg.style.opacity = 1;
         this.isAnimating = false;
      });
   }

   startSlideshow()
   {
      // Set initial image
      const firstImg = this.images[0];
      this.cakeImg.src = `images/${firstImg.file}`;
      this.cakeImg.alt = firstImg.alt;
      this.cakeImg.loading = 'eager';

      // Start interval
      this.interval = setInterval(() => this.changeSlide(), this.slideDuration);
   }

   pause()
   {
      clearInterval(this.interval);
      this.interval = null;
   }

   resume()
   {
      if (!this.interval)
      {
         this.changeSlide(); // Immediate transition when resuming
         this.interval = setInterval(() => this.changeSlide(), this.slideDuration);
      }
   }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () =>
{
   new CakeSlideshow();
});
