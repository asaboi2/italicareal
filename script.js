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

    // Customer States (NEW)
    const C_STATE = {
        WAITING_APPETIZER: 'waiting_appetizer',
        WAITING_MAIN: 'waiting_main',
        WAITING_SIDE: 'waiting_side',
        // EATING: 'eating', // Optional: Add later if needed
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
    const randomEvents = [ /* unchanged */ ];

    // --- Helper Functions ---

    // Memoized function to get items by category
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

    // playSound, playLoopingSound, stopLoopingSound (unchanged)
    function playSound(audioElement, volume = 0.5) { /* ... unchanged ... */ }
    function playLoopingSound(audioElement, volume = 0.3) { /* ... unchanged ... */ }
    function stopLoopingSound(audioElement) { /* ... unchanged ... */ }
    function getFoodIcon(foodId) { /* ... unchanged ... */ }
    function createIconElement(iconSrcOrEmoji, altText = 'Food item') { /* ... unchanged ... */ }
    function animatePrepProgress(progressBarElement, durationMs, onComplete) { /* ... unchanged ... */ }
    function addFoodToPass(foodId) { /* ... unchanged ... */ }
    function generateTables(container, numTables) { /* ... unchanged grid layout version ... */ }
    function showFeedbackIndicator(targetElement, text, type = "info", duration = 1800) { /* ... unchanged ... */ }


    // --- Event Listeners ---
    // ... (Key listeners, menu button, station clicks, delivery click, trash click - mostly unchanged logic but check callbacks) ...

    // --- MODIFIED: Dining Area Click ---
    diningArea.addEventListener('click', (e) => {
        playSound(sfxClick);
        if (isPaused) return;
        const targetTable = e.target.closest('.table');
        if (targetTable) {
            const tableId = targetTable.id;
            // Capture the food being carried *before* starting the move
            const foodBeingCarried = carryingFood;

            if (foodBeingCarried) {
                movePlayerToElement(targetTable, () => {
                    // This callback runs *after* the player arrives
                    // Use the captured food ID, not the potentially changed global one
                    if (!foodBeingCarried) return;

                    // Find customer at this table waiting for THIS specific food
                    const customerToServe = customers.find(c =>
                        c.tableElement.id === tableId &&
                        (c.state === C_STATE.WAITING_APPETIZER ||
                         c.state === C_STATE.WAITING_MAIN ||
                         c.state === C_STATE.WAITING_SIDE) && // Check all waiting states
                        c.currentOrder === foodBeingCarried
                    );

                    if (customerToServe) {
                        serveCustomer(customerToServe, foodBeingCarried); // Pass the specific food
                    } else {
                        // Arrived with food, but no one here wants *this* food *now*
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
                    // Clear player's hands ONLY if successfully served or determined wrong order
                    // Note: serveCustomer handles clearing hands on success
                    if (!customerToServe) { // If serve didn't happen
                         // Maybe don't clear hands? Or decide based on feedback? Let's NOT clear here.
                         // If they deliver wrong food, they should probably keep holding it.
                    }

                 });
            } else {
                 // Not carrying food, just move
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

    function startGame() {
        if (gameRunning && !isPaused) return;
        console.log(`--- startGame: Starting Level ${level} ---`);
        money = 0;
        timeLeft = 120; // Set timer
        gameRunning = true; isPaused = false;
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
        clearCustomersAndIndicators();
        const numTables = Math.min(8, 2 + level); // Max tables logic unchanged
        generateTables(diningArea, numTables);
        foodStations.forEach(s => {
            s.classList.remove('preparing'); s.style.pointerEvents = 'auto';
            const pb = s.querySelector('.prep-progress-bar');
            if (pb) { pb.style.transform = 'scaleX(0)'; pb.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; delete pb._animation; }
        });
        stopPlayerMovement();
        console.log("--- startGame: Cleared dynamic elements & stations, Generated Tables ---");
        try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; }
        catch (e) { console.error("--- startGame: ERROR setting background ---", e); }
        initializeGameVisuals();
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
        // Use adjusted thresholds
        const moneyTarget = levelThresholds[level] || 99999;
        const levelWon = money >= moneyTarget;
        const isFinalLevel = level >= maxLevel;
        finalScoreDisplay.textContent = money;
        if (levelWon && isFinalLevel) { /* ... unchanged ... */ }
        else if (levelWon) { /* ... unchanged ... */ }
        else { /* ... unchanged ... */ }
        console.log("End of Day processed.");
    }

    function pauseGame() { /* ... unchanged ... */ }
    function resumeGame() { /* ... unchanged (includes music resume check) ... */ }

    function gameTick() {
        if (!gameRunning || isPaused) { clearInterval(timerInterval); return; }
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        updateCustomers(); // Handles patience for current course

        if (timeLeft <= 0) {
            endGame();
            return;
        }

        // Check for random event trigger (condition unchanged)
        if (customersSpawnedThisLevel >= RANDOM_EVENT_MIN_CUSTOMERS && Math.random() < 0.02 && eventModal.classList.contains('hidden')) {
            triggerRandomEvent();
        }
    }

    function updateCustomers() {
        if (isPaused) return;
        const now = Date.now();
        const LEAVING_SOON_THRESHOLD = 8; // Slightly more warning time for multi-course

        customers.forEach((c) => {
            // Only process customers who are waiting for something
            if (c.state !== C_STATE.WAITING_APPETIZER &&
                c.state !== C_STATE.WAITING_MAIN &&
                c.state !== C_STATE.WAITING_SIDE) {
                return;
            }

            // Calculate patience reduction based on time since *this course* started
            const elapsedSinceCourseStart = (now - c.spawnTime) / 1000; // spawnTime is reset per course
            const oldPatienceRatio = c.patienceCurrent / c.patienceTotal;
            c.patienceCurrent = Math.max(0, c.patienceTotal - elapsedSinceCourseStart);
            const newPatienceRatio = c.patienceCurrent / c.patienceTotal;

            // Impatient sound trigger
            if (oldPatienceRatio > 0.5 && newPatienceRatio <= 0.5) { playSound(sfxImpatient); }

            updateCustomerMood(c); // Update visual mood

            const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
            if (!tableEl) { c.state = C_STATE.REMOVE; return; } // Mark for removal if table gone

            // Update 'leaving soon' visual
            if (c.patienceCurrent <= LEAVING_SOON_THRESHOLD && c.patienceCurrent > 0) {
                 tableEl.classList.add('table-leaving-soon');
            } else {
                 tableEl.classList.remove('table-leaving-soon');
            }

            // Check if patience ran out for the current course
            if (c.patienceCurrent <= 0) {
                customerLeavesAngry(c); // Customer leaves if patience runs out at any stage
            }
        });

        // Filter out removed customers
        customers = customers.filter(c => c.state !== C_STATE.REMOVE);
    }

    function customerLeavesAngry(c) {
        // Prevent multiple triggers
        if (!c || c.state === C_STATE.LEAVING || c.state === C_STATE.REMOVE) return;

        playSound(sfxAngryLeft);
        console.log("Customer leaving angry:", c.id, "from table:", c.tableElement.id, "while waiting for:", c.currentOrder);
        c.state = C_STATE.LEAVING; // Set state

        const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
        showFeedbackIndicator(c.element || tableEl || player, "Left Angry! 😡", "negative");

        // Clear table highlights
        if (tableEl) {
            tableEl.classList.remove('table-highlight', 'table-leaving-soon');
        }

        // Fade out customer element
        if (c.element) {
            c.element.style.transition = 'opacity 0.5s ease';
            c.element.style.opacity = '0';
        }

        // Schedule removal from game state and DOM
        setTimeout(() => {
            if (c.element && c.element.parentNode) { c.element.remove(); }
            c.state = C_STATE.REMOVE; // Mark for filtering
        }, 500);
    }

    function movePlayerToElement(targetEl, callback = null) { /* ... unchanged ... */ }
    function movePlayerToCoordinates(targetX, targetY, callback = null) { /* ... unchanged ... */ }
    function stopPlayerMovement() { /* ... unchanged ... */ }
    function updatePlayerPosition() { /* ... unchanged ... */ }
    function scheduleNextCustomer() { /* ... unchanged ... */ }

    // --- MODIFIED: spawnCustomer ---
    function spawnCustomer() {
        if (!gameRunning || isPaused) { scheduleNextCustomer(); return; }
        try {
            const allTables = Array.from(diningArea.querySelectorAll('.table'));
            if (allTables.length === 0) { scheduleNextCustomer(); return; }

            // Find available tables (still 1 customer per table)
            const potentialTables = allTables.filter(table => {
                return !customers.some(c => c.tableElement.id === table.id && c.state !== C_STATE.LEAVING && c.state !== C_STATE.REMOVE);
            });

            if (potentialTables.length > 0) {
                // --- Trigger Background Sounds ---
                 if (!backgroundSoundsStarted) {
                     console.log("First customer spawning, attempting to start background sounds.");
                     playLoopingSound(bgmAudio, 0.3); playLoopingSound(ambienceAudio, 0.4);
                     backgroundSoundsStarted = true;
                 }

                playSound(sfxOrdered);
                const tableElement = potentialTables[Math.floor(Math.random() * potentialTables.length)];
                const seatElement = tableElement.querySelector('.seat');
                if (!seatElement) { scheduleNextCustomer(); return; }

                // --- Generate Meal Plan ---
                const wantsAppetizer = Math.random() < APPETIZER_CHANCE;
                const mealPlan = {
                    appetizer: wantsAppetizer ? getRandomFoodItem('Appetizers') : null,
                    main: getRandomFoodItem('Mains'),
                    side: getRandomFoodItem('Sides')
                };

                // Ensure required courses were found
                if (!mealPlan.main || !mealPlan.side) {
                    console.warn("Could not generate full meal plan (missing main or side). Skipping customer spawn.");
                    scheduleNextCustomer(); // Try again later
                    return;
                }
                 if (wantsAppetizer && !mealPlan.appetizer) {
                    console.warn("Customer wanted appetizer but none found. Spawning without appetizer.");
                    mealPlan.appetizer = null; // Ensure it's null if not found
                }

                // --- Determine Initial Order and State ---
                let currentOrder = null;
                let initialState = null;
                if (mealPlan.appetizer) {
                    currentOrder = mealPlan.appetizer;
                    initialState = C_STATE.WAITING_APPETIZER;
                } else {
                    currentOrder = mealPlan.main; // If no app, start with main
                    initialState = C_STATE.WAITING_MAIN;
                }

                // --- Create Visual Elements ---
                const custEl = document.createElement('div'); custEl.className = 'customer';
                custEl.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)]; custEl.style.opacity = '0';

                const foodData = foodItems[currentOrder]; // Get data for the *first* item
                const orderIcon = getFoodIcon(currentOrder);

                const bubble = document.createElement('div'); bubble.className = 'speech-bubble';
                bubble.innerHTML = `<div class="dish-name">${currentOrder}</div><div class="dish-price">$${foodData.price}</div><div class="dish-emoji"></div>`;
                const dishEmojiContainer = bubble.querySelector('.dish-emoji'); dishEmojiContainer.appendChild(createIconElement(orderIcon, currentOrder));
                bubble.style.opacity = '0';

                const moodIndicator = document.createElement('div'); moodIndicator.className = 'mood-indicator';
                moodIndicator.textContent = moodEmojis.happy;

                custEl.appendChild(moodIndicator); custEl.appendChild(bubble);
                seatElement.appendChild(custEl);

                requestAnimationFrame(() => { // Fade in
                    custEl.style.transition = 'opacity 0.3s ease-in'; bubble.style.transition = 'opacity 0.3s ease-in 0.1s';
                    custEl.style.opacity = '1'; bubble.style.opacity = '1';
                });

                // --- Create Customer Object ---
                const customerId = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`;
                const patienceTotal = Math.max(20, customerPatienceBase - (level - 1) * 2); // Patience per course
                const newCustomer = {
                    id: customerId,
                    element: custEl,
                    tableElement: tableElement,
                    mealPlan: mealPlan, // Store the full plan
                    currentOrder: currentOrder, // Item currently waiting for
                    state: initialState, // Initial waiting state
                    orderPrice: 0, // Total price accumulates
                    spawnTime: Date.now(), // Reset per course - start time for *this* course
                    patienceTotal: patienceTotal,
                    patienceCurrent: patienceTotal,
                    moodIndicator: moodIndicator,
                    bubbleElement: bubble // Reference to bubble for updates
                };
                customers.push(newCustomer);
                customersSpawnedThisLevel++; // Increment counter

                tableElement.classList.add('table-highlight'); // Highlight the table

            } else {
                 // console.log("[spawnCustomer] No available tables.");
            }
        } catch (error) { console.error("Error during spawnCustomer:", error); }
        scheduleNextCustomer(); // Schedule the next potential spawn
    }
    // --- END MODIFIED: spawnCustomer ---


    // --- MODIFIED: serveCustomer ---
    function serveCustomer(cust, servedFoodId) {
        // Check if the served food is what the customer is currently waiting for
        if (!cust || cust.currentOrder !== servedFoodId ||
            (cust.state !== C_STATE.WAITING_APPETIZER &&
             cust.state !== C_STATE.WAITING_MAIN &&
             cust.state !== C_STATE.WAITING_SIDE) )
        {
             // This shouldn't normally happen if the click handler logic is correct
             console.warn("serveCustomer called with mismatched food/customer state:", cust?.id, servedFoodId, cust?.currentOrder, cust?.state);
             // Optional: Show "Wrong Order" feedback again? Or just ignore.
             return; // Do nothing if the order doesn't match or state is wrong
        }

        playSound(sfxServe); // Play serve sound

        // Accumulate price for the served item
        const servedItemData = foodItems[servedFoodId];
        if (servedItemData) {
            cust.orderPrice += servedItemData.price;
        } else {
            console.warn("Data not found for served item:", servedFoodId);
        }

        // --- Determine Next Course ---
        let nextOrder = null;
        let nextState = null;

        if (cust.state === C_STATE.WAITING_APPETIZER) {
            nextOrder = cust.mealPlan.main; // Next is Main
            nextState = C_STATE.WAITING_MAIN;
        } else if (cust.state === C_STATE.WAITING_MAIN) {
            nextOrder = cust.mealPlan.side; // Next is Side
            nextState = C_STATE.WAITING_SIDE;
        } else if (cust.state === C_STATE.WAITING_SIDE) {
            // This was the last course (Side)
            nextOrder = null;
            nextState = C_STATE.SERVED_FINAL;
        }

        // --- Update Customer State ---
        if (nextOrder && nextState) {
            // --- Transition to waiting for the NEXT course ---
            cust.state = nextState;
            cust.currentOrder = nextOrder;
            cust.spawnTime = Date.now(); // RESET spawnTime for the new course's patience timer
            cust.patienceCurrent = cust.patienceTotal; // Reset patience
            updateCustomerMood(cust); // Reset mood visually (optional, could start neutral)

            // Update Speech Bubble
            const nextItemData = foodItems[nextOrder];
            const nextOrderIcon = getFoodIcon(nextOrder);
            if (cust.bubbleElement && nextItemData) {
                cust.bubbleElement.innerHTML = `<div class="dish-name">${nextOrder}</div><div class="dish-price">$${nextItemData.price}</div><div class="dish-emoji"></div>`;
                const dishEmojiContainer = cust.bubbleElement.querySelector('.dish-emoji');
                dishEmojiContainer.innerHTML = ''; // Clear previous
                dishEmojiContainer.appendChild(createIconElement(nextOrderIcon, nextOrder));
            }
            console.log(`Customer ${cust.id} served ${servedFoodId}, now waiting for ${nextOrder}`);

        } else {
            // --- FINAL course was just served ---
            cust.state = C_STATE.SERVED_FINAL;
            cust.currentOrder = null; // No longer waiting for anything specific

            // Calculate Tip (based on patience of the *last* course)
            const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal;
            let tipMultiplier = 0.05;
            if (patienceRatio > 0.8) tipMultiplier = 0.25; // Increased final tips slightly
            else if (patienceRatio > 0.5) tipMultiplier = 0.18;
            else if (patienceRatio > 0.2) tipMultiplier = 0.12;

            const tipAmount = Math.ceil(cust.orderPrice * tipMultiplier); // Tip based on TOTAL bill
            const totalEarned = cust.orderPrice + tipAmount;
            money += totalEarned;
            moneyDisplay.textContent = money;

            showFeedbackIndicator(cust.element || cust.tableElement || player, `+ $${cust.orderPrice} Meal<br/>+ $${tipAmount} Tip!`, "positive");

            // Update visuals for leaving
            cust.moodIndicator.textContent = '😋';
            if (cust.bubbleElement) cust.bubbleElement.innerHTML = "Grazie! 👌";

            // Remove table highlights
            const tableEl = diningArea.querySelector(`#${cust.tableElement.id}`);
            if (tableEl) {
                tableEl.classList.remove('table-highlight', 'table-leaving-soon');
            }

            // Schedule fade out and removal
            if (cust.element) {
                cust.element.style.transition = 'opacity 1s ease 0.5s';
                cust.element.style.opacity = '0';
            }
            setTimeout(() => {
                if (cust.element && cust.element.parentNode) { cust.element.remove(); }
                cust.state = C_STATE.REMOVE;
            }, 1500); // Delay + fade duration

             console.log(`Customer ${cust.id} served final course (${servedFoodId}). Total Earned: $${totalEarned}`);
        }

        // --- Clear Player Hands (happens after any successful serve) ---
        carryingFood = null;
        carryingFoodIcon = null;
        carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active');
        if (debugMode) debugFood.textContent = "None";

    }
    // --- END MODIFIED: serveCustomer ---

    function updateCustomerMood(cust) {
        // Only update mood if customer is waiting for something
         if (!cust.moodIndicator || (cust.state !== C_STATE.WAITING_APPETIZER &&
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

    function clearCustomersAndIndicators() {
        customers.forEach(c => { if (c.element && c.element.parentNode) { c.element.remove(); } });
        customers = [];
        document.querySelectorAll('.money-indicator, .feedback-indicator').forEach(el => el.remove());
        diningArea.querySelectorAll('.table').forEach(t => {
            t.classList.remove('table-highlight', 'table-leaving-soon');
            const seat = t.querySelector('.seat'); if(seat) seat.innerHTML = '';
        });
    }


    // --- Event Logic (Unchanged) ---
    function triggerRandomEvent() { /* ... unchanged ... */ }
    function handleEventChoice(e) { /* ... unchanged ... */ }
    function disableOvenStations(disable) { /* ... unchanged ... */ }

    // --- Initialization (Unchanged) ---
    function initializeGameVisuals() { /* ... unchanged ... */ }

    // --- Game Start Trigger ---
    initializeGameVisuals();
    setTimeout(() => { if (!gameRunning) { startGame(); } }, 150);

}); // End DOMContentLoaded
// <<< END OF UPDATED full.js >>>
