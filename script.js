// <<< START OF COMPLETE full.js (Version: Initialization Robustness Attempt) >>>
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded"); // LOG

    // --- DOM Elements ---
    console.log("Getting DOM Elements..."); // LOG
    const player = document.getElementById('player');
    const restaurantArea = document.querySelector('.restaurant');
    const diningArea = restaurantArea?.querySelector('.dining-area');
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
    const foodStations = kitchenRow?.querySelectorAll('.food-station');
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

    // --- CRITICAL ELEMENT CHECKS ---
    let elementsMissing = false;
    if (!player) { console.error("CRITICAL ERROR: #player element not found!"); elementsMissing = true; }
    if (!restaurantArea) { console.error("CRITICAL ERROR: .restaurant element not found!"); elementsMissing = true; }
    if (!diningArea) { console.error("CRITICAL ERROR: .dining-area element not found!"); elementsMissing = true; }
    if (!carryingDisplay) console.warn("Warning: #carrying element not found.");
    if (!moneyDisplay) console.warn("Warning: #money element not found.");
    if (!timerDisplay) console.warn("Warning: #timer element not found.");
    // Add more checks for other essential elements if needed

    if (elementsMissing) {
        console.error("Stopping script due to missing critical elements.");
        return; // Prevent further execution
    }
    console.log("Essential DOM Elements Found."); // LOG

    const deliveryRadius = document.createElement('div');
    deliveryRadius.className = 'delivery-radius';
    restaurantArea.appendChild(deliveryRadius);

    // --- Audio Elements ---
    // ... (same)
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
    // ... (same)
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
    // ... (same)
    const CUSTOMER_SPAWN_BASE_TIME = 6500;
    const CUSTOMER_SPAWN_MIN_TIME = 2500;
    const CUSTOMER_SPAWN_LEVEL_REDUCTION = 350;
    const CUSTOMER_SPAWN_RANDOM_FACTOR_MIN = 0.9;
    const CUSTOMER_SPAWN_RANDOM_FACTOR_MAX = 1.1;
    const RANDOM_EVENT_MIN_CUSTOMERS = 3;
    const APPETIZER_CHANCE = 0.7;
    const C_STATE = { /* ... same ... */ };
    const OVEN_ITEMS = [ /* ... same ... */ ];
    const foodItems = { /* ... same ... */ };
    const customerEmojis = [ /* ... same ... */ ];
    const moodEmojis = { /* ... same ... */ };
    const randomEvents = [ /* ... same ... */ ];


    // --- Helper Functions ---
    // ... (same - getItemsByCategory, getRandomFoodItem, playSound, playLoopingSound, stopLoopingSound, getFoodIcon, createIconElement, animatePrepProgress, addFoodToPass, showFeedbackIndicator) ...
    const getItemsByCategory = (function() { /* ... */ })();
    function getRandomFoodItem(category) { /* ... */ }
    function playSound(audioElement, volume = 0.5) { /* ... */ }
    function playLoopingSound(audioElement, volume = 0.3) { /* ... */ }
    function stopLoopingSound(audioElement) { /* ... */ }
    function getFoodIcon(foodId) { /* ... */ }
    function createIconElement(iconSrcOrEmoji, altText = 'Food item') { /* ... */ }
    function animatePrepProgress(progressBarElement, durationMs, onComplete) { /* ... */ }
    function addFoodToPass(foodId) { /* ... */ }
    function showFeedbackIndicator(targetElement, text, type = "info", duration = 1800) { /* ... */ }

    // --- Table Generation ---
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
            console.warn("generateTables: Container dimensions invalid (<=0). Using parent/window fallback.");
             containerWidth = container.parentElement?.offsetWidth || window.innerWidth * 0.8 || 600;
             containerHeight = container.parentElement?.offsetHeight || window.innerHeight * 0.6 || 400;
            //  console.log(`generateTables: Using fallback dimensions W:${containerWidth}, H:${containerHeight}`); // LOG
        }
        const gridPaddingTopFraction = 0.50;
        const gridPaddingBottomFraction = 0.15;
        const gridPaddingHorizontalFraction = 0.15;
        const usableHeight = containerHeight * (1 - gridPaddingTopFraction - gridPaddingBottomFraction);
        const usableWidth = containerWidth * (1 - gridPaddingHorizontalFraction * 2);
        const cellHeight = numRows > 0 ? Math.max(1, usableHeight / numRows) : usableHeight; // Ensure > 0
        const cellWidth = numCols > 0 ? Math.max(1, usableWidth / numCols) : usableWidth; // Ensure > 0
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
            table.style.position = 'absolute'; // Crucial
            table.style.top = `${cellCenterY}px`;
            table.style.left = `${cellCenterX}px`;
            table.style.transform = 'translate(-50%, -50%)';
            // Force visibility just in case CSS fails
            table.style.display = 'flex'; // Use flex if seat needs it, otherwise 'block'
            table.style.opacity = '1';
            table.style.visibility = 'visible';
            container.appendChild(table);
        }
        console.log(`generateTables: Finished appending ${container.children.length} tables.`); // LOG
    }


    // --- Event Listeners ---
    // ... (same as previous version - diningArea click, station clicks etc.) ...
    let keysPressed = {};
    document.addEventListener('keydown', (e) => { /* ... */ });
    document.addEventListener('keyup', (e) => { /* ... */ });
    if (closeMenuBtn) { closeMenuBtn.addEventListener('click', () => { /* ... */ }); }
    foodStations?.forEach(station => { station.addEventListener('click', () => { /* ... */ }); });
    deliveryStation?.addEventListener('click', (e) => { /* ... */ });
    trashCan?.addEventListener('click', () => { /* ... */ });
    diningArea.addEventListener('click', (e) => { /* ... */ });
    nextLevelBtn?.addEventListener('click', () => { /* ... */ });
    retryLevelBtn?.addEventListener('click', () => { /* ... */ });
    playAgainBtn?.addEventListener('click', () => { /* ... */ });

    // --- Core Functions ---
    function startGame() {
        console.log("startGame: Called"); // LOG
        if (gameRunning && !isPaused) return;
        money = 0; timeLeft = 120; gameRunning = true; isPaused = false;
        carryingFood = null; carryingFoodIcon = null; customers = [];
        readyItemsOnPass = []; lastEventIndex = -1; isOvenBroken = false;
        disableOvenStations(false); backgroundSoundsStarted = false;
        customersSpawnedThisLevel = 0;
        console.log("--- startGame: State reset ---"); // LOG
        moneyDisplay.textContent = money; levelDisplay.textContent = level;
        timerDisplay.textContent = timeLeft; carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active');
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>';
        debugFood.textContent = 'None';
        gameOverScreen?.classList.add('hidden');
        menuModal?.classList.add('hidden');
        eventModal?.classList.add('hidden');
        gameWonModal?.classList.add('hidden');
        console.log("--- startGame: UI reset ---"); // LOG
        clearCustomersAndIndicators(); // Clears tables from previous round
        foodStations?.forEach(s => {
            s.classList.remove('preparing'); s.style.pointerEvents = 'auto';
            const pb = s.querySelector('.prep-progress-bar');
            if (pb) { pb.style.transform = 'scaleX(0)'; pb.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; delete pb._animation; }
        });
        stopPlayerMovement();
        console.log("--- startGame: Cleared dynamic elements & stations."); // LOG
        try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; }
        catch (e) { console.error("--- startGame: ERROR setting background ---", e); }

        // Re-initialize visuals AND generate tables for the *new* level state
        initializeGameVisuals(); // Ensures player is positioned, tables are generated based on current level etc.

        console.log("--- startGame: Starting timers ---"); // LOG
        clearInterval(timerInterval); // Clear any old interval
        timerInterval = setInterval(gameTick, 1000); // <<< Start timer here
        console.log(`--- startGame: setInterval called with ID: ${timerInterval}`); // LOG Interval ID

        if (!gameRunning || isPaused) { console.error(`[startGame L${level}] CRITICAL: Game state prevents scheduling!`); return; }
        clearTimeout(customerSpawnTimeout);
        scheduleNextCustomer();
        console.log(`--- startGame: Level ${level} Started ---`); // LOG
    }

    function endGame() { /* ... same ... */ }
    function pauseGame() { /* ... same ... */ }
    function resumeGame() { /* ... same ... */ }
    function gameTick() { /* ... same logging/try-catch version ... */ }
    function updateCustomers() { /* ... same logging/try-catch version ... */ }
    function customerLeavesAngry(c) { /* ... same ... */ }
    function movePlayerToElement(targetEl, callback = null) { /* ... same ... */ }
    function movePlayerToCoordinates(targetX, targetY, callback = null) { /* ... same ... */ }
    function stopPlayerMovement() { /* ... same ... */ }
    function updatePlayerPosition() { /* ... same logging version ... */ }
    function scheduleNextCustomer() { /* ... same ... */ }
    function spawnCustomer() { /* ... same logical order multi-course version ... */ }
    function serveCustomer(cust, servedFoodId) { /* ... same logical order multi-course version ... */ }
    function updateCustomerMood(cust) { /* ... same logical order multi-course version ... */ }
    function clearCustomersAndIndicators() {
        console.log("clearCustomersAndIndicators: Clearing customers and indicators..."); // LOG
        customers.forEach(c => { if (c.element && c.element.parentNode) { c.element.remove(); } });
        customers = [];
        document.querySelectorAll('.money-indicator, .feedback-indicator').forEach(el => el.remove());
        diningArea.querySelectorAll('.table').forEach(t => { // Clear actual tables
             console.log("clearCustomersAndIndicators: Removing table element:", t.id); // LOG
             t.remove(); // Remove the table elements themselves
            // t.classList.remove('table-highlight', 'table-leaving-soon');
            // const seat = t.querySelector('.seat'); if(seat) seat.innerHTML = '';
        });
         console.log("clearCustomersAndIndicators: Finished clearing."); // LOG
    }
    function triggerRandomEvent() { /* ... same ... */ }
    function handleEventChoice(e) { /* ... same ... */ }
    function disableOvenStations(disable) { /* ... same ... */ }

    // --- Initialization ---
    function initializeGameVisuals() {
        console.log("initializeGameVisuals: Attempting to run..."); // LOG
        // Force position relative on restaurant area
        restaurantArea.style.position = 'relative';
        console.log(`initializeGameVisuals: restaurantArea position set to ${restaurantArea.style.position}`); // LOG

        let checkWidth = restaurantArea.offsetWidth;
        let checkHeight = restaurantArea.offsetHeight;
        console.log(`initializeGameVisuals: Restaurant dimensions W:${checkWidth}, H:${checkHeight}`); // LOG

        const playerHalfHeight = player.offsetHeight / 2 || 35;
        const playerHalfWidth = player.offsetWidth / 2 || 25;
        // Use current dimensions or fallbacks for initial placement
        playerPosition.x = (checkWidth > 0 ? checkWidth / 2 : 300);
        playerPosition.y = (checkHeight > 0 ? checkHeight : 500) - playerHalfHeight - 10;
        updatePlayerPosition(); // Apply position based on calculation

        console.log("initializeGameVisuals: Setting player visible..."); // LOG
        player.style.opacity = '1'; // FORCE visible
        player.style.display = 'flex'; // FORCE display
        player.style.visibility = 'visible'; // FORCE visibility
        player.style.position = 'absolute'; // FORCE position
        player.style.zIndex = '10'; // Ensure high z-index
        console.log(`initializeGameVisuals: Player styles set - opacity:${player.style.opacity}, display:${player.style.display}, visibility:${player.style.visibility}`); // LOG

        console.log("initializeGameVisuals: Calling generateTables..."); // LOG
        const numTables = Math.min(8, 2 + level);
        generateTables(diningArea, numTables); // Generate tables AFTER player setup
        console.log("initializeGameVisuals: Finished calling generateTables."); // LOG

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
        console.log("initializeGameVisuals: Finished."); // LOG
    }

    // --- Game Start Trigger ---
    console.log("Setting up initial visual setup and game start timeout..."); // LOG
    initializeGameVisuals(); // Set up initial visuals immediately

    // Use a slightly longer delay to ensure layout is stable before starting game logic
    setTimeout(() => {
        console.log("Game start timeout fired. Checking if game running..."); // LOG
        if (!gameRunning) {
             console.log("Game not running, calling startGame()..."); // LOG
             startGame();
        } else {
            console.log("Game already running, startGame() skipped."); // LOG
        }
     }, 250); // Increased delay to 250ms

    console.log("Script execution finished."); // LOG

}); // End DOMContentLoaded
// <<< END OF COMPLETE full.js >>>
