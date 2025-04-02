// <<< START OF COMPLETE full.js >>>
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const player = document.getElementById('player');
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
    const restaurantArea = document.querySelector('.restaurant');
    const diningArea = restaurantArea.querySelector('.dining-area');
    const kitchenRow = document.querySelector('.kitchen-row');
    const foodStations = kitchenRow.querySelectorAll('.food-station');
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
    let timeLeft = 120; // Default timer (set in startGame)
    let gameRunning = false;
    let isPaused = false;
    let carryingFood = null;
    let carryingFoodIcon = null;
    let customers = [];
    let timerInterval = null;
    let customerSpawnTimeout = null;
    let customerPatienceBase = 40; // Increased slightly for multi-course
    let level = 1;
    const maxLevel = 5;
    let playerPosition = { x: 0, y: 0 };
    let isMoving = false;
    let animationFrameId = null;
    let debugMode = false;
    let levelThresholds = [0, 100, 250, 450, 700, 1000]; // Adjusted thresholds for multi-course potential
    const BACKGROUND_IMAGE_URL = 'assets/backdrop.png';
    let readyItemsOnPass = [];
    let lastEventIndex = -1;
    let isOvenBroken = false;
    let backgroundSoundsStarted = false;
    let customersSpawnedThisLevel = 0;

    // --- Game Configuration ---
    const CUSTOMER_SPAWN_BASE_TIME = 6500; // Slightly longer base time
    const CUSTOMER_SPAWN_MIN_TIME = 2500;
    const CUSTOMER_SPAWN_LEVEL_REDUCTION = 350;
    const CUSTOMER_SPAWN_RANDOM_FACTOR_MIN = 0.9;
    const CUSTOMER_SPAWN_RANDOM_FACTOR_MAX = 1.1;
    const RANDOM_EVENT_MIN_CUSTOMERS = 3;
    const APPETIZER_CHANCE = 0.7; // 70% chance a customer wants an appetizer

    // Customer States (NEW)
    const C_STATE = {
        WAITING_APPETIZER: 'waiting_appetizer',
        WAITING_MAIN: 'waiting_main',
        WAITING_SIDE: 'waiting_side',
        SERVED_FINAL: 'served_final', // All courses served
        LEAVING: 'leaving',       // Angry leave
        REMOVE: 'remove'          // To be filtered out
    };

    const OVEN_ITEMS = [
        'Tomato Pie Slice', 'Tre Sale Slice', 'Garlic Girl', 'Toni Roni',
        'Roasted Half-Chicken'
    ];
    const foodItems = { // Master list - ENSURE YOU HAVE ITEMS IN 'Appetizers', 'Mains', 'Sides' categories
        // Appetizers
        'Bread Basket': { image: 'assets/bread basket.png', price: 5, category: 'Appetizers', prepTime: 1 },
        'Cherry Tomato & Garlic Confit': { image: 'assets/cherry confit.png', price: 12, category: 'Appetizers', prepTime: 2 },
        'Ahi Crudo': { image: 'assets/ahi crudo.png', price: 20, category: 'Appetizers', prepTime: 3 },
        'Whipped Ricotta': { image: 'assets/ricotta.png', price: 14, category: 'Appetizers', prepTime: 2 },
        'Raviolo al Uovo': { image: 'assets/raviolo.png', price: 8, category: 'Appetizers', prepTime: 2.5 },
        'Prosciutto e Melone': { image: 'assets/prosciutto e melone.png', price: 10, category: 'Appetizers', prepTime: 1.5 },
        'Crispy Gnudi': { image: 'assets/crispy gnudi.png', price: 12, category: 'Appetizers', prepTime: 3.5 },
        'Marinated Olives': { image: 'assets/olives.png', price: 6, category: 'Appetizers', prepTime: 1 },
        // Salads (Treat as Appetizers for simplicity or create separate logic)
        'House Salad': { image: 'assets/house salad.png', price: 12, category: 'Appetizers', prepTime: 2.5 }, // Changed category for simplicity
        'Spicy Caesar Salad': { image: 'assets/spicy caesar.png', price: 14, category: 'Appetizers', prepTime: 3 }, // Changed category
        'Mean Green Salad': { image: 'assets/mean green salad.png', price: 12, category: 'Appetizers', prepTime: 2.5 }, // Changed category
        'Summer Tomato Panzanella': { image: 'assets/tomato panzanella.png', price: 10, category: 'Appetizers', prepTime: 2 }, // Changed category
        // Pasta (Treat as Mains)
        'Cacio e Pepe': { image: 'assets/Cacio e pepe.png', price: 20, category: 'Mains', prepTime: 4 }, // Changed category
        'Seeing Red Pesto': { image: 'assets/seeing red.png', price: 24, category: 'Mains', prepTime: 4 }, // Changed category
        'Short Rib Agnolotti': { image: 'assets/agnolotti.png', price: 32, category: 'Mains', prepTime: 5 }, // Changed category
        'Pomodoro': { image: 'assets/pomodoro.png', price: 26, category: 'Mains', prepTime: 3.5 }, // Changed category
        // Pizza (Treat as Mains)
        'Tre Sale Slice': { image: 'assets/tresale.png', price: 6, category: 'Mains', prepTime: 3.5 }, // Changed category
        'Tomato Pie Slice': { image: 'assets/tomato pie.png', price: 5, category: 'Mains', prepTime: 3 }, // Changed category
        'Garlic Girl': { image: 'assets/garlic girl-Photoroom.png', price: 25, category: 'Mains', prepTime: 4.5 }, // Changed category
        'Toni Roni': { image: 'assets/toni roni.png', price: 26, category: 'Mains', prepTime: 5 }, // Changed category
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
        // Drinks (Not part of meal plan for now)
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
            if (cache[category]) {
                return cache[category];
            }
            const items = Object.entries(foodItems)
                                .filter(([_, data]) => data.category === category)
                                .map(([id, _]) => id);
            if (items.length === 0) {
                console.warn(`No food items found for category: ${category}`);
            }
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
        // console.log(`generateTables: Called for ${numTables} tables.`); // DEBUG LOG
        container.innerHTML = '';
        const numCols = 3;
        const numRows = Math.ceil(numTables / numCols);
        let containerWidth = container.offsetWidth;
        let containerHeight = container.offsetHeight;
        // console.log(`generateTables: Container initial dimensions W:${containerWidth}, H:${containerHeight}`); // DEBUG LOG
        if (containerWidth === 0 || containerHeight === 0) {
            console.warn("generateTables: Container dimensions are ZERO. Using fallback dimensions (may be inaccurate).");
             containerWidth = container.parentElement?.offsetWidth || window.innerWidth * 0.8;
             containerHeight = container.parentElement?.offsetHeight || window.innerHeight * 0.6;
             // console.log(`generateTables: Using fallback dimensions W:${containerWidth}, H:${containerHeight}`); // DEBUG LOG
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
        // console.log(`generateTables: Usable Area W:${usableWidth.toFixed(1)}, H:${usableHeight.toFixed(1)} | Cell W:${cellWidth.toFixed(1)}, H:${cellHeight.toFixed(1)}`); // DEBUG LOG
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
            if (isNaN(cellCenterX) || isNaN(cellCenterY)) {
                console.error(`generateTables: Calculated NaN position for table ${tableIdNum}. Aborting placement.`);
                continue;
            }
            table.style.position = 'absolute';
            table.style.top = `${cellCenterY}px`;
            table.style.left = `${cellCenterX}px`;
            table.style.transform = 'translate(-50%, -50%)';
            container.appendChild(table);
        }
        // console.log(`generateTables: Finished appending ${container.children.length} tables.`); // DEBUG LOG
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

    foodStations.forEach(station => {
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

    deliveryStation.addEventListener('click', (e) => {
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

    trashCan.addEventListener('click', () => {
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
            const foodBeingCarried = carryingFood; // Capture food before move

            if (foodBeingCarried) {
                movePlayerToElement(targetTable, () => { // Callback runs on arrival
                    if (!foodBeingCarried) return; // Check if still carrying *this* food
                    const customerToServe = customers.find(c =>
                        c.tableElement.id === tableId &&
                        (c.state === C_STATE.WAITING_APPETIZER ||
                         c.state === C_STATE.WAITING_MAIN ||
                         c.state === C_STATE.WAITING_SIDE) &&
                        c.currentOrder === foodBeingCarried // Match specific food
                    );

                    if (customerToServe) {
                        serveCustomer(customerToServe, foodBeingCarried); // Serve the matched customer
                    } else { // No match found at this table for this food *now*
                        const anyWaiting = customers.some(c =>
                            c.tableElement.id === tableId &&
                            (c.state === C_STATE.WAITING_APPETIZER ||
                             c.state === C_STATE.WAITING_MAIN ||
                             c.state === C_STATE.WAITING_SIDE)
                         );
                         if (anyWaiting) {
                             showFeedbackIndicator(targetTable, "Wrong order!", "negative");
                         } else {
                             showFeedbackIndicator(targetTable, "No waiting customer!", "negative");
                         }
                    }
                 });
            } else { // Not carrying food, just move
                 movePlayerToElement(targetTable);
            }
        } else { // Clicked on floor
             if (!isMoving) {
                const rect = restaurantArea.getBoundingClientRect();
                const clickX = e.clientX - rect.left; const clickY = e.clientY - rect.top;
                const kitchenLineY = restaurantArea.offsetHeight * 0.90;
                const targetY = Math.min(clickY, kitchenLineY);
                movePlayerToCoordinates(clickX, targetY);
             }
        }
    });

    nextLevelBtn.addEventListener('click', () => {
        playSound(sfxClick);
        gameOverScreen.classList.add('hidden');
        level++;
        startGame();
    });

    retryLevelBtn.addEventListener('click', () => {
        playSound(sfxClick);
        gameOverScreen.classList.add('hidden');
        startGame();
    });

    playAgainBtn.addEventListener('click', () => {
        playSound(sfxClick);
        gameWonModal.classList.add('hidden');
        level = 1;
        startGame();
    });

    // --- Core Functions ---

    function startGame() {
        if (gameRunning && !isPaused) return;
        console.log(`--- startGame: Starting Level ${level} ---`);
        money = 0; timeLeft = 120; gameRunning = true; isPaused = false;
        carryingFood = null; carryingFoodIcon = null; customers = [];
        readyItemsOnPass = []; lastEventIndex = -1; isOvenBroken = false;
        disableOvenStations(false); backgroundSoundsStarted = false;
        customersSpawnedThisLevel = 0;
        console.log("--- startGame: State reset ---");
        moneyDisplay.textContent = money; levelDisplay.textContent = level;
        timerDisplay.textContent = timeLeft; carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active');
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>';
        debugFood.textContent = 'None';
        gameOverScreen.classList.add('hidden'); menuModal.classList.add('hidden');
        eventModal.classList.add('hidden'); gameWonModal.classList.add('hidden');
        console.log("--- startGame: UI reset ---");
        clearCustomersAndIndicators(); // Clear old tables/customers first
        foodStations.forEach(s => { // Reset stations
            s.classList.remove('preparing'); s.style.pointerEvents = 'auto';
            const pb = s.querySelector('.prep-progress-bar');
            if (pb) { pb.style.transform = 'scaleX(0)'; pb.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; delete pb._animation; }
        });
        stopPlayerMovement();
        console.log("--- startGame: Cleared dynamic elements & stations.");
        try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; }
        catch (e) { console.error("--- startGame: ERROR setting background ---", e); }
        initializeGameVisuals(); // Includes table generation
        console.log("--- startGame: Starting timers ---");
        clearInterval(timerInterval); timerInterval = setInterval(gameTick, 1000);
        if (!gameRunning || isPaused) {
            console.error(`[startGame L${level}] CRITICAL: Game state prevents scheduling!`);
            return;
        }
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
        foodStations.forEach(s => { const pb = s.querySelector('.prep-progress-bar'); if (pb) delete pb._animation; });
        const moneyTarget = levelThresholds[level] || 99999;
        const levelWon = money >= moneyTarget;
        const isFinalLevel = level >= maxLevel;
        finalScoreDisplay.textContent = money;
        if (levelWon && isFinalLevel) {
            console.log("Overall Game Won!");
            finalWinScoreDisplay.textContent = money;
            gameWonModal.classList.remove('hidden');
            playSound(sfxLevelWin);
        } else if (levelWon) {
            console.log(`Level ${level} Complete! Target: ${moneyTarget}, Earned: ${money}`);
            levelEndTitle.textContent = `Level ${level} Complete!`;
            levelResultMessage.textContent = `You earned $${money}. Target was $${moneyTarget}. Get ready!`;
            nextLevelBtn.classList.remove('hidden');
            retryLevelBtn.classList.add('hidden');
            gameOverScreen.classList.remove('hidden');
            playSound(sfxLevelWin);
        } else {
             console.log(`Level ${level} Failed! Target: ${moneyTarget}, Earned: ${money}`);
             levelEndTitle.textContent = `End of Day - Level ${level}`;
             levelResultMessage.textContent = `You needed $${moneyTarget} but only earned $${money}. Try again?`;
             nextLevelBtn.classList.add('hidden');
             retryLevelBtn.classList.remove('hidden');
             gameOverScreen.classList.remove('hidden');
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
         if (!gameRunning || isPaused) { clearInterval(timerInterval); return; }
         timeLeft--;
         timerDisplay.textContent = timeLeft;
         updateCustomers();
         if (timeLeft <= 0) {
             endGame();
             return;
         }
         if (customersSpawnedThisLevel >= RANDOM_EVENT_MIN_CUSTOMERS && Math.random() < 0.02 && eventModal.classList.contains('hidden')) {
             triggerRandomEvent();
         }
     }

    function updateCustomers() {
        if (isPaused) return;
        const now = Date.now();
        const LEAVING_SOON_THRESHOLD = 8;

        customers.forEach((c) => {
            if (c.state !== C_STATE.WAITING_APPETIZER &&
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

    function customerLeavesAngry(c) {
        if (!c || c.state === C_STATE.LEAVING || c.state === C_STATE.REMOVE) return;
        playSound(sfxAngryLeft);
        console.log("Customer leaving angry:", c.id, "from table:", c.tableElement.id, "while waiting for:", c.currentOrder);
        c.state = C_STATE.LEAVING;
        const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
        showFeedbackIndicator(c.element || tableEl || player, "Left Angry! 😡", "negative");
        if (tableEl) {
            tableEl.classList.remove('table-highlight', 'table-leaving-soon');
        }
        if (c.element) {
            c.element.style.transition = 'opacity 0.5s ease';
            c.element.style.opacity = '0';
        }
        setTimeout(() => {
            if (c.element && c.element.parentNode) { c.element.remove(); }
            c.state = C_STATE.REMOVE;
        }, 500);
    }

    function movePlayerToElement(targetEl, callback = null) {
        if (isPaused || !targetEl) return;
        const restRect = restaurantArea.getBoundingClientRect();
        const plyH = player.offsetHeight / 2 || 35;
        const plyW = player.offsetWidth / 2 || 25;
        let targetX, targetY;
        if (targetEl.closest('.kitchen-row')) {
            const stationInteractionPoint = targetEl.closest('.food-station, #trash-can');
            const targetRect = stationInteractionPoint.getBoundingClientRect();
            const stationCenterXViewport = targetRect.left + targetRect.width / 2;
            targetX = stationCenterXViewport - restRect.left;
            targetY = restaurantArea.offsetHeight - plyH - 10;
             const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5;
             targetX = Math.max(minX, Math.min(maxX, targetX));
        } else if (targetEl.closest('.table') || targetEl === deliveryStation) {
            const interactionElement = targetEl.closest('.table') || deliveryStation;
            const targetRect = interactionElement.getBoundingClientRect();
            targetX = targetRect.left - restRect.left + targetRect.width / 2;
            targetY = targetRect.top - restRect.top + targetRect.height / 2;
        } else { return; }
        movePlayerToCoordinates(targetX, targetY, callback);
    }

    function movePlayerToCoordinates(targetX, targetY, callback = null) {
        if (isPaused || isMoving) { return; };
        isMoving = true;
        const startX = playerPosition.x; const startY = playerPosition.y;
        const distance = Math.hypot(targetX - startX, targetY - startY);
        if (distance < 1) {
            isMoving = false;
            if (callback) { try { callback(); } catch (e) { console.error("Move CB Error (near):", e); } }
            return;
        }
        const playerSpeed = 400; const durationMs = (distance / playerSpeed) * 1000;
        let startTime = null;
        function step(timestamp) {
            if (isPaused) { cancelAnimationFrame(animationFrameId); animationFrameId = null; isMoving = false; return; }
            if (!isMoving) { cancelAnimationFrame(animationFrameId); animationFrameId = null; return; }
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(1, elapsed / durationMs);
            playerPosition.x = startX + (targetX - startX) * progress;
            playerPosition.y = startY + (targetY - startY) * progress;
            updatePlayerPosition();
            if (progress < 1) { animationFrameId = requestAnimationFrame(step); }
            else {
                playerPosition.x = targetX; playerPosition.y = targetY; updatePlayerPosition();
                isMoving = false; animationFrameId = null;
                if (callback) { try { callback(); } catch (e) { console.error("Move CB Error (end):", e); } }
            }
        }
        cancelAnimationFrame(animationFrameId); animationFrameId = requestAnimationFrame(step);
    }

    function stopPlayerMovement() {
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
        isMoving = false;
    }

    function updatePlayerPosition() {
        const playerHalfWidth = player.offsetWidth / 2 || 25; const playerHalfHeight = player.offsetHeight / 2 || 35;
        const minX = playerHalfWidth + 5; const maxX = restaurantArea.offsetWidth - playerHalfWidth - 5;
        const minY = playerHalfHeight + 5; const maxY = restaurantArea.offsetHeight - playerHalfHeight - 5;
        playerPosition.x = Math.max(minX, Math.min(maxX, playerPosition.x));
        playerPosition.y = Math.max(minY, Math.min(maxY, playerPosition.y));
        player.style.transform = `translate(${playerPosition.x - playerHalfWidth}px, ${playerPosition.y - playerHalfHeight}px)`;
        deliveryRadius.style.left = `${playerPosition.x}px`; deliveryRadius.style.top = `${playerPosition.y}px`;
    }

    function scheduleNextCustomer() {
        if (!gameRunning || isPaused) { clearTimeout(customerSpawnTimeout); return; }
        clearTimeout(customerSpawnTimeout);
        const baseDelay = Math.max( CUSTOMER_SPAWN_MIN_TIME, CUSTOMER_SPAWN_BASE_TIME - (level - 1) * CUSTOMER_SPAWN_LEVEL_REDUCTION );
        const randomMultiplier = CUSTOMER_SPAWN_RANDOM_FACTOR_MIN + Math.random() * (CUSTOMER_SPAWN_RANDOM_FACTOR_MAX - CUSTOMER_SPAWN_RANDOM_FACTOR_MIN);
        const finalDelay = baseDelay * randomMultiplier;
        customerSpawnTimeout = setTimeout(spawnCustomer, finalDelay);
    }

    function spawnCustomer() {
        if (!gameRunning || isPaused) { scheduleNextCustomer(); return; }
        try {
            const allTables = Array.from(diningArea.querySelectorAll('.table'));
            if (allTables.length === 0) { scheduleNextCustomer(); return; }
            const potentialTables = allTables.filter(table => {
                return !customers.some(c => c.tableElement.id === table.id && c.state !== C_STATE.LEAVING && c.state !== C_STATE.REMOVE);
            });
            if (potentialTables.length > 0) {
                 if (!backgroundSoundsStarted) {
                     // console.log("[spawnCustomer] Checking backgroundSoundsStarted: false"); // MUSIC DEBUG
                     // console.log("First customer spawning, attempting to start background sounds."); // MUSIC DEBUG
                     // console.log("Calling playLoopingSound(bgmAudio)..."); // MUSIC DEBUG
                     playLoopingSound(bgmAudio, 0.3);
                     // console.log("Called playLoopingSound(bgmAudio)."); // MUSIC DEBUG
                     // console.log("Calling playLoopingSound(ambienceAudio)..."); // MUSIC DEBUG
                     playLoopingSound(ambienceAudio, 0.4);
                     // console.log("Called playLoopingSound(ambienceAudio)."); // MUSIC DEBUG
                     backgroundSoundsStarted = true;
                     // console.log(`[spawnCustomer] backgroundSoundsStarted set to true.`); // MUSIC DEBUG
                 } else {
                    // console.log("[spawnCustomer] backgroundSoundsStarted is already true, skipping sound start."); // MUSIC DEBUG
                 }
                playSound(sfxOrdered);
                const tableElement = potentialTables[Math.floor(Math.random() * potentialTables.length)];
                const seatElement = tableElement.querySelector('.seat');
                if (!seatElement) { scheduleNextCustomer(); return; }
                const wantsAppetizer = Math.random() < APPETIZER_CHANCE;
                const mealPlan = {
                    appetizer: wantsAppetizer ? getRandomFoodItem('Appetizers') : null,
                    main: getRandomFoodItem('Mains'),
                    side: getRandomFoodItem('Sides')
                };
                if (!mealPlan.main || !mealPlan.side) {
                    console.warn("Could not generate full meal plan (missing main or side). Skipping customer spawn.");
                    scheduleNextCustomer(); return;
                }
                 if (wantsAppetizer && !mealPlan.appetizer) {
                    console.warn("Customer wanted appetizer but none found. Spawning without appetizer.");
                    mealPlan.appetizer = null;
                }
                let currentOrder = null; let initialState = null;
                if (mealPlan.appetizer) { currentOrder = mealPlan.appetizer; initialState = C_STATE.WAITING_APPETIZER; }
                else { currentOrder = mealPlan.main; initialState = C_STATE.WAITING_MAIN; }
                const custEl = document.createElement('div'); custEl.className = 'customer';
                custEl.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)]; custEl.style.opacity = '0';
                const foodData = foodItems[currentOrder]; const orderIcon = getFoodIcon(currentOrder);
                const bubble = document.createElement('div'); bubble.className = 'speech-bubble';
                bubble.innerHTML = `<div class="dish-name">${currentOrder}</div><div class="dish-price">$${foodData.price}</div><div class="dish-emoji"></div>`;
                const dishEmojiContainer = bubble.querySelector('.dish-emoji'); dishEmojiContainer.appendChild(createIconElement(orderIcon, currentOrder));
                bubble.style.opacity = '0'; const moodIndicator = document.createElement('div'); moodIndicator.className = 'mood-indicator';
                moodIndicator.textContent = moodEmojis.happy; custEl.appendChild(moodIndicator); custEl.appendChild(bubble);
                seatElement.appendChild(custEl);
                requestAnimationFrame(() => {
                    custEl.style.transition = 'opacity 0.3s ease-in'; bubble.style.transition = 'opacity 0.3s ease-in 0.1s';
                    custEl.style.opacity = '1'; bubble.style.opacity = '1';
                });
                const customerId = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`;
                const patienceTotal = Math.max(20, customerPatienceBase - (level - 1) * 2);
                const newCustomer = {
                    id: customerId, element: custEl, tableElement: tableElement, mealPlan: mealPlan,
                    currentOrder: currentOrder, state: initialState, orderPrice: 0, spawnTime: Date.now(),
                    patienceTotal: patienceTotal, patienceCurrent: patienceTotal,
                    moodIndicator: moodIndicator, bubbleElement: bubble
                };
                customers.push(newCustomer); customersSpawnedThisLevel++;
                tableElement.classList.add('table-highlight');
            } else { }
        } catch (error) { console.error("Error during spawnCustomer:", error); }
        scheduleNextCustomer();
    }

    function serveCustomer(cust, servedFoodId) {
        if (!cust || cust.currentOrder !== servedFoodId ||
            (cust.state !== C_STATE.WAITING_APPETIZER && cust.state !== C_STATE.WAITING_MAIN && cust.state !== C_STATE.WAITING_SIDE) )
        { console.warn("serveCustomer called with mismatched food/customer state:", cust?.id, servedFoodId, cust?.currentOrder, cust?.state); return; }

        playSound(sfxServe);
        const servedItemData = foodItems[servedFoodId];
        if (servedItemData) { cust.orderPrice += servedItemData.price; }
        else { console.warn("Data not found for served item:", servedFoodId); }

        let nextOrder = null; let nextState = null;
        if (cust.state === C_STATE.WAITING_APPETIZER) { nextOrder = cust.mealPlan.main; nextState = C_STATE.WAITING_MAIN; }
        else if (cust.state === C_STATE.WAITING_MAIN) { nextOrder = cust.mealPlan.side; nextState = C_STATE.WAITING_SIDE; }
        else if (cust.state === C_STATE.WAITING_SIDE) { nextOrder = null; nextState = C_STATE.SERVED_FINAL; }

        if (nextOrder && nextState) {
            cust.state = nextState; cust.currentOrder = nextOrder; cust.spawnTime = Date.now();
            cust.patienceCurrent = cust.patienceTotal; updateCustomerMood(cust);
            const nextItemData = foodItems[nextOrder]; const nextOrderIcon = getFoodIcon(nextOrder);
            if (cust.bubbleElement && nextItemData) {
                cust.bubbleElement.innerHTML = `<div class="dish-name">${nextOrder}</div><div class="dish-price">$${nextItemData.price}</div><div class="dish-emoji"></div>`;
                const dishEmojiContainer = cust.bubbleElement.querySelector('.dish-emoji');
                dishEmojiContainer.innerHTML = ''; dishEmojiContainer.appendChild(createIconElement(nextOrderIcon, nextOrder));
            }
            console.log(`Customer ${cust.id} served ${servedFoodId}, now waiting for ${nextOrder}`);
        } else {
            cust.state = C_STATE.SERVED_FINAL; cust.currentOrder = null;
            const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal;
            let tipMultiplier = 0.05; if (patienceRatio > 0.8) tipMultiplier = 0.25; else if (patienceRatio > 0.5) tipMultiplier = 0.18; else if (patienceRatio > 0.2) tipMultiplier = 0.12;
            const tipAmount = Math.ceil(cust.orderPrice * tipMultiplier);
            const totalEarned = cust.orderPrice + tipAmount;
            money += totalEarned; moneyDisplay.textContent = money;
            showFeedbackIndicator(cust.element || cust.tableElement || player, `+ $${cust.orderPrice} Meal<br/>+ $${tipAmount} Tip!`, "positive");
            cust.moodIndicator.textContent = '😋'; if (cust.bubbleElement) cust.bubbleElement.innerHTML = "Grazie! 👌";
            const tableEl = diningArea.querySelector(`#${cust.tableElement.id}`);
            if (tableEl) { tableEl.classList.remove('table-highlight', 'table-leaving-soon'); }
            if (cust.element) { cust.element.style.transition = 'opacity 1s ease 0.5s'; cust.element.style.opacity = '0'; }
            setTimeout(() => { if (cust.element && cust.element.parentNode) { cust.element.remove(); } cust.state = C_STATE.REMOVE; }, 1500);
             console.log(`Customer ${cust.id} served final course (${servedFoodId}). Total Earned: $${totalEarned}`);
        }
        carryingFood = null; carryingFoodIcon = null; carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active'); if (debugMode) debugFood.textContent = "None";
    }

    function updateCustomerMood(cust) {
         if (!cust.moodIndicator || (cust.state !== C_STATE.WAITING_APPETIZER && cust.state !== C_STATE.WAITING_MAIN && cust.state !== C_STATE.WAITING_SIDE)) {
                if(cust.state !== C_STATE.SERVED_FINAL && cust.state !== C_STATE.LEAVING) {
                     if(cust.moodIndicator) cust.moodIndicator.textContent = '';
                }
                return;
            }
        const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal;
        let newMoodEmoji = moodEmojis.happy;
        if (patienceRatio <= 0.2) newMoodEmoji = moodEmojis.angry;
        else if (patienceRatio <= 0.5) newMoodEmoji = moodEmojis.impatient;
        else if (patienceRatio <= 0.8) newMoodEmoji = moodEmojis.neutral;
        if (cust.moodIndicator.textContent !== newMoodEmoji) { cust.moodIndicator.textContent = newMoodEmoji; }
    }

    function clearCustomersAndIndicators() {
        customers.forEach(c => { if (c.element && c.element.parentNode) { c.element.remove(); } });
        customers = [];
        document.querySelectorAll('.money-indicator, .feedback-indicator').forEach(el => el.remove());
        diningArea.querySelectorAll('.table').forEach(t => {
            t.classList.remove('table-highlight', 'table-leaving-soon');
            const seat = t.querySelector('.seat'); if(seat) seat.innerHTML = '';
        });
    }

    function triggerRandomEvent() {
        if (!gameRunning || isPaused || !eventModal.classList.contains('hidden') || randomEvents.length === 0) { return; }
        let eventIndex;
        if (randomEvents.length > 1) { do { eventIndex = Math.floor(Math.random() * randomEvents.length); } while (eventIndex === lastEventIndex); }
        else { eventIndex = 0; }
        lastEventIndex = eventIndex; const event = randomEvents[eventIndex];
        console.log("Triggering random event:", event.title); pauseGame();
        eventTitle.textContent = event.title; eventDescription.textContent = event.description;
        eventOptionsContainer.innerHTML = '';
        event.options.forEach(opt => {
            const btn = document.createElement('button'); btn.textContent = opt.text;
            btn.dataset.effectMoney = opt.effect.money || '0'; btn.dataset.effectTime = opt.effect.time || '0';
            btn.dataset.feedback = opt.feedback || "Okay.";
            if (event.title === "Kitchen Emergency!" && opt.text.includes("Work Around It")) { btn.dataset.stateChange = 'ovenBroken'; }
            btn.addEventListener('click', handleEventChoice); eventOptionsContainer.appendChild(btn);
        });
        eventModal.classList.remove('hidden');
    }
    function handleEventChoice(e) {
        playSound(sfxClick); const btn = e.target;
        const moneyEffect = parseInt(btn.dataset.effectMoney || '0'); const timeEffect = parseInt(btn.dataset.effectTime || '0');
        const feedbackText = btn.dataset.feedback || "Okay."; const stateChange = btn.dataset.stateChange;
        money += moneyEffect; timeLeft += timeEffect; money = Math.max(0, money); timeLeft = Math.max(0, timeLeft);
        moneyDisplay.textContent = money; timerDisplay.textContent = timeLeft;
        showFeedbackIndicator(player, feedbackText, (moneyEffect < 0 || timeEffect < 0) ? "negative" : "info");
        if (stateChange === 'ovenBroken') { isOvenBroken = true; console.log("EVENT: Oven is now broken!"); disableOvenStations(true); }
        eventModal.classList.add('hidden');
        if (timeLeft > 0 && gameRunning) { resumeGame(); }
        else if (timeLeft <= 0) { console.log("Event caused time to run out."); endGame(); }
    }
    function disableOvenStations(disable) {
        console.log(`Setting oven stations disabled state: ${disable}`);
        foodStations.forEach(station => {
            const foodId = station.dataset.item;
            if (OVEN_ITEMS.includes(foodId)) {
                station.style.opacity = disable ? '0.5' : '1'; station.style.cursor = disable ? 'not-allowed' : 'pointer';
                if (disable) { station.title = "Oven is Broken!"; } else { station.title = ""; }
            }
        });
    }

    function initializeGameVisuals() {
        // console.log("initializeGameVisuals: Attempting to run..."); // DEBUG LOG
        if (restaurantArea.offsetWidth > 0) {
            // console.log("initializeGameVisuals: Restaurant area has dimensions."); // DEBUG LOG
            const playerHalfHeight = player.offsetHeight / 2 || 35;
            const playerHalfWidth = player.offsetWidth / 2 || 25;
            playerPosition.x = restaurantArea.offsetWidth / 2;
            playerPosition.y = restaurantArea.offsetHeight - playerHalfHeight - 10;
            updatePlayerPosition();
            player.style.opacity = '1'; // Make player visible
            player.style.display = 'flex'; // Ensure display is not none
            // console.log(`initializeGameVisuals: Player opacity set to ${player.style.opacity}, display set to ${player.style.display}`); // DEBUG LOG
            // console.log(`initializeGameVisuals: Player position calculated:`, playerPosition); // DEBUG LOG

            // Generate tables *after* confirming layout dimensions and positioning player
            const numTables = Math.min(8, 2 + level); // Get table count for current level
            generateTables(diningArea, numTables);

        } else {
            console.warn("initializeGameVisuals: Restaurant area dimensions 0, retrying..."); // DEBUG LOG
            setTimeout(initializeGameVisuals, 50); // Check again shortly
            return;
        }
        // Ensure modals start hidden
        gameOverScreen.classList.add('hidden');
        menuModal.classList.add('hidden');
        eventModal.classList.add('hidden');
        gameWonModal.classList.add('hidden');

        // Setup debug display visibility
        debugInfo.classList.toggle('hidden', !debugMode);
        debugFood.textContent = 'None';

        // Set background image (with error catching)
        try {
             restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`;
             restaurantArea.style.backgroundSize = 'cover';
             restaurantArea.style.backgroundPosition = 'center';
        } catch(e) { console.error("Error setting background in init:", e)}
        // console.log("initializeGameVisuals: Finished."); // DEBUG LOG
    }

    // --- Game Start Trigger ---
    initializeGameVisuals();
    setTimeout(() => { if (!gameRunning) { startGame(); } }, 150);

}); // End DOMContentLoaded
// <<< END OF COMPLETE full.js >>>
