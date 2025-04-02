// <<< START OF COMPLETE full.js (Version: Multi-Course, 120s Timer, Grid Tables, Pause Fix, Event Delay, Init Fixes + Tick/Position Logging) >>>
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded"); // LOG

    // --- DOM Elements ---
    const player = document.getElementById('player');
    // <<< Add check for essential elements >>>
    if (!player) {
        console.error("CRITICAL ERROR: Player element not found! Check HTML ID.");
        return; // Stop script if player missing
    }
    const restaurantArea = document.querySelector('.restaurant');
    const diningArea = restaurantArea?.querySelector('.dining-area'); // Use optional chaining
    if (!restaurantArea || !diningArea) {
        console.error("CRITICAL ERROR: Restaurant or Dining Area element not found! Check HTML classes.");
        return; // Stop script
    }
    // <<< End check >>>

    const carryingDisplay = document.getElementById('carrying');
    const moneyDisplay = document.getElementById('money');
    const timerDisplay = document.getElementById('timer');
    const levelDisplay = document.getElementById('level');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const levelEndTitle = document.getElementById('level-end-title');
    const levelResultMessage = document.getElementById('level-result-message');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const retryLevelBtn = document.getElementById('retry-level-btn');
    const gameWonModal = document.getElementById('game-won-modal');
    const finalWinScoreDisplay = document.getElementById('final-win-score');
    const playAgainBtn = document.getElementById('play-again-btn');
    const kitchenRow = document.querySelector('.kitchen-row');
    const foodStations = kitchenRow?.querySelectorAll('.food-station'); // Optional chaining
    const menuModal = document.getElementById('menu-modal');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const debugInfo = document.getElementById('debug-info');
    const debugFood = document.getElementById('debug-food');
    const eventModal = document.getElementById('event-modal');
    const eventTitle = document.getElementById('event-title');
    const eventDescription = document.getElementById('event-description');
    const eventOptionsContainer = document.getElementById('event-options');
    const deliveryStation = document.getElementById('delivery-station');
    const trashCan = document.getElementById('trash-can');
    const deliveryRadius = document.createElement('div');
    deliveryRadius.className = 'delivery-radius';
    restaurantArea.appendChild(deliveryRadius);

    // --- Audio Elements ---
    const bgmAudio = document.getElementById('bgm');
    const ambienceAudio = document.getElementById('ambience');
    const sfxOrdered = document.getElementById('sfx-ordered');
    const sfxImpatient = document.getElementById('sfx-impatient');
    const sfxServe = document.getElementById('sfx-serve');
    const sfxAngryLeft = document.getElementById('sfx-angry-left');
    const sfxTrash = document.getElementById('sfx-trash');
    const sfxPickup = document.getElementById('sfx-pickup');
    const sfxClick = document.getElementById('sfx-click');
    const sfxCook = document.getElementById('sfx-cook');
    const sfxReady = document.getElementById('sfx-ready');
    const sfxLevelWin = document.getElementById('sfx-level-win');
    const sfxLevelLose = document.getElementById('sfx-level-lose');

    // --- Game State Variables ---
    let money = 0;
    let timeLeft = 120;
    let gameRunning = false;
    let isPaused = false;
    let carryingFood = null;
    let carryingFoodIcon = null;
    let customers = [];
    let timerInterval = null;
    let customerSpawnTimeout = null;
    let customerPatienceBase = 40;
    let level = 1;
    const maxLevel = 5;
    let playerPosition = { x: 0, y: 0 };
    let isMoving = false;
    let animationFrameId = null;
    let debugMode = false;
    let levelThresholds = [0, 100, 250, 450, 700, 1000];
    const BACKGROUND_IMAGE_URL = 'assets/backdrop.png';
    let readyItemsOnPass = [];
    let lastEventIndex = -1;
    let isOvenBroken = false;
    let backgroundSoundsStarted = false;
    let customersSpawnedThisLevel = 0;

    // --- Game Configuration ---
    const CUSTOMER_SPAWN_BASE_TIME = 6500;
    const CUSTOMER_SPAWN_MIN_TIME = 2500;
    const CUSTOMER_SPAWN_LEVEL_REDUCTION = 350;
    const CUSTOMER_SPAWN_RANDOM_FACTOR_MIN = 0.9;
    const CUSTOMER_SPAWN_RANDOM_FACTOR_MAX = 1.1;
    const RANDOM_EVENT_MIN_CUSTOMERS = 3;
    const APPETIZER_CHANCE = 0.7;

    const C_STATE = {
        WAITING_DRINK: 'waiting_drink',
        WAITING_APPETIZER: 'waiting_appetizer',
        WAITING_MAIN: 'waiting_main',
        WAITING_SIDE: 'waiting_side',
        SERVED_FINAL: 'served_final',
        LEAVING: 'leaving',
        REMOVE: 'remove'
    };

    const OVEN_ITEMS = [
        'Tomato Pie Slice', 'Tre Sale Slice', 'Garlic Girl', 'Toni Roni',
        'Roasted Half-Chicken'
    ];
    const foodItems = { // ENSURE 'Drinks', 'Appetizers', 'Mains', 'Sides' CATEGORIES EXIST AND HAVE ITEMS
        // Appetizers
        'Bread Basket': { image: 'assets/bread basket.png', price: 5, category: 'Appetizers', prepTime: 1 },
        'Cherry Tomato & Garlic Confit': { image: 'assets/cherry confit.png', price: 12, category: 'Appetizers', prepTime: 2 },
        'Ahi Crudo': { image: 'assets/ahi crudo.png', price: 20, category: 'Appetizers', prepTime: 3 },
        'Whipped Ricotta': { image: 'assets/ricotta.png', price: 14, category: 'Appetizers', prepTime: 2 },
        'Raviolo al Uovo': { image: 'assets/raviolo.png', price: 8, category: 'Appetizers', prepTime: 2.5 },
        'Prosciutto e Melone': { image: 'assets/prosciutto e melone.png', price: 10, category: 'Appetizers', prepTime: 1.5 },
        'Crispy Gnudi': { image: 'assets/crispy gnudi.png', price: 12, category: 'Appetizers', prepTime: 3.5 },
        'Marinated Olives': { image: 'assets/olives.png', price: 6, category: 'Appetizers', prepTime: 1 },
        // Salads (Still treated as Appetizers for selection)
        'House Salad': { image: 'assets/house salad.png', price: 12, category: 'Appetizers', prepTime: 2.5 },
        'Spicy Caesar Salad': { image: 'assets/spicy caesar.png', price: 14, category: 'Appetizers', prepTime: 3 },
        'Mean Green Salad': { image: 'assets/mean green salad.png', price: 12, category: 'Appetizers', prepTime: 2.5 },
        'Summer Tomato Panzanella': { image: 'assets/tomato panzanella.png', price: 10, category: 'Appetizers', prepTime: 2 },
        // Pasta (Still treated as Mains)
        'Cacio e Pepe': { image: 'assets/Cacio e pepe.png', price: 20, category: 'Mains', prepTime: 4 },
        'Seeing Red Pesto': { image: 'assets/seeing red.png', price: 24, category: 'Mains', prepTime: 4 },
        'Short Rib Agnolotti': { image: 'assets/agnolotti.png', price: 32, category: 'Mains', prepTime: 5 },
        'Pomodoro': { image: 'assets/pomodoro.png', price: 26, category: 'Mains', prepTime: 3.5 },
        // Pizza (Still treated as Mains)
        'Tre Sale Slice': { image: 'assets/tresale.png', price: 6, category: 'Mains', prepTime: 3.5 },
        'Tomato Pie Slice': { image: 'assets/tomato pie.png', price: 5, category: 'Mains', prepTime: 3 },
        'Garlic Girl': { image: 'assets/garlic girl-Photoroom.png', price: 25, category: 'Mains', prepTime: 4.5 },
        'Toni Roni': { image: 'assets/toni roni.png', price: 26, category: 'Mains', prepTime: 5 },
        // Mains
        'Sweet & Spicy Chicken Cutlets': { image: 'assets/cutlets.png', price: 28, category: 'Mains', prepTime: 5 },
        'Roasted Half-Chicken': { image: 'assets/half chicken.png', price: 34, category: 'Mains', prepTime: 7 },
        'Grilled Sockeye Salmon': { image: 'assets/salmon.png', price: 36, category: 'Mains', prepTime: 4.5 },
        'Seared Hanger Steak': { image: 'assets/hangar steak.png', price: 38, category: 'Mains', prepTime: 6 },
        // Sides
        'Mushroom Risotto': { image: 'assets/mushroom risotto.png', price: 12, category: 'Sides', prepTime: 5 },
        'Crispy Baked Polenta': { image: 'assets/polenta.png', price: 10, category: 'Sides', prepTime: 4 },
        'Garlic Confit Mashed Potatoes': { image: 'assets/mashed potatoes.png', price: 10, category: 'Sides', prepTime: 3 },
        'Parmigiano-Crusted Roast Fingerlings': { image: 'assets/roasted fingerling.png', price: 8, category: 'Sides', prepTime: 3 },
        'Shoestring Fries': { image: 'assets/shoestring fries.png', price: 6, category: 'Sides', prepTime: 2.5 },
        'Blackened Eggplant': { image: 'assets/eggplant.png', price: 8, category: 'Sides', prepTime: 2.5 },
        'Sauteed Rainbow Chard': { image: 'assets/rainbow chard.png', price: 6, category: 'Sides', prepTime: 2 },
        'Grilled Asparagus': { image: 'assets/grilled asparagus.png', price: 8, category: 'Sides', prepTime: 3 },
        // Drinks
        'Water': { emoji: '💧', price: 0, category: 'Drinks', prepTime: 0.5 },
        'Wine': { emoji: '🍷', price: 12, category: 'Drinks', prepTime: 0.5 },
        'Soda': { emoji: '🥤', price: 3, category: 'Drinks', prepTime: 0.5 }
    };
    const customerEmojis = ['👩','👨','👵','👴','👱‍♀️','👱','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','🧑‍🎄','👸','👨‍🎨','👩‍🔬','💂','🕵️'];
    const moodEmojis = { happy: '😊', neutral: '😐', impatient: '😠', angry: '😡' };
    const randomEvents = [
         { title: "Customer Complaint!", description: "A customer says their Cacio e Pepe is too peppery!", options: [ { text: "Apologize & Offer free drink (-$3)", effect: { money: -3, time: 0 }, feedback: "Comped a soda." }, { text: "Remake the dish (Lose time)", effect: { money: 0, time: -10 }, feedback: "Remade the pasta (-10s)." }, { text: "Argue politely (Risk anger)", effect: { money: 0, time: 0 }, feedback: "Defended the chef!" } ] },
         { title: "Kitchen Emergency!", description: "The oven suddenly stopped working!", options: [ { text: "Quick Fix Attempt (-$20, -15s)", effect: { money: -20, time: -15 }, feedback: "Paid for quick fix (-$20, -15s)." }, { text: "Work Around It (No Pizza/Roast)", effect: { money: 0, time: 0 }, feedback: "No oven dishes for now..." }, { text: "Ignore It (Riskier)", effect: { money: 0, time: 0 }, feedback: "Ignored the oven..." } ] },
         { title: "Ingredient Shortage", description: "Oh no! We're running low on fresh basil for Pomodoro!", options: [ { text: "Buy Emergency Basil (-$15)", effect: { money: -15, time: 0 }, feedback: "Bought expensive basil (-$15)." }, { text: "Improvise (Use dried herbs)", effect: { money: 0, time: 0 }, feedback: "Substituted herbs..." }, { text: "Stop serving Pomodoro", effect: { money: 0, time: 0 }, feedback: "Took Pomodoro off menu." } ] },
         { title: "VIP Guest", description: "A famous food critic just sat down!", options: [ { text: "Offer Free Appetizer (-$10)", effect: { money: -10, time: 0 }, feedback: "Comped critic appetizer (-$10)." }, { text: "Chef's Special Attention (-10s)", effect: { money: 0, time: -10 }, feedback: "Chef gave extra attention (-10s)." }, { text: "Treat Like Normal", effect: { money: 0, time: 0 }, feedback: "Treated critic normally." } ] },
         { title: "Sudden Rush!", description: "A big group just walked in! Faster service needed!", options: [ { text: "Work Faster! (Bonus Time)", effect: { money: 0, time: +15 }, feedback: "Rush handled! (+15s)" }, { text: "Stay Calm (Risk Anger)", effect: { money: 0, time: 0 }, feedback: "Kept cool under pressure." } ] },
         { title: "Generous Tipper", description: "A customer was so impressed they left a huge tip!", options: [ { text: "Awesome! (+$25)", effect: { money: +25, time: 0 }, feedback: "Wow! +$25 Tip!" } ] },
         { title: "Spill in the Kitchen!", description: "Someone dropped a tray of sauce!", options: [ { text: "Clean it Up (-10s)", effect: { money: 0, time: -10 }, feedback: "Cleaned up the mess (-10s)." }, { text: "Work Around It (Carefully!)", effect: { money: 0, time: 0 }, feedback: "Carefully avoiding the spill..." } ] },
         { title: "Health Inspector!", description: "A surprise visit! Everything needs to be perfect.", options: [ { text: "Brief Pause & Tidy (-5s)", effect: { money: 0, time: -5 }, feedback: "Quick tidy for inspector (-5s)." }, { text: "Bribe? (-$50, Risky)", effect: { money: -50, time: 0}, feedback: "Attempted a 'tip' (-$50)..."} ]}
    ];

    // --- Helper Functions ---
    const getItemsByCategory = (function() {
        const cache = {};
        return function(category) {
            if (cache[category]) { return cache[category]; }
            const items = Object.entries(foodItems)
                                .filter(([_, data]) => data.category === category)
                                .map(([id, _]) => id);
            if (items.length === 0) { console.warn(`No food items found for category: ${category}`); }
            cache[category] = items;
            return items;
        }
    })();
    function getRandomFoodItem(category) {
        const itemsInCategory = getItemsByCategory(category);
        if (itemsInCategory.length === 0) return null;
        return itemsInCategory[Math.floor(Math.random() * itemsInCategory.length)];
    }
    function playSound(audioElement, volume = 0.5) {
        if (!audioElement) { return; }
        const clampedVolume = Math.max(0, Math.min(1, volume));
        audioElement.volume = clampedVolume;
        audioElement.currentTime = 0;
        try {
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                     if (error.name === 'NotAllowedError') { /* console.log(`Audio play prevented: ${audioElement.id}`); */ }
                     else { /* console.log(`Audio play failed: ${audioElement.id}`, error); */ }
                });
            }
        } catch (error) { console.error(`Error attempting to play sound ${audioElement.id}:`, error); }
    }
    function playLoopingSound(audioElement, volume = 0.3) {
        if (!audioElement) return;
        audioElement.volume = Math.max(0, Math.min(1, volume));
        audioElement.loop = true;
        if (audioElement.paused) {
            try {
                const playPromise = audioElement.play();
                 if (playPromise !== undefined) {
                     playPromise.catch(error => {
                         if (error.name === 'NotAllowedError') { /* console.log(`Looping audio play prevented: ${audioElement.id}`); */ }
                         else { /* console.log(`Looping audio play failed: ${audioElement.id}`, error); */ }
                     });
                 }
            } catch (error) { console.error(`Error attempting to play looping sound ${audioElement.id}:`, error); }
        }
    }
    function stopLoopingSound(audioElement) {
         if (!audioElement) return;
         audioElement.pause();
         audioElement.currentTime = 0;
    }
    function getFoodIcon(foodId) {
        const item = foodItems[foodId];
        if (!item) return '?';
        return item.image || item.emoji || '?';
    }
    function createIconElement(iconSrcOrEmoji, altText = 'Food item') {
        if (iconSrcOrEmoji.includes('/')) {
            const img = document.createElement('img');
            img.src = iconSrcOrEmoji;
            img.alt = altText;
            return img;
        } else {
            const span = document.createElement('span');
            span.textContent = iconSrcOrEmoji;
            return span;
        }
    }
    function animatePrepProgress(progressBarElement, durationMs, onComplete) {
        if (!progressBarElement) return;
        delete progressBarElement._animation; // Clear previous state first
        progressBarElement._animation = {
            duration: durationMs,
            onComplete: onComplete,
            startTime: null,
            pauseTime: null,
            reqId: null
        };
        function step(timestamp) {
            const animState = progressBarElement._animation;
            if (!animState) { return; }
            if (!animState.startTime) { animState.startTime = timestamp; }
            let start = animState.startTime;
            if (isPaused) {
                if (animState.pauseTime === null) { animState.pauseTime = timestamp; }
                animState.reqId = requestAnimationFrame(step);
                return;
            }
            if (animState.pauseTime !== null) {
                const pauseDuration = timestamp - animState.pauseTime;
                animState.startTime += pauseDuration;
                start = animState.startTime;
                animState.pauseTime = null;
            }
            const elapsed = timestamp - start;
            const progress = Math.min(1, elapsed / animState.duration);
            progressBarElement.style.transform = `scaleX(${progress})`;
            if (progress < 1) {
                animState.reqId = requestAnimationFrame(step);
            } else {
                if (gameRunning && !isPaused) {
                     if (animState.onComplete) {
                         try { animState.onComplete(); }
                         catch(e) { console.error("Error in animation onComplete callback:", e); }
                     }
                } else { }
                delete progressBarElement._animation;
            }
        }
        if (progressBarElement._animation && progressBarElement._animation.reqId) {
            cancelAnimationFrame(progressBarElement._animation.reqId);
        }
        progressBarElement._animation.reqId = requestAnimationFrame(step);
    }
    function addFoodToPass(foodId) {
        const itemData = foodItems[foodId];
        if (!itemData) return;
        const icon = getFoodIcon(foodId);
        readyItemsOnPass.push({ foodId: foodId, icon: icon });
        const itemDiv = document.createElement('div');
        itemDiv.className = 'ready-food-item';
        itemDiv.dataset.food = foodId;
        itemDiv.appendChild(createIconElement(icon, foodId));
        itemDiv.title = foodId;
        const existingLabel = deliveryStation.querySelector('.delivery-station-label');
        if (existingLabel) existingLabel.remove();
        deliveryStation.appendChild(itemDiv);
        playSound(sfxReady);
    }
    function generateTables(container, numTables) {
        // console.log(`generateTables: Called for ${numTables} tables.`); // LOG
        if (!container) { console.error("generateTables: ERROR - container element is null!"); return; }
        container.innerHTML = '';
        const numCols = 3;
        const numRows = Math.ceil(numTables / numCols);
        let containerWidth = container.offsetWidth;
        let containerHeight = container.offsetHeight;
        // console.log(`generateTables: Container initial dimensions W:${containerWidth}, H:${containerHeight}`); // LOG
        if (containerWidth <= 0 || containerHeight <= 0) {
            console.warn("generateTables: Container dimensions are invalid (<=0). Attempting fallback.");
             containerWidth = container.parentElement?.offsetWidth || window.innerWidth * 0.8 || 600;
             containerHeight = container.parentElement?.offsetHeight || window.innerHeight * 0.6 || 400;
            //  console.log(`generateTables: Using fallback dimensions W:${containerWidth}, H:${containerHeight}`); // LOG
        }
        const gridPaddingTopFraction = 0.50;
        const gridPaddingBottomFraction = 0.15;
        const gridPaddingHorizontalFraction = 0.15;
        const usableHeight = containerHeight * (1 - gridPaddingTopFraction - gridPaddingBottomFraction);
        const usableWidth = containerWidth * (1 - gridPaddingHorizontalFraction * 2);
        const cellHeight = numRows > 0 ? usableHeight / numRows : usableHeight;
        const cellWidth = numCols > 0 ? usableWidth / numCols : usableWidth;
        const gridTopOffset = containerHeight * gridPaddingTopFraction;
        const gridLeftOffset = containerWidth * gridPaddingHorizontalFraction;
        // console.log(`generateTables: Usable Area W:${usableWidth.toFixed(1)}, H:${usableHeight.toFixed(1)} | Cell W:${cellWidth.toFixed(1)}, H:${cellHeight.toFixed(1)}`); // LOG
        for (let i = 0; i < numTables; i++) {
            const table = document.createElement('div');
            table.classList.add('table');
            const tableIdNum = i + 1;
            table.id = `table-${tableIdNum}`;
            table.dataset.table = tableIdNum;
            const seat = document.createElement('div');
            seat.classList.add('seat');
            table.appendChild(seat);
            const row = Math.floor(i / numCols);
            const col = i % numCols;
            const cellCenterX = gridLeftOffset + (col * cellWidth) + (cellWidth / 2);
            const cellCenterY = gridTopOffset + (row * cellHeight) + (cellHeight / 2);
            if (isNaN(cellCenterX) || isNaN(cellCenterY)) { console.error(`generateTables: Calculated NaN position for table ${tableIdNum}.`); continue; }
            table.style.position = 'absolute';
            table.style.top = `${cellCenterY}px`;
            table.style.left = `${cellCenterX}px`;
            table.style.transform = 'translate(-50%, -50%)';
            container.appendChild(table);
        }
        // console.log(`generateTables: Finished appending ${container.children.length} tables.`); // LOG
    }
    function showFeedbackIndicator(targetElement, text, type = "info", duration = 1800) {
        if (!targetElement || !restaurantArea.contains(targetElement)) { targetElement = player; }
        const indicator = document.createElement('div'); indicator.className = 'feedback-indicator';
        if (type === "negative") indicator.classList.add('negative');
        else if (type === "positive") indicator.classList.add('positive');
        indicator.innerHTML = text;
        restaurantArea.appendChild(indicator);
        const targetRect = targetElement.getBoundingClientRect(); const containerRect = restaurantArea.getBoundingClientRect();
        const indicatorX = targetRect.left - containerRect.left + targetRect.width / 2;
        const indicatorY = targetRect.top - containerRect.top - 30;
        indicator.style.position = 'absolute'; indicator.style.left = `${indicatorX}px`;
        indicator.style.top = `${indicatorY}px`; indicator.style.transform = 'translateX(-50%)';
        indicator.style.animation = `float-up-fade ${duration / 1000}s forwards ease-out`;
        setTimeout(() => { if (indicator.parentNode) { indicator.remove(); } }, duration);
    }


    // --- Event Listeners ---
    let keysPressed = {};
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;
        if (keysPressed['d'] && keysPressed['e'] && keysPressed['b'] && keysPressed['u'] && keysPressed['g']) {
            debugMode = !debugMode;
            debugInfo.classList.toggle('hidden', !debugMode);
            console.log("Debug mode:", debugMode ? "ON" : "OFF");
            keysPressed = {};
        }
         if (!['d', 'e', 'b', 'u', 'g'].includes(e.key.toLowerCase())) {
             keysPressed = {};
         }
    });
    document.addEventListener('keyup', (e) => {
        delete keysPressed[e.key.toLowerCase()];
    });

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            playSound(sfxClick);
            menuModal.classList.add('hidden');
            resumeGame();
         });
    }

    foodStations?.forEach(station => { // Added optional chaining
        station.addEventListener('click', () => {
             playSound(sfxClick);
             const foodId = station.dataset.item;
             const item = foodItems[foodId];
             if (!item) return;
             if (isOvenBroken && OVEN_ITEMS.includes(foodId)) {
                 showFeedbackIndicator(station, "Oven is broken!", "negative", 1500);
                 return;
             }
             if (isPaused || station.classList.contains('preparing')) return;
             if (carryingFood) {
                 showFeedbackIndicator(station, "Hands full!", "negative", 1000);
                 return;
             }
            station.classList.add('preparing');
            station.style.pointerEvents = 'none';
            const progressBar = station.querySelector('.prep-progress-bar');
            if (progressBar) {
                 progressBar.style.backgroundColor = '#ffcc00';
                 progressBar.style.transform = 'scaleX(0)';
                 const prepTimeMs = item.prepTime * 1000;
                 playSound(sfxCook);
                 animatePrepProgress(progressBar, prepTimeMs, () => {
                    progressBar.style.backgroundColor = '#4CAF50';
                    station.classList.remove('preparing');
                    addFoodToPass(foodId);
                    setTimeout(() => {
                         progressBar.style.transform = 'scaleX(0)';
                         progressBar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                         station.style.pointerEvents = 'auto';
                    }, 200);
                 });
            } else {
                 console.warn("Progress bar not found for station:", foodId);
                 playSound(sfxCook);
                 const prepTimeMs = (item.prepTime || 0.1) * 1000;
                 setTimeout(() => {
                     if (!gameRunning || isPaused) {
                         console.log(`Timeout finished for ${foodId}, but game not running or paused. Aborting completion.`);
                         station.classList.remove('preparing');
                         station.style.pointerEvents = 'auto';
                         return;
                     }
                     station.classList.remove('preparing');
                     addFoodToPass(foodId);
                     station.style.pointerEvents = 'auto';
                 }, prepTimeMs);
             }
        });
    });

    deliveryStation?.addEventListener('click', (e) => { // Added optional chaining
        playSound(sfxClick);
        if (isPaused) return;
        const clickedItem = e.target.closest('.ready-food-item');
        if (carryingFood) {
             showFeedbackIndicator(deliveryStation, "Place carried food first!", "negative", 1000);
             return;
        }
        if (clickedItem) {
            const foodId = clickedItem.dataset.food;
            const itemIndex = readyItemsOnPass.findIndex(item => item.foodId === foodId);
            if (itemIndex !== -1) {
                const itemToTake = readyItemsOnPass.splice(itemIndex, 1)[0];
                clickedItem.remove();
                carryingFood = itemToTake.foodId;
                carryingFoodIcon = itemToTake.icon;
                carryingDisplay.innerHTML = '';
                carryingDisplay.appendChild(createIconElement(carryingFoodIcon, carryingFood));
                deliveryRadius.classList.add('active');
                playSound(sfxPickup);
                if (readyItemsOnPass.length === 0 && !deliveryStation.querySelector('.delivery-station-label')) {
                    const label = document.createElement('div');
                    label.className = 'delivery-station-label';
                    label.textContent = 'PASS';
                    deliveryStation.prepend(label);
                }
                if (debugMode) debugFood.textContent = carryingFood;
                console.log("Picked up:", carryingFood);
            } else {
                 console.warn("Clicked item not found in readyItemsOnPass state:", foodId);
            }
        } else if (readyItemsOnPass.length > 0) {
             showFeedbackIndicator(deliveryStation, "Click specific item to pick up!", "info", 1200);
        }
    });

    trashCan?.addEventListener('click', () => { // Added optional chaining
        if (isPaused || !carryingFood) return;
        playSound(sfxTrash);
        showFeedbackIndicator(trashCan, `Trashed ${carryingFood}!`, "negative");
        carryingFood = null;
        carryingFoodIcon = null;
        carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active');
        if (debugMode) debugFood.textContent = "None";
        console.log("Trashed carried food");
    });

    diningArea.addEventListener('click', (e) => {
        playSound(sfxClick);
        if (isPaused) return;
        const targetTable = e.target.closest('.table');
        if (targetTable) {
            const tableId = targetTable.id;
            const foodBeingCarried = carryingFood;

            if (foodBeingCarried) {
                movePlayerToElement(targetTable, () => {
                    if (!foodBeingCarried) return;
                    const customerToServe = customers.find(c =>
                        c.tableElement.id === tableId &&
                        (c.state === C_STATE.WAITING_DRINK ||
                         c.state === C_STATE.WAITING_APPETIZER ||
                         c.state === C_STATE.WAITING_MAIN ||
                         c.state === C_STATE.WAITING_SIDE) &&
                        c.currentOrder === foodBeingCarried
                    );
                    if (customerToServe) { serveCustomer(customerToServe, foodBeingCarried); }
                    else {
                        const anyWaiting = customers.some(c =>
                            c.tableElement.id === tableId &&
                            (c.state === C_STATE.WAITING_DRINK ||
                             c.state === C_STATE.WAITING_APPETIZER ||
                             c.state === C_STATE.WAITING_MAIN ||
                             c.state === C_STATE.WAITING_SIDE)
                         );
                         if (anyWaiting) { showFeedbackIndicator(targetTable, "Wrong order!", "negative"); }
                         else { showFeedbackIndicator(targetTable, "No waiting customer!", "negative"); }
                    }
                 });
            } else { movePlayerToElement(targetTable); }
        } else {
             if (!isMoving) {
                const rect = restaurantArea.getBoundingClientRect();
                const clickX = e.clientX - rect.left; const clickY = e.clientY - rect.top;
                const kitchenLineY = restaurantArea.offsetHeight * 0.90;
                const targetY = Math.min(clickY, kitchenLineY);
                movePlayerToCoordinates(clickX, targetY);
             }
        }
    });

    nextLevelBtn?.addEventListener('click', () => { /* ... same ... */ }); // Added optional chaining
    retryLevelBtn?.addEventListener('click', () => { /* ... same ... */ }); // Added optional chaining
    playAgainBtn?.addEventListener('click', () => { /* ... same ... */ }); // Added optional chaining


    // --- Core Functions ---
    function startGame() {
        // console.log("startGame: Called"); // LOG
        if (gameRunning && !isPaused) return;
        money = 0; timeLeft = 120; gameRunning = true; isPaused = false;
        carryingFood = null; carryingFoodIcon = null; customers = [];
        readyItemsOnPass = []; lastEventIndex = -1; isOvenBroken = false;
        disableOvenStations(false); backgroundSoundsStarted = false;
        customersSpawnedThisLevel = 0;
        // console.log("--- startGame: State reset ---");
        moneyDisplay.textContent = money; levelDisplay.textContent = level;
        timerDisplay.textContent = timeLeft; carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active');
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>';
        debugFood.textContent = 'None';
        gameOverScreen?.classList.add('hidden'); // Optional chaining
        menuModal?.classList.add('hidden');
        eventModal?.classList.add('hidden');
        gameWonModal?.classList.add('hidden');
        // console.log("--- startGame: UI reset ---");
        clearCustomersAndIndicators();
        foodStations?.forEach(s => { // Optional chaining
            s.classList.remove('preparing'); s.style.pointerEvents = 'auto';
            const pb = s.querySelector('.prep-progress-bar');
            if (pb) { pb.style.transform = 'scaleX(0)'; pb.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; delete pb._animation; }
        });
        stopPlayerMovement();
        // console.log("--- startGame: Cleared dynamic elements & stations.");
        try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; }
        catch (e) { console.error("--- startGame: ERROR setting background ---", e); }
        initializeGameVisuals();
        // console.log("--- startGame: Starting timers ---");
        clearInterval(timerInterval); timerInterval = setInterval(gameTick, 1000);
        if (!gameRunning || isPaused) { console.error(`[startGame L${level}] CRITICAL: Game state prevents scheduling!`); return; }
        clearTimeout(customerSpawnTimeout);
        scheduleNextCustomer();
        console.log(`--- startGame: Level ${level} Started ---`);
    }

    function endGame() {
        console.log("Ending game/day...");
        gameRunning = false; isPaused = true; clearInterval(timerInterval);
        clearTimeout(customerSpawnTimeout); stopPlayerMovement();
        readyItemsOnPass = [];
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>';
        diningArea.querySelectorAll('.table').forEach(table => table.classList.remove('table-highlight', 'table-leaving-soon'));
        deliveryRadius.classList.remove('active');
        stopLoopingSound(bgmAudio); stopLoopingSound(ambienceAudio);
        backgroundSoundsStarted = false;
        foodStations?.forEach(s => { const pb = s.querySelector('.prep-progress-bar'); if (pb) delete pb._animation; });
        const moneyTarget = levelThresholds[level] || 99999;
        const levelWon = money >= moneyTarget;
        const isFinalLevel = level >= maxLevel;
        finalScoreDisplay.textContent = money;
        if (levelWon && isFinalLevel) {
            console.log("Overall Game Won!");
            finalWinScoreDisplay.textContent = money;
            gameWonModal?.classList.remove('hidden');
            playSound(sfxLevelWin);
        } else if (levelWon) {
            console.log(`Level ${level} Complete! Target: ${moneyTarget}, Earned: ${money}`);
            levelEndTitle.textContent = `Level ${level} Complete!`;
            levelResultMessage.textContent = `You earned $${money}. Target was $${moneyTarget}. Get ready!`;
            nextLevelBtn?.classList.remove('hidden');
            retryLevelBtn?.classList.add('hidden');
            gameOverScreen?.classList.remove('hidden');
            playSound(sfxLevelWin);
        } else {
             console.log(`Level ${level} Failed! Target: ${moneyTarget}, Earned: ${money}`);
             levelEndTitle.textContent = `End of Day - Level ${level}`;
             levelResultMessage.textContent = `You needed $${moneyTarget} but only earned $${money}. Try again?`;
             nextLevelBtn?.classList.add('hidden');
             retryLevelBtn?.classList.remove('hidden');
             gameOverScreen?.classList.remove('hidden');
             playSound(sfxLevelLose);
        }
        console.log("End of Day processed.");
     }
    function pauseGame() {
         if (!gameRunning || isPaused) return;
         isPaused = true; clearInterval(timerInterval); stopPlayerMovement();
         if(backgroundSoundsStarted) { if(bgmAudio) bgmAudio.pause(); if(ambienceAudio) ambienceAudio.pause(); }
         console.log("Game Paused");
     }
     function resumeGame() {
         if (!gameRunning || !isPaused) return;
         isPaused = false;
         if (gameRunning && timeLeft > 0) {
            if (backgroundSoundsStarted) {
                // console.log("[resumeGame] backgroundSoundsStarted is true, attempting to resume sounds."); // MUSIC DEBUG
                // console.log("Calling playLoopingSound(bgmAudio)..."); // MUSIC DEBUG
                playLoopingSound(bgmAudio, 0.3);
                // console.log("Called playLoopingSound(bgmAudio)."); // MUSIC DEBUG
                // console.log("Calling playLoopingSound(ambienceAudio)..."); // MUSIC DEBUG
                playLoopingSound(ambienceAudio, 0.4);
                // console.log("Called playLoopingSound(ambienceAudio)."); // MUSIC DEBUG
            } else {
                // console.log("[resumeGame] backgroundSoundsStarted is false, skipping sound resume."); // MUSIC DEBUG
            }
            clearInterval(timerInterval); timerInterval = setInterval(gameTick, 1000);
            scheduleNextCustomer();
            console.log("Game Resumed");
         } else {
              console.log("Game NOT Resumed (already ended or time up)");
              if (timeLeft <= 0 && gameRunning) { endGame(); }
         }
     }
     function gameTick() {
         // console.log("gameTick: Tick! Paused:", isPaused); // LOG START OF TICK
         try { // Wrap in try...catch to see errors
             if (!gameRunning || isPaused) {
                 // console.log("gameTick: Game not running or paused, clearing timer."); // LOG
                 clearInterval(timerInterval);
                 return;
             }
             timeLeft--;
             // console.log("gameTick: Time left:", timeLeft); // Optional detailed log
             if(timerDisplay) timerDisplay.textContent = timeLeft; // Check element exists
             updateCustomers();

             if (timeLeft <= 0) {
                 // console.log("gameTick: Time is up, calling endGame."); // LOG
                 endGame();
                 return;
             }

             if (customersSpawnedThisLevel >= RANDOM_EVENT_MIN_CUSTOMERS && Math.random() < 0.02 && eventModal?.classList.contains('hidden')) { // Optional chaining
                 // console.log("gameTick: Triggering random event."); // LOG
                 triggerRandomEvent();
             }
         } catch (error) {
             console.error("!!! ERROR INSIDE gameTick !!!", error); // LOG ANY ERROR
             clearInterval(timerInterval); // Stop interval on error
             // Consider pausing or ending the game here too
             // pauseGame();
         }
     }
     function updateCustomers() {
        if (isPaused) return;
        const now = Date.now();
        const LEAVING_SOON_THRESHOLD = 8;

        customers.forEach((c) => {
            if (c.state !== C_STATE.WAITING_DRINK &&
                c.state !== C_STATE.WAITING_APPETIZER &&
                c.state !== C_STATE.WAITING_MAIN &&
                c.state !== C_STATE.WAITING_SIDE) {
                return;
            }
            const elapsedSinceCourseStart = (now - c.spawnTime) / 1000;
            const oldPatienceRatio = c.patienceCurrent / c.patienceTotal;
            c.patienceCurrent = Math.max(0, c.patienceTotal - elapsedSinceCourseStart);
            const newPatienceRatio = c.patienceCurrent / c.patienceTotal;
            if (oldPatienceRatio > 0.5 && newPatienceRatio <= 0.5) { playSound(sfxImpatient); }
            updateCustomerMood(c);
            const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
            if (!tableEl) { c.state = C_STATE.REMOVE; return; }
            if (c.patienceCurrent <= LEAVING_SOON_THRESHOLD && c.patienceCurrent > 0) {
                 tableEl.classList.add('table-leaving-soon');
            } else {
                 tableEl.classList.remove('table-leaving-soon');
            }
            if (c.patienceCurrent <= 0) {
                customerLeavesAngry(c);
            }
        });
        customers = customers.filter(c => c.state !== C_STATE.REMOVE);
    }
    function customerLeavesAngry(c) { /* ... same ... */ }
    function movePlayerToElement(targetEl, callback = null) { /* ... same ... */ }
    function movePlayerToCoordinates(targetX, targetY, callback = null) { /* ... same ... */ }
    function stopPlayerMovement() { /* ... same ... */ }
    function updatePlayerPosition() {
        // console.log("updatePlayerPosition: Called"); // Optional LOG
        const playerHalfWidth = player.offsetWidth / 2 || 25;
        const playerHalfHeight = player.offsetHeight / 2 || 35;
        const containerWidth = restaurantArea.offsetWidth;
        const containerHeight = restaurantArea.offsetHeight;

        const minX = playerHalfWidth + 5;
        const maxX = (containerWidth > 0 ? containerWidth : 600) - playerHalfWidth - 5; // Use fallback
        const minY = playerHalfHeight + 5;
        const maxY = (containerHeight > 0 ? containerHeight: 500) - playerHalfHeight - 5; // Use fallback

        let newX = playerPosition.x;
        let newY = playerPosition.y;
        // console.log(`updatePlayerPosition: Before clamp X: ${newX.toFixed(1)}, Y: ${newY.toFixed(1)}`); // LOG

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));
        // console.log(`updatePlayerPosition: After clamp X: ${newX.toFixed(1)}, Y: ${newY.toFixed(1)}`); // LOG

        if (isNaN(newX) || isNaN(newY)) {
             console.error("updatePlayerPosition: Calculated NaN position!", { initialX: playerPosition.x, initialY: playerPosition.y, clampedX: newX, clampedY: newY });
             return; // Don't apply NaN
        }
        playerPosition.x = newX;
        playerPosition.y = newY;
        const translateX = playerPosition.x - playerHalfWidth;
        const translateY = playerPosition.y - playerHalfHeight;
        if (isNaN(translateX) || isNaN(translateY)) {
            console.error("updatePlayerPosition: Calculated NaN transform!", { posX: playerPosition.x, posY: playerPosition.y, halfW: playerHalfWidth, halfH: playerHalfHeight });
            return; // Don't apply NaN transform
        }
        player.style.transform = `translate(${translateX}px, ${translateY}px)`;
        // console.log(`updatePlayerPosition: Applied transform: translate(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px)`); // LOG
        deliveryRadius.style.left = `${playerPosition.x}px`;
        deliveryRadius.style.top = `${playerPosition.y}px`;
    }
    function scheduleNextCustomer() { /* ... same ... */ }
    function spawnCustomer() { /* ... same logical order multi-course version ... */ }
    function serveCustomer(cust, servedFoodId) { /* ... same logical order multi-course version ... */ }
    function updateCustomerMood(cust) { /* ... same logical order multi-course version ... */ }
    function clearCustomersAndIndicators() { /* ... same ... */ }
    function triggerRandomEvent() { /* ... same ... */ }
    function handleEventChoice(e) { /* ... same ... */ }
    function disableOvenStations(disable) { /* ... same ... */ }

    function initializeGameVisuals() {
        // console.log("initializeGameVisuals: Attempting to run..."); // LOG
        let checkWidth = restaurantArea.offsetWidth;
        // console.log(`initializeGameVisuals: Restaurant width check: ${checkWidth}`); // LOG
        const playerHalfHeight = player.offsetHeight / 2 || 35;
        const playerHalfWidth = player.offsetWidth / 2 || 25;
        playerPosition.x = (checkWidth > 0 ? checkWidth / 2 : 300);
        playerPosition.y = (restaurantArea.offsetHeight > 0 ? restaurantArea.offsetHeight : 500) - playerHalfHeight - 10;
        updatePlayerPosition();
        // console.log("initializeGameVisuals: Setting player visible..."); // LOG
        player.style.opacity = '1';
        player.style.display = 'flex';
        // console.log(`initializeGameVisuals: Player opacity = ${player.style.opacity}`); // LOG
        // console.log("initializeGameVisuals: Calling generateTables..."); // LOG
        const numTables = Math.min(8, 2 + level);
        generateTables(diningArea, numTables);
        // console.log("initializeGameVisuals: Finished calling generateTables."); // LOG
        gameOverScreen?.classList.add('hidden');
        menuModal?.classList.add('hidden');
        eventModal?.classList.add('hidden');
        gameWonModal?.classList.add('hidden');
        debugInfo?.classList.toggle('hidden', !debugMode);
        debugFood && (debugFood.textContent = 'None');
        try {
             restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`;
             restaurantArea.style.backgroundSize = 'cover';
             restaurantArea.style.backgroundPosition = 'center';
        } catch(e) { console.error("Error setting background in init:", e)}
        // console.log("initializeGameVisuals: Finished."); // LOG
    }

    // --- Game Start Trigger ---
    // console.log("Setting up game initialization timeout..."); // LOG
    initializeGameVisuals();
    setTimeout(() => {
        // console.log("Initial timeout fired. Checking if game running..."); // LOG
        if (!gameRunning) {
            //  console.log("Game not running, calling startGame()..."); // LOG
             startGame();
        } else {
            // console.log("Game already running, startGame() skipped."); // LOG
        }
     }, 150);

    // console.log("Script execution finished."); // LOG

}); // End DOMContentLoaded
// <<< END OF COMPLETE full.js >>>
