    import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
    import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

    // Standard Client Initialization configuration parameters map
    const firebaseConfig = {
  apiKey: "AIzaSyBvRpWX2xya1Q_gafLoOULQhSETPAXLAjM",
  authDomain: "heavens-cake.firebaseapp.com",
  projectId: "heavens-cake",
  storageBucket: "heavens-cake.firebasestorage.app",
  messagingSenderId: "197873918742",
  appId: "1:197873918742:web:30aca793d2f40d5cb52637"
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    const auth = getAuth(app);

    let activeProductName = "";
    let selectedRatingValue = 0;

    // Helper formatting function to produce legal DOM element IDs
    const getSafeId = (name) => btoa(encodeURIComponent(name)).replace(/[^a-zA-Z0-9]/g, '');

    // Generates star layouts contextually based on product rating values
    const buildStarsHtml = (rating) => {
      let stars = "";
      for (let i = 1; i <= 5; i++) {
        stars += i <= Math.round(rating) ? "★" : "☆";
      }
      return stars;
    };

    document.addEventListener("DOMContentLoaded", async () => {
      try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const createCard = (product) => {
          const searchQuery = product.name.toLowerCase().includes('cake') ? product.name : product.name + ' cake';
          const safeId = getSafeId(product.name);

          return `
            <li class="card-item swiper-slide">
            <div class="cake-card">
              <img src="${product.image}" alt="${product.alt}" class="cake-image">
              <div class="cake-info">
                <h3 class="cake-name">${product.name}</h3>
                <p class="cake-description">${product.description}</p>
                
                <div class="rating-summary-container" data-name="${product.name}" title="Click to view all reviews">
                  <span id="stars-${safeId}" style="color: #ffaa00; font-size: 18px;">☆☆☆☆☆ <span style="color: #aaa; font-size: 13px; font-weight: normal; margin-left: 4px;">0.0 / 5.0</span></span>
                  <span id="count-${safeId}" style="font-size: 13px; color: #aaa; margin-left: 6px;">(0 reviews)</span>
                </div>

                <div class="button-container">
                  <a class="order-btn" href="https://wa.me/918301088697?text=I%20would%20like%20to%20order%20${encodeURIComponent(product.name)}" target="_blank">Order Now</a>
                  <a class="view-btn" href="https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch" target="_blank" style="margin: 5px 0; text-align: center;">View More Images</a>
                  <button class="add-review-action-btn" data-name="${product.name}">Add Review</button>
                </div>
              </div>
            </div>
            </li>
          `;
        };

        // Render targets updates sequentially
        const cakesGrid = document.getElementById('cakes-grid');
        if (cakesGrid && data.cakes) cakesGrid.innerHTML = data.cakes.map(createCard).join('');

        const dessertsGrid = document.getElementById('desserts-grid');
        if (dessertsGrid && data.desserts) dessertsGrid.innerHTML = data.desserts.map(createCard).join('');

        // Re-apply search filter once product cards are in the DOM
        const searchBar = document.getElementById('searchBar');
        const urlSearchTerm = new URLSearchParams(window.location.search).get('search');
        const activeQuery = (searchBar && searchBar.value.trim()) ? searchBar.value : (urlSearchTerm || '');
        if (activeQuery && typeof window.performLiveFilter === 'function') {
          if (searchBar && !searchBar.value) searchBar.value = activeQuery;
          window.performLiveFilter(activeQuery);
        }

        // Query database metrics and update system aggregate variables
        await loadAggregateRatings();

        // Assign global contextual actions
        document.body.addEventListener('click', (e) => {
          const ratingTarget = e.target.closest('.rating-summary-container');
          if (ratingTarget) {
            openReviewModal(ratingTarget.getAttribute('data-name'));
          }

          const reviewBtnTarget = e.target.closest('.add-review-action-btn');
          if (reviewBtnTarget) {
            handleReviewWriteIntent(reviewBtnTarget.getAttribute('data-name'));
          }
        });

      } catch (error) {
        console.error("Failed to parse catalog structure:", error);
      }
    });

    // Fetches metrics maps dynamically from live Firestore logs data sets
    async function loadAggregateRatings() {
      try {
        const snapshot = await getDocs(query(collection(db, "reviews")));
        const metricsMap = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!metricsMap[data.productId]) {
            metricsMap[data.productId] = { totalStars: 0, count: 0 };
          }
          metricsMap[data.productId].totalStars += Number(data.rating);
          metricsMap[data.productId].count += 1;
        });

        Object.keys(metricsMap).forEach((prodName) => {
          const safeId = getSafeId(prodName);
          const averageScore = metricsMap[prodName].totalStars / metricsMap[prodName].count;
          const formattedScore = averageScore.toFixed(1);
          
          const starsEl = document.getElementById(`stars-${safeId}`);
          const countEl = document.getElementById(`count-${safeId}`);
          
          // Appends numeric values inline right beside the calculated stars map
          if (starsEl) {
            starsEl.innerHTML = buildStarsHtml(averageScore) + ` <span style="color: #aaa; font-size: 13px; font-weight: normal; margin-left: 4px;">${formattedScore} / 5.0</span>`;
          }
          if (countEl) countEl.innerText = `(${metricsMap[prodName].count} review${metricsMap[prodName].count > 1 ? 's' : ''})`;
        });
      } catch (err) {
        console.error("Error processing real-time system rating maps:", err);
      }
    }

    // Direct interface querying on the actual firebase auth instance ensures no variable sync latency
    function handleReviewWriteIntent(productName) {
      if (!auth.currentUser) {
        if (typeof window.openAuthModal === 'function') {
          window.openAuthModal();
        } else {
          const authModal = document.getElementById('auth-modal');
          if (authModal) {
            authModal.style.display = 'flex';
            document.body.classList.add('no-scroll', 'modal-open');
            document.documentElement.classList.add('no-scroll');
          }
        }
      } else {
        openReviewModal(productName);
        document.getElementById('review-text-input').focus();
      }
    }

    // Modal display toggle switched to use absolute flex layouts for perfect alignment centering
    async function openReviewModal(productName) {
      activeProductName = productName;
      document.getElementById('review-modal-title').innerText = productName;
      document.getElementById('review-modal').style.display = 'flex';
      document.body.classList.add('no-scroll', 'modal-open');
      document.documentElement.classList.add('no-scroll');
      resetReviewFormInput();
      await fetchAndRenderModalReviews(productName);
    }

    async function fetchAndRenderModalReviews(productName) {
      const listContainer = document.getElementById('reviews-list');
      const aggregateContainer = document.getElementById('modal-rating-summary');
      listContainer.innerHTML = '<p style="color:#777; font-style:italic;">Loading reviews...</p>';

      try {
        const q = query(collection(db, "reviews"), where("productId", "==", productName));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          listContainer.innerHTML = '<p style="color:#999; text-align:center; margin:15px 0;">No reviews yet. Be the first to add yours!</p>';
          aggregateContainer.innerHTML = "Not yet rated";
          return;
        }

        let total = 0;
        
        const sortedDocs = snap.docs.sort((a, b) => {
          const timeA = a.data().timestamp?.seconds || 0;
          const timeB = b.data().timestamp?.seconds || 0;
          return timeB - timeA;
        });

        let htmlStr = "";
        sortedDocs.forEach((doc) => {
          const item = doc.data();
          total += Number(item.rating);
          
          const rawDate = item.timestamp?.toDate();
          const formattedDate = rawDate ? rawDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';

          htmlStr += `
            <div style="background: #fbf9f6; border-left: 4px solid #734d40; padding: 10px; margin-bottom: 10px; border-radius: 0 5px 5px 0; text-align: left;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <strong style="color: #333; font-size:14px;">${item.userName || 'Anonymous'}</strong>
                <small style="color: #aaa;">${formattedDate}</small>
              </div>
              <div style="color: #ffaa00; font-size:14px; margin-bottom:5px;">${buildStarsHtml(item.rating)}</div>
              <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.4;">${item.text}</p>
            </div>
          `;
        });

        const scoreAvg = (total / snap.size).toFixed(1);
        aggregateContainer.innerHTML = `Rating: <span style="color:#ffaa00;">${buildStarsHtml(scoreAvg)}</span> (${scoreAvg} / 5.0)`;
        listContainer.innerHTML = htmlStr;

      } catch (err) {
        console.error("Error drawing elements from database:", err);
        listContainer.innerHTML = '<p style="color:red;">Error syncing latest updates. Check console logs for details.</p>';
      }
    }

    const starsOptions = document.querySelectorAll('.star-opt');
    starsOptions.forEach(star => {
      star.addEventListener('click', (e) => {
        selectedRatingValue = parseInt(e.target.getAttribute('data-value'));
        highlightInteractiveStars(selectedRatingValue);
      });
    });

    function highlightInteractiveStars(ratingValue) {
      starsOptions.forEach(star => {
        const starVal = parseInt(star.getAttribute('data-value'));
        star.style.color = starVal <= ratingValue ? "#ffaa00" : "#ccc";
      });
    }

    function resetReviewFormInput() {
      selectedRatingValue = 0;
      highlightInteractiveStars(0);
      document.getElementById('review-text-input').value = "";
      document.getElementById('review-submit-error').innerText = "";
    }

    document.getElementById('submit-review-btn').addEventListener('click', async () => {
      const errorEl = document.getElementById('review-submit-error');
      errorEl.innerText = "";

      const activeUser = auth.currentUser;
      if (!activeUser) {
        errorEl.innerText = "Please log in to submit a review.";
        return;
      }
      if (selectedRatingValue === 0) {
        errorEl.innerText = "Please select a star rating.";
        return;
      }
      const textVal = document.getElementById('review-text-input').value.trim();
      if (!textVal) {
        errorEl.innerText = "Review comment field description cannot be blank.";
        return;
      }

      try {
        await addDoc(collection(db, "reviews"), {
          productId: activeProductName,
          rating: selectedRatingValue,
          text: textVal,
          userId: activeUser.uid,
          userName: activeUser.displayName || activeUser.email.split('@')[0],
          timestamp: serverTimestamp()
        });

        resetReviewFormInput();
        await fetchAndRenderModalReviews(activeProductName);
        await loadAggregateRatings();
      } catch (e) {
        console.error(e);
        errorEl.innerText = "Submission error. Check your database connectivity permissions rules.";
      }
    });

    window.closeReviewModal = () => {
      document.getElementById('review-modal').style.display = 'none';
      const authModal = document.getElementById('auth-modal');
      const isAuthOpen = authModal && authModal.style.display === 'flex';
      if (!isAuthOpen) {
        document.body.classList.remove('no-scroll', 'modal-open');
        document.documentElement.classList.remove('no-scroll');
      }
    };
    document.getElementById('close-review-modal').addEventListener('click', window.closeReviewModal);
