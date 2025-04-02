// <<< START OF DEBUGGING full.js >>>
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

    const OVEN_ITEMS = [ /* ... same ... */ ];
    const foodItems = { /* ... same ... */ };
    const customerEmojis = [ /* ... same ... */ ];
    const moodEmojis = { /* ... same ... */ };
    const randomEvents = [ /* ... same ... */ ];

    // --- Helper Functions ---
    const getItemsByCategory = (function() { /* ... same ... */ })();
    function getRandomFoodItem(category) { /* ... same ... */ }
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
        console.log(`generateTables: Called for ${numTables} tables.`); // LOG
        if (!container) {
            console.error("generateTables: ERROR - container element is null!");
            return;
        }
        container.innerHTML = '';
        const numCols = 3;
        const numRows = Math.ceil(numTables / numCols);
        let containerWidth = container.offsetWidth;
        let containerHeight = container.offsetHeight;
        console.log(`generateTables: Container initial dimensions W:${containerWidth}, H:${containerHeight}`); // LOG
        if (containerWidth <= 0 || containerHeight <= 0) { // Check for zero or less
            console.warn("generateTables: Container dimensions are invalid (<=0). Attempting fallback.");
             containerWidth = container.parentElement?.offsetWidth || window.innerWidth * 0.8 || 600; // Added a final default
             containerHeight = container.parentElement?.offsetHeight || window.innerHeight * 0.6 || 400; // Added a final default
             console.log(`generateTables: Using fallback dimensions W:${containerWidth}, H:${containerHeight}`); // LOG
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
        console.log(`generateTables: Usable Area W:${usableWidth.toFixed(1)}, H:${usableHeight.toFixed(1)} | Cell W:${cellWidth.toFixed(1)}, H:${cellHeight.toFixed(1)}`); // LOG
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
        console.log(`generateTables: Finished appending ${container.children.length} tables.`); // LOG
    }
    // --- End generateTables function ---

    // --- Event Listeners ---
    // ... (Key listeners, menu button, station clicks, delivery click, trash click - unchanged) ...
    // --- MODIFIED: Dining Area Click ---
    diningArea.addEventListener('click', (e) => {
        playSound(sfxClick);
        if (isPaused) return;
        const targetTable = e.target.closest('.table');
        if (targetTable) {
            const tableId = targetTable.id;
            const foodBeingCarried = carryingFood; // Capture food before move

            if (foodBeingCarried) {
                movePlayerToElement(targetTable, () => { // Callback runs on arrival
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
    // --- END MODIFIED: Dining Area Click ---
    // ... (Modal button clicks - unchanged) ...


    // --- Core Functions ---
    function startGame() {
        console.log("startGame: Called"); // LOG
        if (gameRunning && !isPaused) return;
        // console.log(`--- startGame: Starting Level ${level} ---`);
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
        gameOverScreen.classList.add('hidden'); menuModal.classList.add('hidden');
        eventModal.classList.add('hidden'); gameWonModal.classList.add('hidden');
        // console.log("--- startGame: UI reset ---");
        clearCustomersAndIndicators();
        foodStations?.forEach(s => { // Added optional chaining
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

    function endGame() { /* unchanged */ }
    function pauseGame() { /* unchanged */ }
    function resumeGame() { /* unchanged */ }
    function gameTick() { /* unchanged */ }
    function updateCustomers() { /* unchanged */ }
    function customerLeavesAngry(c) { /* unchanged */ }
    function movePlayerToElement(targetEl, callback = null) { /* unchanged */ }
    function movePlayerToCoordinates(targetX, targetY, callback = null) { /* unchanged */ }
    function stopPlayerMovement() { /* unchanged */ }
    function updatePlayerPosition() { /* unchanged */ }
    function scheduleNextCustomer() { /* unchanged */ }
    function spawnCustomer() { /* unchanged multi-course version */ }
    function serveCustomer(cust, servedFoodId) { /* unchanged multi-course version */ }
    function updateCustomerMood(cust) { /* unchanged multi-course version */ }
    function clearCustomersAndIndicators() { /* unchanged */ }
    function triggerRandomEvent() { /* unchanged */ }
    function handleEventChoice(e) { /* unchanged */ }
    function disableOvenStations(disable) { /* unchanged */ }

    // --- Initialization (NOW includes table generation call) ---
    function initializeGameVisuals() {
        console.log("initializeGameVisuals: Attempting to run..."); // LOG
        // Simple Check for dimensions - proceed even if 0, relying on generateTables fallback maybe
        let checkWidth = restaurantArea.offsetWidth;
        console.log(`initializeGameVisuals: Restaurant width check: ${checkWidth}`); // LOG

        // Position Player FIRST (even if dimensions are 0 initially, updatePlayerPosition clamps)
        const playerHalfHeight = player.offsetHeight / 2 || 35;
        const playerHalfWidth = player.offsetWidth / 2 || 25;
        playerPosition.x = (checkWidth > 0 ? checkWidth / 2 : 300); // Use fallback if needed
        playerPosition.y = (restaurantArea.offsetHeight > 0 ? restaurantArea.offsetHeight : 500) - playerHalfHeight - 10; // Use fallback height
        updatePlayerPosition(); // Apply position

        // Make player visible regardless
        console.log("initializeGameVisuals: Setting player visible..."); // LOG
        player.style.opacity = '1';
        player.style.display = 'flex';
        console.log(`initializeGameVisuals: Player opacity = ${player.style.opacity}`); // LOG

        // THEN Generate tables (it has its own dimension check/fallback now)
        console.log("initializeGameVisuals: Calling generateTables..."); // LOG
        const numTables = Math.min(8, 2 + level);
        generateTables(diningArea, numTables);
        console.log("initializeGameVisuals: Finished calling generateTables."); // LOG

        // Ensure modals start hidden
        gameOverScreen?.classList.add('hidden'); // Optional chaining
        menuModal?.classList.add('hidden');
        eventModal?.classList.add('hidden');
        gameWonModal?.classList.add('hidden');

        // Setup debug display visibility
        debugInfo?.classList.toggle('hidden', !debugMode);
        debugFood && (debugFood.textContent = 'None'); // Check if exists

        // Set background image
        try {
             restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`;
             restaurantArea.style.backgroundSize = 'cover';
             restaurantArea.style.backgroundPosition = 'center';
        } catch(e) { console.error("Error setting background in init:", e)}
        console.log("initializeGameVisuals: Finished."); // LOG
    }

    // --- Game Start Trigger ---
    console.log("Setting up game initialization timeout..."); // LOG
    initializeGameVisuals(); // Try initializing visuals immediately
    setTimeout(() => {
        console.log("Initial timeout fired. Checking if game running..."); // LOG
        if (!gameRunning) {
             console.log("Game not running, calling startGame()..."); // LOG
             startGame();
        } else {
            console.log("Game already running, startGame() skipped."); // LOG
        }
     }, 150);

    console.log("Script execution finished."); // LOG

}); // End DOMContentLoaded
// <<< END OF DEBUGGING full.js >>>
