// <<< START OF UPDATED full.js >>>
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
    let timeLeft = 120; // Default timer
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

    // --- MODIFIED: Customer States ---
    const C_STATE = {
        WAITING_DRINK: 'waiting_drink', // <<< NEW STATE
        WAITING_APPETIZER: 'waiting_appetizer',
        WAITING_MAIN: 'waiting_main',
        WAITING_SIDE: 'waiting_side',
        SERVED_FINAL: 'served_final', // All courses served
        LEAVING: 'leaving',       // Angry leave
        REMOVE: 'remove'          // To be filtered out
    };

    const OVEN_ITEMS = [ /* ... unchanged ... */ ];
    const foodItems = { // ENSURE 'Drinks' CATEGORY EXISTS AND HAS ITEMS
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
    const customerEmojis = [ /* unchanged */ ];
    const moodEmojis = { /* unchanged */ };
    const randomEvents = [ /* unchanged */ ];

    // --- Helper Functions ---
    const getItemsByCategory = (function() { /* unchanged */ })();
    function getRandomFoodItem(category) { /* unchanged */ }
    function playSound(audioElement, volume = 0.5) { /* unchanged */ }
    function playLoopingSound(audioElement, volume = 0.3) { /* unchanged */ }
    function stopLoopingSound(audioElement) { /* unchanged */ }
    function getFoodIcon(foodId) { /* unchanged */ }
    function createIconElement(iconSrcOrEmoji, altText = 'Food item') { /* unchanged */ }
    function animatePrepProgress(progressBarElement, durationMs, onComplete) { /* unchanged */ }
    function addFoodToPass(foodId) { /* unchanged */ }
    function generateTables(container, numTables) { /* unchanged grid layout version */ }
    function showFeedbackIndicator(targetElement, text, type = "info", duration = 1800) { /* unchanged */ }


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
                    // Find customer at this table waiting for THIS specific food
                    const customerToServe = customers.find(c =>
                        c.tableElement.id === tableId &&
                        (c.state === C_STATE.WAITING_DRINK || // <<< Added WAITING_DRINK
                         c.state === C_STATE.WAITING_APPETIZER ||
                         c.state === C_STATE.WAITING_MAIN ||
                         c.state === C_STATE.WAITING_SIDE) &&
                        c.currentOrder === foodBeingCarried
                    );

                    if (customerToServe) {
                        serveCustomer(customerToServe, foodBeingCarried);
                    } else {
                        // Arrived with food, but no one here wants *this* food *now*
                        const anyWaiting = customers.some(c =>
                            c.tableElement.id === tableId &&
                            (c.state === C_STATE.WAITING_DRINK || // <<< Added WAITING_DRINK
                             c.state === C_STATE.WAITING_APPETIZER ||
                             c.state === C_STATE.WAITING_MAIN ||
                             c.state === C_STATE.WAITING_SIDE)
                         );
                         if (anyWaiting) { showFeedbackIndicator(targetTable, "Wrong order!", "negative"); }
                         else { showFeedbackIndicator(targetTable, "No waiting customer!", "negative"); }
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
    // --- END MODIFIED: Dining Area Click ---

    // ... (Modal button clicks - unchanged) ...

    // --- Core Functions ---

    function startGame() { /* unchanged (already sets timer to 120) */ }
    function endGame() { /* unchanged */ }
    function pauseGame() { /* unchanged */ }
    function resumeGame() { /* unchanged */ }

    function gameTick() {
        if (!gameRunning || isPaused) { clearInterval(timerInterval); return; }
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        updateCustomers(); // Handles patience for current course

        if (timeLeft <= 0) { endGame(); return; }

        // Check for random event trigger (condition unchanged)
        if (customersSpawnedThisLevel >= RANDOM_EVENT_MIN_CUSTOMERS && Math.random() < 0.02 && eventModal.classList.contains('hidden')) {
            triggerRandomEvent();
        }
    }

    // --- MODIFIED: updateCustomers ---
    function updateCustomers() {
        if (isPaused) return;
        const now = Date.now();
        const LEAVING_SOON_THRESHOLD = 8;

        customers.forEach((c) => {
            // Only process customers who are waiting for something
            if (c.state !== C_STATE.WAITING_DRINK && // <<< Added WAITING_DRINK check
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

            updateCustomerMood(c); // Update visual mood

            const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
            if (!tableEl) { c.state = C_STATE.REMOVE; return; }

            if (c.patienceCurrent <= LEAVING_SOON_THRESHOLD && c.patienceCurrent > 0) {
                 tableEl.classList.add('table-leaving-soon');
            } else {
                 tableEl.classList.remove('table-leaving-soon');
            }

            if (c.patienceCurrent <= 0) { customerLeavesAngry(c); }
        });
        customers = customers.filter(c => c.state !== C_STATE.REMOVE);
    }
    // --- END MODIFIED: updateCustomers ---

    function customerLeavesAngry(c) { /* unchanged */ }
    function movePlayerToElement(targetEl, callback = null) { /* unchanged */ }
    function movePlayerToCoordinates(targetX, targetY, callback = null) { /* unchanged */ }
    function stopPlayerMovement() { /* unchanged */ }
    function updatePlayerPosition() { /* unchanged */ }
    function scheduleNextCustomer() { /* unchanged */ }

    // --- MODIFIED: spawnCustomer ---
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
                     playLoopingSound(bgmAudio, 0.3); playLoopingSound(ambienceAudio, 0.4);
                     backgroundSoundsStarted = true;
                 }
                playSound(sfxOrdered);
                const tableElement = potentialTables[Math.floor(Math.random() * potentialTables.length)];
                const seatElement = tableElement.querySelector('.seat');
                if (!seatElement) { scheduleNextCustomer(); return; }

                // --- Generate Meal Plan (Logical Order) ---
                const mealPlan = {
                    drink: getRandomFoodItem('Drinks'),         // Always get drink
                    appetizer: null,                           // Appetizer is optional
                    main: getRandomFoodItem('Mains'),          // Always get main
                    side: getRandomFoodItem('Sides')           // Always get side
                };

                // Decide if appetizer is wanted
                if (Math.random() < APPETIZER_CHANCE) {
                    mealPlan.appetizer = getRandomFoodItem('Appetizers'); // Try to get app
                    if (!mealPlan.appetizer) {
                        console.warn("Customer wanted appetizer but none found in category 'Appetizers'. Proceeding without.");
                    }
                }

                // Validate essential courses
                if (!mealPlan.drink || !mealPlan.main || !mealPlan.side) {
                    console.warn("Could not generate full meal plan (missing drink, main, or side). Skipping customer.", mealPlan);
                    scheduleNextCustomer();
                    return;
                }
                // --- End Meal Plan ---

                // --- Initial Order/State is ALWAYS Drink ---
                const currentOrder = mealPlan.drink;
                const initialState = C_STATE.WAITING_DRINK;
                // --- End Initial ---

                const custEl = document.createElement('div'); custEl.className = 'customer';
                custEl.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)]; custEl.style.opacity = '0';
                const foodData = foodItems[currentOrder]; // Data for the first item (drink)
                const orderIcon = getFoodIcon(currentOrder);
                const bubble = document.createElement('div'); bubble.className = 'speech-bubble';
                bubble.innerHTML = `<div class="dish-name">${currentOrder}</div><div class="dish-price">$${foodData.price}</div><div class="dish-emoji"></div>`;
                const dishEmojiContainer = bubble.querySelector('.dish-emoji'); dishEmojiContainer.appendChild(createIconElement(orderIcon, currentOrder));
                bubble.style.opacity = '0';
                const moodIndicator = document.createElement('div'); moodIndicator.className = 'mood-indicator'; moodIndicator.textContent = moodEmojis.happy;
                custEl.appendChild(moodIndicator); custEl.appendChild(bubble);
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
                customers.push(newCustomer);
                customersSpawnedThisLevel++;
                tableElement.classList.add('table-highlight');

            } else { /* No available tables */ }
        } catch (error) { console.error("Error during spawnCustomer:", error); }
        scheduleNextCustomer();
    }
    // --- END MODIFIED: spawnCustomer ---

    // --- MODIFIED: serveCustomer ---
    function serveCustomer(cust, servedFoodId) {
        // Check if the served food is what the customer is currently waiting for
        if (!cust || cust.currentOrder !== servedFoodId ||
            (cust.state !== C_STATE.WAITING_DRINK && // <<< Check ALL waiting states
             cust.state !== C_STATE.WAITING_APPETIZER &&
             cust.state !== C_STATE.WAITING_MAIN &&
             cust.state !== C_STATE.WAITING_SIDE) )
        {
             console.warn("serveCustomer called with mismatched food/customer state:", cust?.id, servedFoodId, cust?.currentOrder, cust?.state);
             return; // Do nothing if the order doesn't match or state is wrong
        }

        playSound(sfxServe);

        const servedItemData = foodItems[servedFoodId];
        if (servedItemData) { cust.orderPrice += servedItemData.price; }
        else { console.warn("Data not found for served item:", servedFoodId); }

        // --- Determine Next Course (Logical Order) ---
        let nextOrder = null;
        let nextState = null;

        if (cust.state === C_STATE.WAITING_DRINK) {
            if (cust.mealPlan.appetizer) { // Check if they ordered an appetizer
                nextOrder = cust.mealPlan.appetizer;
                nextState = C_STATE.WAITING_APPETIZER;
            } else { // No appetizer, go straight to main
                nextOrder = cust.mealPlan.main;
                nextState = C_STATE.WAITING_MAIN;
            }
        } else if (cust.state === C_STATE.WAITING_APPETIZER) {
            nextOrder = cust.mealPlan.main; // After appetizer comes main
            nextState = C_STATE.WAITING_MAIN;
        } else if (cust.state === C_STATE.WAITING_MAIN) {
            nextOrder = cust.mealPlan.side; // After main comes side
            nextState = C_STATE.WAITING_SIDE;
        } else if (cust.state === C_STATE.WAITING_SIDE) {
            // This was the last course
            nextOrder = null;
            nextState = C_STATE.SERVED_FINAL;
        }
        // --- End Determine Next Course ---


        // --- Update Customer State ---
        if (nextOrder && nextState) { // If there is a next course...
            cust.state = nextState;
            cust.currentOrder = nextOrder;
            cust.spawnTime = Date.now(); // Reset timer for this new course
            cust.patienceCurrent = cust.patienceTotal; // Reset patience
            updateCustomerMood(cust); // Reset mood

            // Update Speech Bubble for next order
            const nextItemData = foodItems[nextOrder];
            const nextOrderIcon = getFoodIcon(nextOrder);
            if (cust.bubbleElement && nextItemData) {
                cust.bubbleElement.innerHTML = `<div class="dish-name">${nextOrder}</div><div class="dish-price">$${nextItemData.price}</div><div class="dish-emoji"></div>`;
                const dishEmojiContainer = cust.bubbleElement.querySelector('.dish-emoji');
                dishEmojiContainer.innerHTML = '';
                dishEmojiContainer.appendChild(createIconElement(nextOrderIcon, nextOrder));
            }
            console.log(`Customer ${cust.id} served ${servedFoodId}, now waiting for ${nextOrder}`);

        } else { // --- FINAL course was just served ---
            cust.state = C_STATE.SERVED_FINAL;
            cust.currentOrder = null;

            const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal;
            let tipMultiplier = 0.05;
            if (patienceRatio > 0.8) tipMultiplier = 0.25;
            else if (patienceRatio > 0.5) tipMultiplier = 0.18;
            else if (patienceRatio > 0.2) tipMultiplier = 0.12;
            const tipAmount = Math.ceil(cust.orderPrice * tipMultiplier);
            const totalEarned = cust.orderPrice + tipAmount;
            money += totalEarned; moneyDisplay.textContent = money;

            showFeedbackIndicator(cust.element || cust.tableElement || player, `+ $${cust.orderPrice} Meal<br/>+ $${tipAmount} Tip!`, "positive");
            cust.moodIndicator.textContent = '😋';
            if (cust.bubbleElement) cust.bubbleElement.innerHTML = "Grazie! 👌";
            const tableEl = diningArea.querySelector(`#${cust.tableElement.id}`);
            if (tableEl) { tableEl.classList.remove('table-highlight', 'table-leaving-soon'); }

            if (cust.element) { cust.element.style.transition = 'opacity 1s ease 0.5s'; cust.element.style.opacity = '0'; }
            setTimeout(() => { if (cust.element && cust.element.parentNode) { cust.element.remove(); } cust.state = C_STATE.REMOVE; }, 1500);
            console.log(`Customer ${cust.id} served final course (${servedFoodId}). Total Earned: $${totalEarned}`);
        }

        // --- Clear Player Hands ---
        carryingFood = null; carryingFoodIcon = null; carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active'); if (debugMode) debugFood.textContent = "None";
    }
    // --- END MODIFIED: serveCustomer ---

    // --- MODIFIED: updateCustomerMood ---
    function updateCustomerMood(cust) {
         // Only update mood if customer is waiting for something
         if (!cust.moodIndicator || (cust.state !== C_STATE.WAITING_DRINK && // <<< Added WAITING_DRINK check
             cust.state !== C_STATE.WAITING_APPETIZER &&
             cust.state !== C_STATE.WAITING_MAIN &&
             cust.state !== C_STATE.WAITING_SIDE)) {
                // If they finished or are leaving, don't revert mood indicator
                if(cust.state !== C_STATE.SERVED_FINAL && cust.state !== C_STATE.LEAVING) {
                     if(cust.moodIndicator) cust.moodIndicator.textContent = ''; // Clear if not applicable
                }
                return;
            }

        const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal;
        let newMoodEmoji = moodEmojis.happy;
        if (patienceRatio <= 0.2) newMoodEmoji = moodEmojis.angry;
        else if (patienceRatio <= 0.5) newMoodEmoji = moodEmojis.impatient;
        else if (patienceRatio <= 0.8) newMoodEmoji = moodEmojis.neutral;

        if (cust.moodIndicator.textContent !== newMoodEmoji) {
             cust.moodIndicator.textContent = newMoodEmoji;
        }
    }
    // --- END MODIFIED: updateCustomerMood ---

    function clearCustomersAndIndicators() { /* unchanged */ }
    function triggerRandomEvent() { /* unchanged */ }
    function handleEventChoice(e) { /* unchanged */ }
    function disableOvenStations(disable) { /* unchanged */ }

    // --- Initialization (NOW includes table generation call) ---
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
            generateTables(diningArea, numTables); // Call table generation here

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
// <<< END OF UPDATED full.js >>>
