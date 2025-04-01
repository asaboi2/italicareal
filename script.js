document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const player = document.getElementById('player');
    const carryingDisplay = document.getElementById('carrying');
    const moneyDisplay = document.getElementById('money');
    const timerDisplay = document.getElementById('timer');
    const levelDisplay = document.getElementById('level');
    const startBtn = document.getElementById('start-btn');
    const menuBtn = document.getElementById('menu-btn');
    const restartBtn = document.getElementById('restart-btn');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const restaurantArea = document.querySelector('.restaurant');
    const diningArea = restaurantArea.querySelector('.dining-area');
    const kitchenRow = document.querySelector('.kitchen-row');
    const foodStations = kitchenRow.querySelectorAll('.food-station');
    const tables = diningArea.querySelectorAll('.table');
    const menuModal = document.getElementById('menu-modal');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const tabBtns = menuModal.querySelectorAll('.tab-btn');
    const menuSectionsContainer = menuModal.querySelector('.menu-sections');
    const debugInfo = document.getElementById('debug-info');
    const debugFood = document.getElementById('debug-food');
    const eventModal = document.getElementById('event-modal');
    const eventTitle = document.getElementById('event-title');
    const eventDescription = document.getElementById('event-description');
    const eventOptionsContainer = document.getElementById('event-options');
    const deliveryStation = document.getElementById('delivery-station'); // New Pass Element
    const trashCan = document.getElementById('trash-can'); // New Trash Element
    const deliveryRadius = document.createElement('div'); // Player carrying radius
    deliveryRadius.className = 'delivery-radius';
    restaurantArea.appendChild(deliveryRadius);

    // --- Game State Variables ---
    let money = 0;
    let timeLeft = 180;
    let gameRunning = false;
    let isPaused = false;
    let carryingFood = null; // ID of food player is holding
    let carryingFoodEmoji = null;
    let customers = [];
    let timerInterval = null;
    let customerSpawnTimeout = null;
    let customerPatienceBase = 35;
    let level = 1;
    let playerPosition = { x: 0, y: 0 };
    let isMoving = false;
    let animationFrameId = null; // For player movement
    let debugMode = false;
    let levelThresholds = [0, 75, 180, 300, 450, 650, 900, 1200, 1600];
    const BACKGROUND_IMAGE_URL = 'assets/your-widescreen-backdrop.png'; // <<< CHANGE THIS PATH
    let currentPrep = { // Tracks the actively preparing item
        timeoutId: null,
        cancelAnimation: null,
        stationElement: null
    };
    let readyItemsOnPass = []; // Tracks { id: uniqueId, foodId: '...', element: DOMElement }

    // --- Game Configuration ---
    const foodItems = { /* ... (keep full foodItems object as before) ... */
        'Bread Basket': { emoji: '🍞', price: 5, category: 'Appetizers', prepTime: 1 },'Cherry Tomato & Garlic Confit': { emoji: '🍅', price: 12, category: 'Appetizers', prepTime: 2 },'Whipped Ricotta': { emoji: '🧀', price: 14, category: 'Appetizers', prepTime: 2 },'Marinated Olives': { emoji: '🫒', price: 6, category: 'Appetizers', prepTime: 1 },'Crispy Gnudi': { emoji: '🍝', price: 12, category: 'Appetizers', prepTime: 3.5 },'House Salad': { emoji: '🥗', price: 12, category: 'Salads', prepTime: 2.5 },'Spicy Caesar Salad': { emoji: '🥗', price: 14, category: 'Salads', prepTime: 3 },'Cacio e Pepe': { emoji: '🍝', price: 20, category: 'Pasta', prepTime: 4 },'Seeing Red Pesto': { emoji: '🌶️', price: 24, category: 'Pasta', prepTime: 4 },'Short Rib Agnolotti': { emoji: '🥟', price: 32, category: 'Pasta', prepTime: 5 },'Pomodoro': { emoji: '🍝', price: 26, category: 'Pasta', prepTime: 3.5 },'Tomato Pie Slice': { emoji: '🍕', price: 5, category: 'Pizza', prepTime: 3 },'Tre Sale Slice': { emoji: '🍕', price: 6, category: 'Pizza', prepTime: 3.5 },'Garlic Girl': { emoji: '🍕', price: 25, category: 'Pizza', prepTime: 4.5 },'Toni Roni': { emoji: '🍕', price: 26, category: 'Pizza', prepTime: 5 },'Chicken Cutlets': { emoji: '🍗', price: 28, category: 'Mains', prepTime: 5 },'Roasted Half-Chicken': { emoji: '🐔', price: 34, category: 'Mains', prepTime: 7 },'Grilled Salmon': { emoji: '🐟', price: 36, category: 'Mains', prepTime: 4.5 },'Hanger Steak': { emoji: '🥩', price: 38, category: 'Mains', prepTime: 6 },'Mushroom Risotto': { emoji: '🍄', price: 12, category: 'Sides', prepTime: 5 },'Crispy Polenta': { emoji: '🌽', price: 10, category: 'Sides', prepTime: 4 },'Mashed Potatoes': { emoji: '🥔', price: 10, category: 'Sides', prepTime: 3 },'Shoestring Fries': { emoji: '🍟', price: 6, category: 'Sides', prepTime: 2.5 },'Grilled Asparagus': { emoji: '🍢', price: 8, category: 'Sides', prepTime: 3 },'Water': { emoji: '💧', price: 0, category: 'Drinks', prepTime: 0.5 },'Wine': { emoji: '🍷', price: 12, category: 'Drinks', prepTime: 0.5 },'Soda': { emoji: '🥤', price: 3, category: 'Drinks', prepTime: 0.5 }
    };
    const customerEmojis = ['👩','👨','👵','👴','👱‍♀️','👱','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','🧑‍🎄','👸','👨‍🎨','👩‍🔬','💂','🕵️'];
    const moodEmojis = { happy: '😊', neutral: '😐', impatient: '😠', angry: '😡' };
    const randomEvents = [ /* ... (keep full randomEvents array as before) ... */
        { title: "Customer Complaint!", description: "A customer says their Cacio e Pepe is too peppery!", options: [ { text: "Apologize & Offer free drink (-$3)", effect: { money: -3, time: 0 }, feedback: "Comped a soda." }, { text: "Remake the dish (Lose time)", effect: { money: 0, time: -10 }, feedback: "Remade the pasta (-10s)." }, { text: "Argue politely (Risk anger)", effect: { money: 0, time: 0 }, feedback: "Defended the chef!" } ] }, { title: "Kitchen Emergency!", description: "The oven suddenly stopped working!", options: [ { text: "Quick Fix Attempt (-$20, -15s)", effect: { money: -20, time: -15 }, feedback: "Paid for quick fix (-$20, -15s)." }, { text: "Work Around It (No Pizza/Roast)", effect: { money: 0, time: 0 }, feedback: "No oven dishes for now..." }, { text: "Ignore It (Riskier)", effect: { money: 0, time: 0 }, feedback: "Ignored the oven..." } ] }, { title: "Ingredient Shortage", description: "Oh no! We're running low on fresh basil for Pomodoro!", options: [ { text: "Buy Emergency Basil (-$15)", effect: { money: -15, time: 0 }, feedback: "Bought expensive basil (-$15)." }, { text: "Improvise (Use dried herbs)", effect: { money: 0, time: 0 }, feedback: "Substituted herbs..." }, { text: "Stop serving Pomodoro", effect: { money: 0, time: 0 }, feedback: "Took Pomodoro off menu." } ] }, { title: "VIP Guest", description: "A famous food critic just sat down at Table 3!", options: [ { text: "Offer Free Appetizer (-$10)", effect: { money: -10, time: 0 }, feedback: "Comped critic appetizer (-$10)." }, { text: "Chef's Special Attention (-10s)", effect: { money: 0, time: -10 }, feedback: "Chef gave extra attention (-10s)." }, { text: "Treat Like Normal", effect: { money: 0, time: 0 }, feedback: "Treated critic normally." } ] }
    ];

    // --- Helper Functions ---

    function animatePrepProgress(progressBarElement, durationMs, onComplete) {
        let startTime = null; let animationFrameId = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(1, elapsed / durationMs);
            if (progressBarElement) { progressBarElement.style.transform = `scaleX(${progress})`; }
            else { cancelAnimationFrame(animationFrameId); return; }
            if (progress < 1) { animationFrameId = requestAnimationFrame(step); }
            else { if (onComplete) onComplete(); }
        }
        if (progressBarElement) {
             progressBarElement.style.transform = 'scaleX(0)';
             progressBarElement.style.backgroundColor = '#ffcc00'; // Prep color
             animationFrameId = requestAnimationFrame(step);
        } else { return () => {}; }
        return () => {
            cancelAnimationFrame(animationFrameId);
            if (progressBarElement) {
                progressBarElement.style.transform = 'scaleX(0)';
                progressBarElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Reset color
            }
        };
    }

    function clearActivePreparation() {
        if (currentPrep.timeoutId) { clearTimeout(currentPrep.timeoutId); }
        if (currentPrep.cancelAnimation) { currentPrep.cancelAnimation(); }
        if (currentPrep.stationElement) {
            currentPrep.stationElement.classList.remove('preparing');
            currentPrep.stationElement.style.pointerEvents = 'auto';
            const oldProgressBar = currentPrep.stationElement.querySelector('.prep-progress-bar');
            if (oldProgressBar) {
                 oldProgressBar.style.transform = 'scaleX(0)';
                 oldProgressBar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }
        }
        currentPrep = { timeoutId: null, cancelAnimation: null, stationElement: null };
    }

    function addFoodToPass(foodId) {
        const foodData = foodItems[foodId];
        if (!foodData) return;

        const uniqueId = `passItem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const itemElement = document.createElement('div');
        itemElement.className = 'ready-food-item';
        itemElement.textContent = foodData.emoji;
        itemElement.dataset.foodId = foodId; // Store food ID
        itemElement.dataset.passId = uniqueId; // Store unique ID

        deliveryStation.appendChild(itemElement);
        readyItemsOnPass.push({ id: uniqueId, foodId: foodId, element: itemElement });

        showFeedbackIndicator(deliveryStation, `Order Up: ${foodData.emoji}!`, "positive", 2000);
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', () => { gameOverScreen.classList.add('hidden'); startGame(); });
    menuBtn.addEventListener('click', () => { pauseGame(); populateMenuModal(); menuModal.classList.remove('hidden'); /* ... (activate first tab logic) ... */ });
    closeMenuBtn.addEventListener('click', () => { menuModal.classList.add('hidden'); resumeGame(); });
    tabBtns.forEach(btn => { btn.addEventListener('click', () => { /* ... (tab switching logic) ... */ }); });
    let keysPressed = []; document.addEventListener('keydown', (e) => { /* ... (debug mode logic) ... */ });

    // --- Kitchen Food Station Click ---
    foodStations.forEach(station => {
        const progressBar = station.querySelector('.prep-progress-bar');
        if (!progressBar) { console.error("Progress bar missing", station); return; }

        station.addEventListener('click', () => {
            if (!gameRunning || isPaused || isMoving || station.classList.contains('preparing')) { return; }
            if (carryingFood) { showFeedbackIndicator(player, "Hands full!", "negative"); return; } // Check hands first

            const foodId = station.getAttribute('data-item');
            if (!foodId || !foodItems[foodId]) { console.error("Invalid station", station); return; }
            const foodData = foodItems[foodId];
            const prepTime = foodData.prepTime * 1000;

            // Start preparation (only if idle and hands empty)
            clearActivePreparation(); // Clear previous prep attempt

            movePlayerToElement(station, () => {
                if (carryingFood || isMoving) { // Re-check state after move
                    if (carryingFood) showFeedbackIndicator(player, "Hands full!", "negative");
                    return;
                }

                station.classList.add('preparing');
                station.style.pointerEvents = 'none';
                currentPrep.stationElement = station;

                currentPrep.cancelAnimation = animatePrepProgress(progressBar, prepTime, () => {}); // Start visual animation

                currentPrep.timeoutId = setTimeout(() => { // Start logic timer
                    if (currentPrep.stationElement !== station) { return; } // Check if stale

                    // Prep Complete: Add to Pass, Reset Station
                    addFoodToPass(foodId); // Add item to delivery station

                    station.classList.remove('preparing');
                    station.style.pointerEvents = 'auto';
                    if (progressBar) { progressBar.style.transform = 'scaleX(0)'; progressBar.style.backgroundColor = 'rgba(0,0,0, 0.2)'; } // Reset bar

                    currentPrep = { timeoutId: null, cancelAnimation: null, stationElement: null }; // Clear active prep

                }, prepTime); // End setTimeout
            }); // End movePlayerToElement callback
        }); // End addEventListener
    }); // End foodStations.forEach

    // --- Delivery Station (Pass) Click --- (Event Delegation)
    deliveryStation.addEventListener('click', (e) => {
        if (!gameRunning || isPaused || isMoving) return;

        const clickedItemElement = e.target.closest('.ready-food-item'); // Find the clicked item
        if (!clickedItemElement) return; // Clicked on pass background, not an item

        if (carryingFood) {
            showFeedbackIndicator(player, "Hands full!", "negative");
            return;
        }
         // --- If preparing, CANCEL the prep before picking up ---
         if (currentPrep.stationElement) {
             console.log("Clicked pass, cancelling active preparation.");
             clearActivePreparation();
         }
         // --- End Cancel ---

        const passId = clickedItemElement.dataset.passId;
        const itemIndex = readyItemsOnPass.findIndex(item => item.id === passId);

        if (itemIndex === -1) {
            console.error("Clicked item not found in readyItemsOnPass state", passId);
            clickedItemElement.remove(); // Remove inconsistent visual element
            return;
        }

        const itemToPickup = readyItemsOnPass[itemIndex];
        const foodData = foodItems[itemToPickup.foodId];

        // Move player to the pass to pick up
        movePlayerToElement(deliveryStation, () => { // Target the whole station is fine
            // Re-verify state after movement
            if (carryingFood) { showFeedbackIndicator(player, "Hands full!", "negative"); return; }

            // Find the specific item again in case state changed during move
            const currentItemIndex = readyItemsOnPass.findIndex(item => item.id === passId);
            if (currentItemIndex === -1) {
                console.log("Item was already picked up or removed.");
                return; // Item is gone
            }
            const currentItem = readyItemsOnPass[currentItemIndex];

            // Pick up the food
            carryingFood = currentItem.foodId;
            carryingFoodEmoji = foodItems[currentItem.foodId].emoji;
            carryingDisplay.textContent = carryingFoodEmoji;
            deliveryRadius.classList.add('active');
            if (debugMode) debugFood.textContent = carryingFood;

            // Remove from state and UI
            readyItemsOnPass.splice(currentItemIndex, 1); // Remove from array
            currentItem.element.remove(); // Remove visual element

            showFeedbackIndicator(player, `Picked up ${carryingFoodEmoji}!`, "info", 1200);
        });
    });

    // --- Trash Can Click ---
    trashCan.addEventListener('click', () => {
        if (!gameRunning || isPaused || isMoving) return;

        if (!carryingFood) {
            showFeedbackIndicator(trashCan, "Hands empty!", "info", 1200);
            return;
        }
         // --- If preparing, CANCEL the prep ---
         if (currentPrep.stationElement) {
             console.log("Clicked trash, cancelling active preparation.");
             clearActivePreparation();
         }
         // --- End Cancel ---

        // Move player to trash can
        movePlayerToElement(trashCan, () => {
            // After movement, trash item if still holding it
            if (carryingFood) {
                const trashedEmoji = carryingFoodEmoji; // Store for feedback
                carryingFood = null;
                carryingFoodEmoji = null;
                carryingDisplay.textContent = '';
                deliveryRadius.classList.remove('active');
                if (debugMode) debugFood.textContent = 'None';
                showFeedbackIndicator(trashCan, `Trashed ${trashedEmoji}!`, "negative", 1500);
            }
        });
    });

    // --- Dining Area Click --- (Cancel Prep Added)
    diningArea.addEventListener('click', (e) => { /* ... (Keep version with cancel prep logic) ... */
        if (!gameRunning || isPaused || isMoving) return;
        if (e.target.closest('.customer') || e.target.closest('.table') || e.target.closest('.player') || e.target.closest('.delivery-station') || e.target.closest('.trash-can')) return; // Ignore clicks on interactive elements
        if (currentPrep.stationElement) { clearActivePreparation(); }
        const rect = diningArea.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const targetY = e.clientY - rect.top;
        movePlayerToCoordinates(targetX, targetY);
    });

    // --- Table Click --- (Cancel Prep Added)
    tables.forEach(table => {
        table.addEventListener('click', (e) => { /* ... (Keep version with cancel prep logic) ... */
            if (!gameRunning || isPaused || isMoving) return;
            if (e.target.classList.contains('money-indicator') || e.target.classList.contains('feedback-indicator')) return;
             if (currentPrep.stationElement) { clearActivePreparation(); }
            const customerObj = customers.find(c => c.tableElement === table && c.state === 'waiting');
            movePlayerToElement(table, () => {
                if (customerObj) {
                    if (carryingFood) { if (carryingFood === customerObj.order) { serveCustomer(customerObj); } else { showFeedbackIndicator(table, "Wrong Order!", "negative"); if (debugMode) console.log(`Wrong! Have: ${carryingFood}, Want: ${customerObj.order}`); customerObj.patienceCurrent = Math.max(0, customerObj.patienceCurrent - 5); updateCustomerMood(customerObj); } }
                } else if (carryingFood) { showFeedbackIndicator(table, "No one waiting!", "negative"); }
            });
        });
    });


    // --- Core Functions ---

    function startGame() {
        console.log("--- startGame: Function called ---");
        money = 0; level = 1; timeLeft = 180; gameRunning = true; isPaused = false;
        carryingFood = null; carryingFoodEmoji = null; customers = []; isMoving = false;
        clearActivePreparation(); // Clear active prep
        readyItemsOnPass = []; // Clear pass state
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>'; // Clear pass UI

        console.log("--- startGame: State reset ---");
        moneyDisplay.textContent = money; levelDisplay.textContent = level; timerDisplay.textContent = timeLeft;
        carryingDisplay.textContent = ''; deliveryRadius.classList.remove('active'); debugFood.textContent = 'None';
        startBtn.style.display = 'none'; gameOverScreen.classList.add('hidden'); menuModal.classList.add('hidden'); eventModal.classList.add('hidden');
        console.log("--- startGame: UI reset ---");

        clearCustomersAndIndicators();
         foodStations.forEach(s => { // Reset kitchen stations
            s.classList.remove('preparing'); s.style.pointerEvents = 'auto';
            const pb = s.querySelector('.prep-progress-bar'); if (pb) { pb.style.transform = 'scaleX(0)'; pb.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';}
         });

        stopPlayerMovement();
        console.log("--- startGame: Cleared dynamic elements & stations ---");
        console.log("--- startGame: Attempting to set background ---");
        try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; if (!BACKGROUND_IMAGE_URL || BACKGROUND_IMAGE_URL === 'assets/your-widescreen-backdrop.png') { console.warn("BG URL missing/default!"); } }
        catch (e) { console.error("--- startGame: ERROR setting background ---", e); }
        console.log("--- startGame: Background set (or attempted) ---");
        console.log("--- startGame: Initializing visuals ---");
        try { initializeGameVisuals(); } catch (e) { console.error("--- startGame: ERROR initializing visuals ---", e); }
        console.log("--- startGame: Visuals initialized (or attempted) ---");
        console.log("--- startGame: Starting timers ---");
        clearInterval(timerInterval); timerInterval = setInterval(gameTick, 1000);
        clearTimeout(customerSpawnTimeout); scheduleNextCustomer();
        console.log("--- startGame: Function finished ---");
    }

    function endGame() { // Added clearing pass items
        console.log("Ending game...");
        gameRunning = false; isPaused = true; clearInterval(timerInterval); clearTimeout(customerSpawnTimeout);
        stopPlayerMovement(); clearActivePreparation();
        readyItemsOnPass = []; // Clear pass state
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>'; // Clear pass UI

        finalScoreDisplay.textContent = money; gameOverScreen.classList.remove('hidden');
        startBtn.style.display = 'inline-block'; deliveryRadius.classList.remove('active');
        console.log("Game ended. Final Score:", money);
    }

    // --- Other Core Functions (pause, resume, tick, customers, move, updatePos, etc.) ---
    // Keep the latest versions of these functions from the previous complete script
    // No changes needed in them for Trash Can or Delivery Station logic itself.
    function pauseGame() { if (!gameRunning || isPaused) return; isPaused = true; clearInterval(timerInterval); stopPlayerMovement(); console.log("Game Paused"); }
    function resumeGame() { if (!gameRunning || !isPaused) return; isPaused = false; clearInterval(timerInterval); timerInterval = setInterval(gameTick, 1000); console.log("Game Resumed"); }
    function gameTick() { if (!gameRunning || isPaused) { clearInterval(timerInterval); return; } timeLeft--; timerDisplay.textContent = timeLeft; updateCustomers(); if (timeLeft <= 0) { endGame(); return; } if (Math.random() < 0.01) { triggerRandomEvent(); } }
    function updateCustomers() { if (isPaused) return; const now = Date.now(); customers.forEach((c) => { if (c.state === 'leaving' || c.state === 'served' || c.state === 'remove') return; const elapsed = (now - c.spawnTime) / 1000; c.patienceCurrent = Math.max(0, c.patienceTotal - elapsed); updateCustomerMood(c); if (c.patienceCurrent <= 0 && c.state === 'waiting') { customerLeavesAngry(c); } }); customers = customers.filter(c => c.state !== 'remove'); }
    function customerLeavesAngry(c) { if (c.state === 'leaving') return; c.state = 'leaving'; c.tableElement.classList.remove('table-highlight'); showFeedbackIndicator(c.tableElement, "Left Angry! 😡", "negative"); if (c.element) { c.element.style.transition = 'opacity 0.5s ease'; c.element.style.opacity = '0'; } setTimeout(() => { if (c.element && c.element.parentNode) c.element.remove(); c.state = 'remove'; }, 500); }
    function movePlayerToElement(targetEl, callback = null) { if (isPaused || !targetEl) return; const restRect = restaurantArea.getBoundingClientRect(); const plyH = player.offsetHeight / 2; const plyW = player.offsetWidth / 2; let tX, tY; if (targetEl.closest('.kitchen-row')) { const sI = targetEl.closest('.food-station') || targetEl; const tR = sI.getBoundingClientRect(); const sCX_v = tR.left + tR.width / 2; tX = sCX_v - restRect.left; tY = restaurantArea.offsetHeight - plyH - 5; const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5; tX = Math.max(minX, Math.min(maxX, tX)); } else if (targetEl.closest('.table') || targetEl.closest('.delivery-station') || targetEl.closest('.trash-can')) { const tE = targetEl.closest('.table') || targetEl.closest('.delivery-station') || targetEl.closest('.trash-can'); const tR = tE.getBoundingClientRect(); tX = tR.left - restRect.left + tR.width / 2; tY = tR.top - restRect.top + tR.height / 2; } else { return; } movePlayerToCoordinates(tX, tY, callback); }
    function movePlayerToCoordinates(tX, tY, callback = null) { if (isPaused || isMoving) { return; }; isMoving = true; const sX = playerPosition.x; const sY = playerPosition.y; const dist = Math.hypot(tX - sX, tY - sY); if (dist < 1) { isMoving = false; if (callback) callback(); return; } const speed = 400; const dur = (dist / speed) * 1000; let startT = null; function step(time) { if (isPaused) { cancelAnimationFrame(animationFrameId); animationFrameId = null; isMoving = false; return; } if (!isMoving) { cancelAnimationFrame(animationFrameId); animationFrameId = null; return; } if (!startT) startT = time; const elap = time - startT; const prog = Math.min(1, elap / dur); playerPosition.x = sX + (tX - sX) * prog; playerPosition.y = sY + (tY - sY) * prog; updatePlayerPosition(); if (prog < 1) { animationFrameId = requestAnimationFrame(step); } else { playerPosition.x = tX; playerPosition.y = tY; updatePlayerPosition(); isMoving = false; animationFrameId = null; if (callback) { try { callback(); } catch (e) { console.error("Move CB Error:", e); } } } } cancelAnimationFrame(animationFrameId); animationFrameId = requestAnimationFrame(step); }
    function stopPlayerMovement() { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } isMoving = false; }
    function updatePlayerPosition() { const plyW = player.offsetWidth / 2; const plyH = player.offsetHeight / 2; const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5; const minY = plyH + 5; const maxY = restaurantArea.offsetHeight - plyH - 5; playerPosition.x = Math.max(minX, Math.min(maxX, playerPosition.x)); playerPosition.y = Math.max(minY, Math.min(maxY, playerPosition.y)); player.style.transform = `translate(${playerPosition.x - plyW}px, ${playerPosition.y - plyH}px)`; deliveryRadius.style.left = `${playerPosition.x}px`; deliveryRadius.style.top = `${playerPosition.y}px`; }
    function scheduleNextCustomer() { if (!gameRunning || isPaused) return; clearTimeout(customerSpawnTimeout); const baseT = 6000, minT = 2500; const reduc = (level - 1) * 350; const delay = Math.max(minT, baseT - reduc); const randF = 0.8 + Math.random() * 0.4; customerSpawnTimeout = setTimeout(spawnCustomer, delay * randF); }
    function spawnCustomer() { if (!gameRunning || isPaused) return; const availT = Array.from(tables).filter(t => !customers.some(c => c.tableElement === t && c.state !== 'leaving' && c.state !== 'remove')); if (availT.length > 0) { const t = availT[Math.floor(Math.random() * availT.length)]; const s = t.querySelector('.seat'); if (!s) { scheduleNextCustomer(); return; } const custEl = document.createElement('div'); custEl.className = 'customer'; custEl.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)]; custEl.style.opacity = '0'; const foods = Object.keys(foodItems); const order = foods[Math.floor(Math.random() * foods.length)]; const fData = foodItems[order]; const bub = document.createElement('div'); bub.className = 'speech-bubble'; bub.innerHTML = `<div class="dish-name">${order}</div><div class="dish-price">$${fData.price}</div><div class="dish-emoji">${fData.emoji}</div>`; bub.style.opacity = '0'; const moodI = document.createElement('div'); moodI.className = 'mood-indicator'; moodI.textContent = moodEmojis.happy; custEl.appendChild(moodI); custEl.appendChild(bub); s.appendChild(custEl); requestAnimationFrame(() => { custEl.style.opacity = '1'; bub.style.opacity = '1'; }); const cId = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`; const pat = Math.max(15, customerPatienceBase - (level - 1) * 2); const nC = { id: cId, element: custEl, tableElement: t, order: order, orderPrice: fData.price, spawnTime: Date.now(), patienceTotal: pat, patienceCurrent: pat, moodIndicator: moodI, state: 'waiting' }; customers.push(nC); t.classList.add('table-highlight'); } scheduleNextCustomer(); }
    function serveCustomer(cust) { if (!cust || cust.state !== 'waiting') return; cust.state = 'served'; const t = cust.tableElement; const p = cust.orderPrice; const pR = Math.max(0, cust.patienceCurrent) / cust.patienceTotal; let tipM = 0.05; if (pR > 0.8) tipM = 0.20; else if (pR > 0.5) tipM = 0.15; else if (pR > 0.2) tipM = 0.10; const tipA = Math.ceil(p * tipM); const totE = p + tipA; money += totE; moneyDisplay.textContent = money; showFeedbackIndicator(t, `+ $${p}<br/>+ $${tipA} tip!`, "positive"); cust.moodIndicator.textContent = '😋'; const bub = cust.element.querySelector('.speech-bubble'); if (bub) bub.innerHTML = "Grazie! 👌"; t.classList.remove('table-highlight'); carryingFood = null; carryingFoodEmoji = null; carryingDisplay.textContent = ''; deliveryRadius.classList.remove('active'); if (debugMode) debugFood.textContent = "None"; checkLevelUp(); if (cust.element) { cust.element.style.transition = 'opacity 1s ease 0.5s'; cust.element.style.opacity = '0'; } setTimeout(() => { if (cust.element && cust.element.parentNode) cust.element.remove(); cust.state = 'remove'; }, 1500); }
    function updateCustomerMood(cust) { if (!cust.moodIndicator) return; const pR = Math.max(0, cust.patienceCurrent) / cust.patienceTotal; let m = moodEmojis.happy; if (pR <= 0.2) m = moodEmojis.angry; else if (pR <= 0.5) m = moodEmojis.impatient; else if (pR <= 0.8) m = moodEmojis.neutral; cust.moodIndicator.textContent = m; }
    function checkLevelUp() { const nextL = level; if (nextL >= levelThresholds.length) return; const needed = levelThresholds[nextL]; if (money >= needed) { level++; levelDisplay.textContent = level; timeLeft += 20; timerDisplay.textContent = timeLeft; showFeedbackIndicator(player, `Level Up! ${level} (+20s)`, "positive", 2500); console.log("Level Up! Reached level", level); } }
    function clearCustomersAndIndicators() { customers.forEach(c => { if (c.element && c.element.parentNode) c.element.remove(); }); customers = []; document.querySelectorAll('.money-indicator, .feedback-indicator').forEach(el => el.remove()); tables.forEach(t => t.classList.remove('table-highlight')); }
    function showFeedbackIndicator(tEl, txt, typ = "info", dur = 1800) { const ind = document.createElement('div'); ind.className = 'feedback-indicator'; if (typ === "negative") ind.classList.add('negative'); else if (typ === "positive") ind.classList.add('positive'); ind.innerHTML = txt; const cont = restaurantArea; cont.appendChild(ind); const tR = tEl.getBoundingClientRect(); const cR = cont.getBoundingClientRect(); ind.style.position = 'absolute'; ind.style.left = `${tR.left - cR.left + tR.width / 2}px`; ind.style.top = `${tR.top - cR.top + tR.height / 2 - 20}px`; ind.style.animation = `float-up-fade ${dur / 1000}s forwards ease-out`; setTimeout(() => { if (ind.parentNode) ind.remove(); }, dur); }
    function triggerRandomEvent() { if (!gameRunning || isPaused || !eventModal.classList.contains('hidden')) return; pauseGame(); const ev = randomEvents[Math.floor(Math.random() * randomEvents.length)]; eventTitle.textContent = ev.title; eventDescription.textContent = ev.description; eventOptionsContainer.innerHTML = ''; ev.options.forEach(opt => { const btn = document.createElement('button'); btn.textContent = opt.text; btn.dataset.effectMoney = opt.effect.money; btn.dataset.effectTime = opt.effect.time; btn.dataset.feedback = opt.feedback; btn.addEventListener('click', handleEventChoice); eventOptionsContainer.appendChild(btn); }); eventModal.classList.remove('hidden'); }
    function handleEventChoice(e) { const btn = e.target; const mE = parseInt(btn.dataset.effectMoney || '0'); const tE = parseInt(btn.dataset.effectTime || '0'); const fb = btn.dataset.feedback || "Okay."; money += mE; timeLeft += tE; money = Math.max(0, money); timeLeft = Math.max(0, timeLeft); moneyDisplay.textContent = money; timerDisplay.textContent = timeLeft; showFeedbackIndicator(player, fb, (mE < 0 || tE < 0) ? "negative" : "info"); eventModal.classList.add('hidden'); if (timeLeft > 0 && gameRunning) { resumeGame(); } else if (timeLeft <= 0) { endGame(); } }
    function populateMenuModal() { menuSectionsContainer.innerHTML = ''; const cats = {}; for (const iN in foodItems) { const i = foodItems[iN]; if (!cats[i.category]) cats[i.category] = []; cats[i.category].push({ name: iN, ...i }); } const tOrd = Array.from(tabBtns).map(b => b.getAttribute('data-tab')); tOrd.forEach(tK => { let catN = getCategoryNameFromTabKey(tK); let items = []; if (tK === 'mains') { items = [...(cats['Mains'] || []), ...(cats['Sides'] || [])]; if (!items.length) catN = null; } else { items = cats[catN]; } if (items && items.length > 0) { const sDiv = document.createElement('div'); sDiv.className = 'menu-section'; sDiv.setAttribute('data-section', tK); items.forEach(it => { const iDiv = document.createElement('div'); iDiv.className = 'menu-item'; iDiv.innerHTML = `<h5>${it.name} ${it.emoji} - $${it.price}</h5><p>Prep Time: ${it.prepTime}s</p>`; sDiv.appendChild(iDiv); }); menuSectionsContainer.appendChild(sDiv); } }); }
    function getCategoryNameFromTabKey(tK) { switch(tK) { case 'appetizers': return 'Appetizers'; case 'salads': return 'Salads'; case 'pasta': return 'Pasta'; case 'pizza': return 'Pizza'; case 'mains': return 'Mains'; case 'sides': return 'Sides'; case 'drinks': return 'Drinks'; default: return tK.charAt(0).toUpperCase() + tK.slice(1); } }
    function initializeGameVisuals() { if (restaurantArea.offsetWidth > 0) { const plyH = player.offsetHeight / 2 || 35; const plyW = player.offsetWidth / 2 || 25; playerPosition.x = restaurantArea.offsetWidth / 2; playerPosition.y = restaurantArea.offsetHeight - plyH - 10; updatePlayerPosition(); player.style.opacity = '1'; player.style.display = 'flex'; } else { setTimeout(initializeGameVisuals, 100); return; } gameOverScreen.classList.add('hidden'); menuModal.classList.add('hidden'); eventModal.classList.add('hidden'); debugInfo.classList.toggle('hidden', !debugMode); startBtn.style.display = 'inline-block'; try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; if (!BACKGROUND_IMAGE_URL || BACKGROUND_IMAGE_URL === 'assets/your-widescreen-backdrop.png') { console.warn("BG URL missing/default!"); } } catch(e) { console.error("Error setting BG in init:", e)} console.log("Initial visuals set."); }

    // Run initial visual setup
    initializeGameVisuals();

}); // End DOMContentLoaded
