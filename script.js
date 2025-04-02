// <<< START OF COMPLETE full.js (Version: Multi-Course, 120s Timer, Grid Tables, Pause Fix, Event Delay, Initialization Fixes) >>>
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
    function playSound(audioElement, volume = 0.5) { /* ... same ... */ }
    function playLoopingSound(audioElement, volume = 0.3) { /* ... same ... */ }
    function stopLoopingSound(audioElement) { /* ... same ... */ }
    function getFoodIcon(foodId) { /* ... same ... */ }
    function createIconElement(iconSrcOrEmoji, altText = 'Food item') { /* ... same ... */ }
    function animatePrepProgress(progressBarElement, durationMs, onComplete) { /* ... same pause handling ... */ }
    function addFoodToPass(foodId) { /* ... same ... */ }
    function showFeedbackIndicator(targetElement, text, type = "info", duration = 1800) { /* ... same ... */ }

    // --- Table Generation (Grid Layout - with logging) ---
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
    // --- End generateTables function ---

    // --- Event Listeners ---
    let keysPressed = {};
    document.addEventListener('keydown', (e) => { /* ... same ... */ });
    document.addEventListener('keyup', (e) => { /* ... same ... */ });
    if (closeMenuBtn) { closeMenuBtn.addEventListener('click', () => { /* ... same ... */ }); }
    foodStations?.forEach(station => { // Added optional chaining
        station.addEventListener('click', () => { /* ... same ... */ });
    });
    deliveryStation?.addEventListener('click', (e) => { /* ... same ... */ }); // Added optional chaining
    trashCan?.addEventListener('click', () => { /* ... same ... */ }); // Added optional chaining
    diningArea.addEventListener('click', (e) => { /* ... same multi-course version ... */ });
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

    function endGame() { /* ... same ... */ }
    function pauseGame() { /* ... same ... */ }
    function resumeGame() { /* ... same (includes music logs) ... */ }
    function gameTick() { /* ... same ... */ }
    function updateCustomers() { /* ... same multi-course version ... */ }
    function customerLeavesAngry(c) { /* ... same ... */ }
    function movePlayerToElement(targetEl, callback = null) { /* ... same ... */ }
    function movePlayerToCoordinates(targetX, targetY, callback = null) { /* ... same ... */ }
    function stopPlayerMovement() { /* ... same ... */ }
    function updatePlayerPosition() { /* ... same ... */ }
    function scheduleNextCustomer() { /* ... same ... */ }
    function spawnCustomer() { /* ... same logical order multi-course version ... */ }
    function serveCustomer(cust, servedFoodId) { /* ... same logical order multi-course version ... */ }
    function updateCustomerMood(cust) { /* ... same logical order multi-course version ... */ }
    function clearCustomersAndIndicators() { /* ... same ... */ }
    function triggerRandomEvent() { /* ... same ... */ }
    function handleEventChoice(e) { /* ... same ... */ }
    function disableOvenStations(disable) { /* ... same ... */ }

    // --- Initialization ---
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

        gameOverScreen?.classList.add('hidden'); // Optional chaining
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
    initializeGameVisuals(); // Initialize visuals immediately
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
