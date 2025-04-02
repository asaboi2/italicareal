document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // ... (same as before) ...
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
    const sfxClick = document.getElementById('sfx-click'); // Keep reference if exists
    const sfxCook = document.getElementById('sfx-cook');   // Keep reference if exists
    const sfxReady = document.getElementById('sfx-ready'); // Keep reference if exists
    const sfxLevelWin = document.getElementById('sfx-level-win'); // Keep reference if exists
    const sfxLevelLose = document.getElementById('sfx-level-lose'); // Keep reference if exists

    // --- Game State Variables ---
    // ... (same as before) ...
    let money = 0;
    let timeLeft = 120;
    let gameRunning = false;
    let isPaused = false;
    let carryingFood = null;
    let carryingFoodIcon = null;
    let customers = [];
    let timerInterval = null;
    let customerSpawnTimeout = null;
    let customerPatienceBase = 35;
    let level = 1;
    const maxLevel = 5;
    let playerPosition = { x: 0, y: 0 };
    let isMoving = false;
    let animationFrameId = null;
    let debugMode = false;
    let levelThresholds = [0, 75, 180, 300, 450, 650];
    const BACKGROUND_IMAGE_URL = 'assets/backdrop.png';
    let readyItemsOnPass = [];
    let lastEventIndex = -1;
    let isOvenBroken = false;
    let hasUserInteracted = false; // <<< NEW: Flag for user interaction

    // --- Game Configuration ---
    // ... (OVEN_ITEMS and foodItems same as before) ...
    const OVEN_ITEMS = [ /* ... */ ];
    const foodItems = { /* ... */ };
    const customerEmojis = [ /* ... */ ];
    const moodEmojis = { /* ... */ };
    const randomEvents = [ /* ... */ ];


    // --- Helper Functions ---
    function playSound(audioElement, volume = 0.7) {
        // No interaction check needed for short SFX triggered by clicks
        if (!audioElement) return;
        audioElement.volume = volume;
        audioElement.currentTime = 0;
        audioElement.play().catch(error => {
            // console.log(`SFX play failed for ${audioElement.id}:`, error);
        });
    }

    // Modified playLoopingSound - Now uses interaction flag
    function playLoopingSound(audioElement, volume = 0.3) {
        if (!audioElement || !hasUserInteracted) return; // <<< Don't play until interaction
        audioElement.volume = volume;
        if (audioElement.paused) {
             audioElement.play().catch(error => {
                 // console.log(`Looping audio play failed for ${audioElement.id}:`, error);
             });
        }
    }

    // NEW function to attempt starting loops, called after interaction
    function startBackgroundLoops() {
        if (!hasUserInteracted) return; // Should be true if called here, but double-check
        console.log("Attempting to start background loops...");
        playLoopingSound(bgmAudio, 0.3);
        playLoopingSound(ambienceAudio, 0.4);
    }

    function stopLoopingSound(audioElement) {
         if (!audioElement) return;
         audioElement.pause();
         audioElement.currentTime = 0;
    }

    // ... (getFoodIcon, createIconElement, animatePrepProgress, addFoodToPass, generateTables same as before) ...
    function getFoodIcon(foodId) { /* ... */ }
    function createIconElement(iconSrcOrEmoji, altText = 'Food item') { /* ... */ }
    function animatePrepProgress(progressBarElement, durationMs, onComplete) { /* ... */ }
    function addFoodToPass(foodId) { /* ... (plays sfxReady) ... */ }
    function generateTables(container, numTables) { /* ... */ }

    // --- Event Listeners ---

    // NEW: Centralized function to handle first interaction
    function handleFirstInteraction() {
        if (!hasUserInteracted) {
            console.log("User interaction detected!");
            hasUserInteracted = true;
            // Try starting loops now that user has interacted
            startBackgroundLoops();
        }
    }

    // Add handleFirstInteraction to major click listeners
    let keysPressed = {};
    document.addEventListener('keydown', (e) => { /* ... (same) ... */ });
    document.addEventListener('keyup', (e) => { /* ... (same) ... */ });

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            handleFirstInteraction(); // <<< ADD INTERACTION CHECK
            playSound(sfxClick);
            menuModal.classList.add('hidden');
            resumeGame();
         });
    }

    foodStations.forEach(station => {
         station.addEventListener('click', () => {
             handleFirstInteraction(); // <<< ADD INTERACTION CHECK
             playSound(sfxClick);
             // ... (rest of food station logic remains the same) ...
             const foodId = station.dataset.item;
             const item = foodItems[foodId];
             if (!item) return;
             if (isOvenBroken && OVEN_ITEMS.includes(foodId)) { /* ... */ return; }
             if (isPaused || station.classList.contains('preparing')) return;
             if (carryingFood) { /* ... */ return; }
             // ... (prep logic plays sfxCook, addFoodToPass plays sfxReady) ...
        });
    });

    deliveryStation.addEventListener('click', (e) => {
        handleFirstInteraction(); // <<< ADD INTERACTION CHECK
        playSound(sfxClick);
        // ... (rest of delivery station logic remains the same) ...
        if (isPaused) return;
        const clickedItem = e.target.closest('.ready-food-item');
        if (carryingFood) { /* ... */ return; }
        if (clickedItem) {
            // ... (pickup logic plays sfxPickup) ...
             playSound(sfxPickup);
        }
    });

    trashCan.addEventListener('click', () => {
        handleFirstInteraction(); // <<< ADD INTERACTION CHECK
        if (isPaused || !carryingFood) return;
        playSound(sfxTrash);
        // ... (rest of trash logic remains the same) ...
    });

    diningArea.addEventListener('click', (e) => {
        handleFirstInteraction(); // <<< ADD INTERACTION CHECK
        playSound(sfxClick);
        // ... (rest of dining area logic remains the same) ...
         if (isPaused) return;
         const targetTable = e.target.closest('.table');
         // ... (move/serve logic) ...
    });

    // Modal Button Clicks
    nextLevelBtn.addEventListener('click', () => {
        handleFirstInteraction(); // <<< ADD INTERACTION CHECK
        playSound(sfxClick);
        gameOverScreen.classList.add('hidden');
        level++;
        startGame();
    });

    retryLevelBtn.addEventListener('click', () => {
        handleFirstInteraction(); // <<< ADD INTERACTION CHECK
        playSound(sfxClick);
        gameOverScreen.classList.add('hidden');
        startGame();
    });

    playAgainBtn.addEventListener('click', () => {
        handleFirstInteraction(); // <<< ADD INTERACTION CHECK
        playSound(sfxClick);
        gameWonModal.classList.add('hidden');
        level = 1;
        startGame();
    });

     // Event Modal Option Click
     function handleEventChoice(e) {
        handleFirstInteraction(); // <<< ADD INTERACTION CHECK
        playSound(sfxClick);
        // ... (rest of handleEventChoice logic remains the same) ...
        const btn = e.target;
        const mE = parseInt(btn.dataset.effectMoney || '0');
        const tE = parseInt(btn.dataset.effectTime || '0');
        const fb = btn.dataset.feedback || "Okay.";
        const stateChange = btn.dataset.stateChange;
        money += mE; timeLeft += tE; money = Math.max(0, money); timeLeft = Math.max(0, timeLeft);
        moneyDisplay.textContent = money; timerDisplay.textContent = timeLeft;
        showFeedbackIndicator(player, fb, (mE < 0 || tE < 0) ? "negative" : "info");
        if (stateChange === 'ovenBroken') { /* ... */ disableOvenStations(true); }
        eventModal.classList.add('hidden');
        if (timeLeft > 0 && gameRunning) { resumeGame(); } else { endGame(); }
    }


    // --- Core Functions ---

    function startGame() {
        // ... (reset state variables as before) ...
         gameRunning = true; isPaused = false;
         // ** Don't reset hasUserInteracted here **
         isOvenBroken = false; // Reset oven status
         disableOvenStations(false); // Re-enable stations visually

        console.log("--- startGame: State reset ---");
        // ... (UI resets as before) ...

        clearCustomersAndIndicators();
        generateTables(diningArea, numTables);
        // ... (reset food stations as before) ...

        stopPlayerMovement();
        // ... (set background, initialize visuals as before) ...

        console.log("--- startGame: Starting timers & Audio ---");

        // --- MODIFIED AUDIO START ---
        // Only try to play loops IF user has already interacted in a previous session/level
        if (hasUserInteracted) {
             startBackgroundLoops();
        } else {
            console.log("Background audio deferred until user interaction.");
        }
        // --- END MODIFIED AUDIO START ---

        clearInterval(timerInterval); timerInterval = setInterval(gameTick, 1000);
        // ... (customer scheduling logic as before) ...
        clearTimeout(customerSpawnTimeout);
        scheduleNextCustomer();
        console.log(`--- startGame: Level ${level} Started ---`);
    }

    function endGame() {
        // ... (stop timers, movement as before) ...
        stopLoopingSound(bgmAudio); // Stop loops properly
        stopLoopingSound(ambienceAudio);
        // ... (determine win/loss, show modals as before) ...
         if (levelWon) { playSound(sfxLevelWin); } else { playSound(sfxLevelLose); }
         // ...
    }

    function pauseGame() {
         if (!gameRunning || isPaused) return;
         isPaused = true;
         clearInterval(timerInterval);
         stopPlayerMovement();
         if(bgmAudio) bgmAudio.pause(); // Pause loops, don't rewind
         if(ambienceAudio) ambienceAudio.pause();
         console.log("Game Paused");
     }

     function resumeGame() {
         if (!gameRunning || !isPaused) return;
         isPaused = false;
         if (gameRunning && timeLeft > 0) {
            // Use playLoopingSound which respects interaction flag
            playLoopingSound(bgmAudio, 0.3);
            playLoopingSound(ambienceAudio, 0.4);
            clearInterval(timerInterval);
            timerInterval = setInterval(gameTick, 1000);
            console.log("Game Resumed");
         } else {
              console.log("Game NOT Resumed (already ended or time up)");
         }
     }

    // ... (gameTick, updateCustomers, customerLeavesAngry, movement functions, scheduleNextCustomer, spawnCustomer, serveCustomer, updateCustomerMood, clearCustomersAndIndicators, showFeedbackIndicator, triggerRandomEvent, disableOvenStations, initializeGameVisuals same as before) ...
     function gameTick() { /* ... */ }
     function updateCustomers() { /* ... (plays sfxImpatient) ... */ }
     function customerLeavesAngry(c) { /* ... (plays sfxAngryLeft) ... */ }
     function movePlayerToElement(targetEl, callback = null) { /* ... */ }
     function movePlayerToCoordinates(tX, tY, callback = null) { /* ... */ }
     function stopPlayerMovement() { /* ... */ }
     function updatePlayerPosition() { /* ... */ }
     function scheduleNextCustomer() { /* ... */ }
     function spawnCustomer() { /* ... (plays sfxOrdered) ... */ }
     function serveCustomer(cust) { /* ... (plays sfxServe) ... */ }
     function updateCustomerMood(cust) { /* ... (plays sfxImpatient) ... */ }
     function clearCustomersAndIndicators() { /* ... */ }
     function showFeedbackIndicator(tEl, txt, typ = "info", dur = 1800) { /* ... */ }
     function triggerRandomEvent() { /* ... */ }
     function disableOvenStations(disable) { /* ... */ }
     function initializeGameVisuals() { /* ... */ }


    // --- Start ---
    initializeGameVisuals();
    setTimeout(() => { if (!gameRunning) { startGame(); } }, 150);

}); // End DOMContentLoaded
