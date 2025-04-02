document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const player = document.getElementById('player');
    const carryingDisplay = document.getElementById('carrying');
    const moneyDisplay = document.getElementById('money');
    const timerDisplay = document.getElementById('timer');
    const levelDisplay = document.getElementById('level');
    // startBtn removed
    // restartBtn removed (using modal buttons)
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const levelEndTitle = document.getElementById('level-end-title'); // New modal elements
    const levelResultMessage = document.getElementById('level-result-message');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const retryLevelBtn = document.getElementById('retry-level-btn');
    const gameWonModal = document.getElementById('game-won-modal'); // New modal
    const finalWinScoreDisplay = document.getElementById('final-win-score');
    const playAgainBtn = document.getElementById('play-again-btn');
    const restaurantArea = document.querySelector('.restaurant');
    const diningArea = restaurantArea.querySelector('.dining-area');
    const kitchenRow = document.querySelector('.kitchen-row');
    const foodStations = kitchenRow.querySelectorAll('.food-station');
    // Tables selected dynamically
    const menuModal = document.getElementById('menu-modal');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    // Menu elements needed only if menu functionality is used
    // const tabBtns = menuModal.querySelectorAll('.tab-btn');
    // const menuSectionsContainer = menuModal.querySelector('.menu-sections');
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

    // --- Game State Variables ---
    let money = 0;
    let timeLeft = 180;
    let gameRunning = false;
    let isPaused = false;
    let carryingFood = null;
    let carryingFoodIcon = null; // Store image src or emoji text
    let customers = [];
    let timerInterval = null;
    let customerSpawnTimeout = null;
    let customerPatienceBase = 35;
    let level = 1; // Start at level 1
    const maxLevel = 5; // <<< Define the final level
    let playerPosition = { x: 0, y: 0 };
    let isMoving = false;
    let animationFrameId = null;
    let debugMode = false; // Set to true to always show debug info initially
    // Use thresholds as WIN condition for PREVIOUS level
    // levelThresholds[0] = 0 (start)
    // To beat level 1, need >= levelThresholds[1] = $75
    // To beat level 2, need >= levelThresholds[2] = $180
    // etc.
    let levelThresholds = [0, 75, 180, 300, 450, 650]; // Needs target for level 5 win (index 5)
    const BACKGROUND_IMAGE_URL = 'assets/backdrop.png';
    let readyItemsOnPass = []; // Will store { foodId: 'Name', icon: 'src or emoji' }
    let lastEventIndex = -1;

  // --- Game Configuration ---
    const foodItems = {
        // Appetizers / For the Table / Small Plates (Combined for game category)
        'Bread Basket': { image: 'assets/bread basket.png', price: 5, category: 'Appetizers', prepTime: 1 },
        'Cherry Tomato & Garlic Confit': { image: 'assets/cherry confit.png', price: 12, category: 'Appetizers', prepTime: 2 },
        'Ahi Crudo': { image: 'assets/ahi crudo.png', price: 20, category: 'Appetizers', prepTime: 3 }, // NEW
        'Whipped Ricotta': { image: 'assets/ricotta.png', price: 14, category: 'Appetizers', prepTime: 2 },
        'Raviolo al Uovo': { image: 'assets/raviolo.png', price: 8, category: 'Appetizers', prepTime: 2.5 }, // NEW
        'Prosciutto e Melone': { image: 'assets/prosciutto e melone.png', price: 10, category: 'Appetizers', prepTime: 1.5 }, // NEW
        'Crispy Gnudi': { image: 'assets/crispy gnudi.png', price: 12, category: 'Appetizers', prepTime: 3.5 },
        'Marinated Olives': { image: 'assets/olives.png', price: 6, category: 'Appetizers', prepTime: 1 },

        // Salads
        'House Salad': { image: 'assets/house salad.png', price: 12, category: 'Salads', prepTime: 2.5 }, // Name matches menu intent
        'Spicy Caesar Salad': { image: 'assets/spicy caesar.png', price: 14, category: 'Salads', prepTime: 3 }, // Name matches menu intent
        'Mean Green Salad': { image: 'assets/mean green salad.png', price: 12, category: 'Salads', prepTime: 2.5 }, // NEW
        'Summer Tomato Panzanella': { image: 'assets/tomato panzanella.png', price: 10, category: 'Salads', prepTime: 2 }, // NEW

        // Pasta
        'Cacio e Pepe': { image: 'assets/Cacio e pepe.png', price: 20, category: 'Pasta', prepTime: 4 },
        'Seeing Red Pesto': { image: 'assets/seeing red.png', price: 24, category: 'Pasta', prepTime: 4 },
        'Short Rib Agnolotti': { image: 'assets/agnolotti.png', price: 32, category: 'Pasta', prepTime: 5 },
        'Pomodoro': { image: 'assets/pomodoro.png', price: 26, category: 'Pasta', prepTime: 3.5 }, // Assuming Spaghetti Pomodoro

        // Pizza (Using individual Neopolitan names, and Slice names for Grandma)
        'Tre Sale Slice': { image: 'assets/tresale.png', price: 6, category: 'Pizza', prepTime: 3.5 }, // Slice from Grandma
        'Tomato Pie Slice': { image: 'assets/tomato pie.png', price: 5, category: 'Pizza', prepTime: 3 }, // Slice from Grandma
        'Garlic Girl': { image: 'assets/garlic girl-Photoroom.png', price: 25, category: 'Pizza', prepTime: 4.5 }, // Neopolitan, Updated Image
        'Toni Roni': { image: 'assets/toni roni.png', price: 26, category: 'Pizza', prepTime: 5 }, // Neopolitan

        // Mains
        'Sweet & Spicy Chicken Cutlets': { image: 'assets/cutlets.png', price: 28, category: 'Mains', prepTime: 5 }, // UPDATED NAME
        'Roasted Half-Chicken': { image: 'assets/half chicken.png', price: 34, category: 'Mains', prepTime: 7 },
        'Grilled Sockeye Salmon': { image: 'assets/salmon.png', price: 36, category: 'Mains', prepTime: 4.5 }, // UPDATED NAME
        'Seared Hanger Steak': { image: 'assets/hangar steak.png', price: 38, category: 'Mains', prepTime: 6 }, // UPDATED NAME

        // Sides / A La Carte
        'Mushroom Risotto': { image: 'assets/mushroom risotto.png', price: 12, category: 'Sides', prepTime: 5 },
        'Crispy Baked Polenta': { image: 'assets/polenta.png', price: 10, category: 'Sides', prepTime: 4 }, // UPDATED NAME
        'Garlic Confit Mashed Potatoes': { image: 'assets/mashed potatoes.png', price: 10, category: 'Sides', prepTime: 3 }, // UPDATED NAME
        'Parmigiano-Crusted Roast Fingerlings': { image: 'assets/roasted fingerling.png', price: 8, category: 'Sides', prepTime: 3 }, // NEW
        'Shoestring Fries': { image: 'assets/shoestring fries.png', price: 6, category: 'Sides', prepTime: 2.5 }, // UPDATED IMAGE
        'Blackened Eggplant': { image: 'assets/eggplant.png', price: 8, category: 'Sides', prepTime: 2.5 }, // NEW
        'Sauteed Rainbow Chard': { image: 'assets/rainbow chard.png', price: 6, category: 'Sides', prepTime: 2 }, // NEW
        'Grilled Asparagus': { image: 'assets/grilled asparagus.png', price: 8, category: 'Sides', prepTime: 3 }, // UPDATED IMAGE

        // Drinks (Kept for gameplay)
        'Water': { emoji: '💧', price: 0, category: 'Drinks', prepTime: 0.5 },
        'Wine': { emoji: '🍷', price: 12, category: 'Drinks', prepTime: 0.5 },
        'Soda': { emoji: '🥤', price: 3, category: 'Drinks', prepTime: 0.5 }
    };
    const customerEmojis = ['👩','👨','👵','👴','👱‍♀️','👱','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','🧑‍🎄','👸','👨‍🎨','👩‍🔬','💂','🕵️'];
    const moodEmojis = { happy: '😊', neutral: '😐', impatient: '😠', angry: '😡' };
    const randomEvents = [ // Same as previous version...
         { title: "Customer Complaint!", description: "A customer says their Cacio e Pepe is too peppery!", options: [ { text: "Apologize & Offer free drink (-$3)", effect: { money: -3, time: 0 }, feedback: "Comped a soda." }, { text: "Remake the dish (Lose time)", effect: { money: 0, time: -10 }, feedback: "Remade the pasta (-10s)." }, { text: "Argue politely (Risk anger)", effect: { money: 0, time: 0 }, feedback: "Defended the chef!" } ] }, { title: "Kitchen Emergency!", description: "The oven suddenly stopped working!", options: [ { text: "Quick Fix Attempt (-$20, -15s)", effect: { money: -20, time: -15 }, feedback: "Paid for quick fix (-$20, -15s)." }, { text: "Work Around It (No Pizza/Roast)", effect: { money: 0, time: 0 }, feedback: "No oven dishes for now..." }, { text: "Ignore It (Riskier)", effect: { money: 0, time: 0 }, feedback: "Ignored the oven..." } ] }, { title: "Ingredient Shortage", description: "Oh no! We're running low on fresh basil for Pomodoro!", options: [ { text: "Buy Emergency Basil (-$15)", effect: { money: -15, time: 0 }, feedback: "Bought expensive basil (-$15)." }, { text: "Improvise (Use dried herbs)", effect: { money: 0, time: 0 }, feedback: "Substituted herbs..." }, { text: "Stop serving Pomodoro", effect: { money: 0, time: 0 }, feedback: "Took Pomodoro off menu." } ] }, { title: "VIP Guest", description: "A famous food critic just sat down!", options: [ { text: "Offer Free Appetizer (-$10)", effect: { money: -10, time: 0 }, feedback: "Comped critic appetizer (-$10)." }, { text: "Chef's Special Attention (-10s)", effect: { money: 0, time: -10 }, feedback: "Chef gave extra attention (-10s)." }, { text: "Treat Like Normal", effect: { money: 0, time: 0 }, feedback: "Treated critic normally." } ] }, { title: "Sudden Rush!", description: "A big group just walked in! Faster service needed!", options: [ { text: "Work Faster! (Bonus Time)", effect: { money: 0, time: +15 }, feedback: "Rush handled! (+15s)" }, { text: "Stay Calm (Risk Anger)", effect: { money: 0, time: 0 }, feedback: "Kept cool under pressure." } ] }, { title: "Generous Tipper", description: "A customer was so impressed they left a huge tip!", options: [ { text: "Awesome! (+$25)", effect: { money: +25, time: 0 }, feedback: "Wow! +$25 Tip!" } ] }, { title: "Spill in the Kitchen!", description: "Someone dropped a tray of sauce!", options: [ { text: "Clean it Up (-10s)", effect: { money: 0, time: -10 }, feedback: "Cleaned up the mess (-10s)." }, { text: "Work Around It (Carefully!)", effect: { money: 0, time: 0 }, feedback: "Carefully avoiding the spill..." } ] }, { title: "Health Inspector!", description: "A surprise visit! Everything needs to be perfect.", options: [ { text: "Brief Pause & Tidy (-5s)", effect: { money: 0, time: -5 }, feedback: "Quick tidy for inspector (-5s)." }, { text: "Bribe? (-$50, Risky)", effect: { money: -50, time: 0}, feedback: "Attempted a 'tip' (-$50)..."} ]}
    ];


    // --- Helper Functions ---
    function getFoodIcon(foodId) { // Same as previous version...
        const item = foodItems[foodId];
        if (!item) return '?'; // Fallback
        return item.image || item.emoji || '?'; // Prefer image, then emoji, then fallback
    }

    function createIconElement(iconSrcOrEmoji, altText = 'Food item') { // Same as previous version...
        if (iconSrcOrEmoji.includes('/')) { // It's an image path
            const img = document.createElement('img');
            img.src = iconSrcOrEmoji;
            img.alt = altText;
            return img;
        } else { // It's an emoji (or fallback character)
            const span = document.createElement('span');
            span.textContent = iconSrcOrEmoji;
            return span;
        }
    }

    function animatePrepProgress(progressBarElement, durationMs, onComplete) { // Same as previous version...
        if (!progressBarElement) return;
        let start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(1, elapsed / durationMs);
            progressBarElement.style.transform = `scaleX(${progress})`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                if (onComplete) onComplete();
            }
        }
        requestAnimationFrame(step);
    }

    function addFoodToPass(foodId) { // Same as previous version...
        const itemData = foodItems[foodId];
        if (!itemData) return;

        const icon = getFoodIcon(foodId);
        readyItemsOnPass.push({ foodId: foodId, icon: icon }); // Store the icon info

        // Create visual element for the pass
        const itemDiv = document.createElement('div');
        itemDiv.className = 'ready-food-item';
        itemDiv.dataset.food = foodId;
        itemDiv.appendChild(createIconElement(icon, foodId)); // Use helper
        itemDiv.title = foodId; // Tooltip

        // Remove label if it's the first item
        const existingLabel = deliveryStation.querySelector('.delivery-station-label');
        if (existingLabel) existingLabel.remove();

        deliveryStation.appendChild(itemDiv);
    }


    // --- Generate Tables Function (MODIFIED FOR POSITIONING) ---
    function generateTables(container, numTables) {
        container.innerHTML = ''; // Clear existing tables
        const numCols = 3;
        // ***** MODIFIED: Place tables only in bottom half (top >= 50%) *****
        const rowPositions = [60, 85]; // Adjusted: Top percentages (e.g., 60% and 85% from the top)
        const colPositions = [18, 50, 82]; // Left percentages

        for (let i = 0; i < numTables; i++) {
            const table = document.createElement('div');
            table.classList.add('table');
            const tableIdNum = i + 1;
            table.id = `table-${tableIdNum}`;
            table.dataset.table = tableIdNum;
            const seat = document.createElement('div'); seat.classList.add('seat'); table.appendChild(seat);

            const row = Math.floor(i / numCols);
            const col = i % numCols;

            // Ensure we don't go out of bounds for the defined positions
            if (row < rowPositions.length && col < colPositions.length) {
                table.style.top = `${rowPositions[row]}%`;
                table.style.left = `${colPositions[col]}%`;
                table.style.transform = 'translate(-50%, -50%)'; // Center on the point
            } else {
                // Fallback for too many tables (shouldn't happen with current limits)
                console.warn(`Table ${tableIdNum} exceeded defined positions.`);
                table.style.top = `${55 + (row * 15)}%`; // Basic fallback layout
                table.style.left = `${15 + (col * 25)}%`;
                table.style.transform = 'translate(-50%, -50%)';
            }
            container.appendChild(table);
        }
        console.log(`Generated ${numTables} tables for level ${level}. Positions: ${JSON.stringify(rowPositions)} / ${JSON.stringify(colPositions)}`);
    }

    // --- Event Listeners ---
    let keysPressed = {}; // Keep track of pressed keys for debug toggle
    document.addEventListener('keydown', (e) => { // Same as previous version...
        keysPressed[e.key.toLowerCase()] = true;
        // Toggle debug mode with D+E+B+U+G
        if (keysPressed['d'] && keysPressed['e'] && keysPressed['b'] && keysPressed['u'] && keysPressed['g']) {
            debugMode = !debugMode;
            debugInfo.classList.toggle('hidden', !debugMode);
            console.log("Debug mode:", debugMode ? "ON" : "OFF");
            keysPressed = {}; // Reset keys after activation
        }
         // Reset keys if unrelated key is pressed
         if (!['d', 'e', 'b', 'u', 'g'].includes(e.key.toLowerCase())) {
             keysPressed = {};
         }
    });
    document.addEventListener('keyup', (e) => { // Same as previous version...
        delete keysPressed[e.key.toLowerCase()];
    });


    if (closeMenuBtn) { // Same as previous version...
        closeMenuBtn.addEventListener('click', () => { menuModal.classList.add('hidden'); resumeGame(); });
    }

    foodStations.forEach(station => { // Same as previous version...
         station.addEventListener('click', () => {
            if (isPaused || station.classList.contains('preparing')) return;
            if (carryingFood) {
                showFeedbackIndicator(station, "Hands full!", "negative", 1000);
                return; // Can't start cooking while carrying
            }

            const foodId = station.dataset.item;
            const item = foodItems[foodId];
            if (!item) return;

            station.classList.add('preparing');
            station.style.pointerEvents = 'none'; // Disable clicking while preparing
            const progressBar = station.querySelector('.prep-progress-bar');
            if (progressBar) {
                 progressBar.style.backgroundColor = '#ffcc00'; // Yellow for in progress
                 progressBar.style.transform = 'scaleX(0)'; // Reset just in case
                 const prepTimeMs = item.prepTime * 1000;

                 animatePrepProgress(progressBar, prepTimeMs, () => {
                    // On Completion
                    progressBar.style.backgroundColor = '#4CAF50'; // Green for done
                    station.classList.remove('preparing');
                    // No re-enabling pointerEvents here, food goes directly to pass
                    addFoodToPass(foodId); // Add to pass when done
                    progressBar.style.transform = 'scaleX(0)'; // Reset visually after short delay
                    progressBar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Reset color
                    station.style.pointerEvents = 'auto'; // Re-enable clicking now
                 });
            } else {
                // Fallback if no progress bar (e.g., instant items)
                setTimeout(() => {
                    station.classList.remove('preparing');
                    addFoodToPass(foodId);
                    station.style.pointerEvents = 'auto';
                }, (item.prepTime || 0.1) * 1000);
            }
        });
    });

    deliveryStation.addEventListener('click', (e) => { // Same as previous version...
        if (isPaused) return;
        const clickedItem = e.target.closest('.ready-food-item');

        if (carryingFood) {
             // Trying to place something ON the pass? Not allowed.
             showFeedbackIndicator(deliveryStation, "Place food on tables!", "negative", 1000);
             return;
        }

        if (clickedItem) {
            // --- Pickup food from pass ---
            const foodId = clickedItem.dataset.food;
            const itemIndex = readyItemsOnPass.findIndex(item => item.foodId === foodId); // Find the first matching item

            if (itemIndex !== -1) {
                const itemToTake = readyItemsOnPass.splice(itemIndex, 1)[0]; // Remove from state
                clickedItem.remove(); // Remove from DOM

                carryingFood = itemToTake.foodId;
                carryingFoodIcon = itemToTake.icon; // Store the icon (src or emoji)
                carryingDisplay.innerHTML = ''; // Clear previous
                carryingDisplay.appendChild(createIconElement(carryingFoodIcon, carryingFood)); // Use helper
                deliveryRadius.classList.add('active'); // Show delivery radius

                // Add label back if pass is now empty
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
        }
        // Clicked on empty pass area - do nothing
    });

    trashCan.addEventListener('click', () => { // Same as previous version...
        if (isPaused || !carryingFood) return;

        showFeedbackIndicator(trashCan, `Trashed ${carryingFood}!`, "negative");
        carryingFood = null;
        carryingFoodIcon = null;
        carryingDisplay.innerHTML = ''; // Clear visual
        deliveryRadius.classList.remove('active');
        if (debugMode) debugFood.textContent = "None";
        console.log("Trashed carried food");
    });

    diningArea.addEventListener('click', (e) => { // Same as previous version...
        if (isPaused) return;
        const targetTable = e.target.closest('.table');

        if (targetTable) {
            // Clicked on a table
            const tableId = targetTable.id;
            const customer = customers.find(c => c.tableElement.id === tableId && c.state === 'waiting');

            if (carryingFood) {
                // Attempting to deliver food
                movePlayerToElement(targetTable, () => {
                     if (!carryingFood) return; // Check if still carrying food upon arrival
                     const currentCustomer = customers.find(c => c.tableElement.id === tableId && c.state === 'waiting');
                     if (currentCustomer && currentCustomer.order === carryingFood) {
                         serveCustomer(currentCustomer);
                         // Food is consumed, carrying is cleared inside serveCustomer
                     } else if (currentCustomer) {
                         showFeedbackIndicator(targetTable, "Wrong order!", "negative");
                     } else {
                         showFeedbackIndicator(targetTable, "No customer here!", "negative");
                     }
                 });
            } else {
                // Not carrying food - maybe just moving? Or interacting?
                // For now, just move player to the table if not carrying
                 movePlayerToElement(targetTable);
                 // Could add logic here to show order again if clicked while not carrying
            }
        } else {
            // Clicked on the background (dining area but not a table)
             if (!isMoving) { // Only move if not already moving
                const rect = restaurantArea.getBoundingClientRect();
                // Calculate click position relative to the restaurant area
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // Ensure Y-coordinate stays above the kitchen line roughly
                // No change needed here, player should still be able to move higher
                // than the tables to reach the top ones (in the bottom half)
                const kitchenLineY = restaurantArea.offsetHeight * 0.90; // Adjust slightly if needed
                const targetY = Math.min(clickY, kitchenLineY); // Prevent going *into* kitchen visually

                movePlayerToCoordinates(clickX, targetY);
             }
        }
    });


    // --- NEW Listeners for Modal Buttons ---
    nextLevelBtn.addEventListener('click', () => { // Same as previous version...
        gameOverScreen.classList.add('hidden');
        level++; // Increment level
        startGame(); // Start the next level
    });

    retryLevelBtn.addEventListener('click', () => { // Same as previous version...
        gameOverScreen.classList.add('hidden');
        // Don't change level, just restart
        startGame();
    });

    playAgainBtn.addEventListener('click', () => { // Same as previous version...
        gameWonModal.classList.add('hidden');
        level = 1; // Reset to level 1
        startGame();
    });


    // --- Core Functions ---

    function startGame() { // Same as previous version...
        if (gameRunning && !isPaused) return; // Prevent starting if running
         console.log(`--- startGame: Starting Level ${level} ---`);

        // --- Calculate Level Specifics ---
        const numTables = Math.min(8, 2 + level); // Start with 3, add 1 per level, max 8
        const moneyTarget = levelThresholds[level] || 99999; // Target to WIN this level (reach next threshold)
        console.log(`Level ${level}: Tables=${numTables}, Target=$${moneyTarget}`);
        // --- End Level Specifics ---


        money = 0; // Reset money *per level*
        timeLeft = 180; // Reset time *per level*
        gameRunning = true; isPaused = false;
        carryingFood = null; carryingFoodIcon = null; customers = []; isMoving = false;
        readyItemsOnPass = []; // Clear the pass state
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>'; // Reset pass visuals
        lastEventIndex = -1;

        console.log("--- startGame: State reset ---");
        moneyDisplay.textContent = money; levelDisplay.textContent = level; timerDisplay.textContent = timeLeft;
        carryingDisplay.innerHTML = ''; // Clear carrying visual
        deliveryRadius.classList.remove('active'); debugFood.textContent = 'None';
        gameOverScreen.classList.add('hidden'); menuModal.classList.add('hidden'); eventModal.classList.add('hidden'); gameWonModal.classList.add('hidden'); // Hide all modals
        console.log("--- startGame: UI reset ---");

        clearCustomersAndIndicators(); // Clears customers and old table states
        generateTables(diningArea, numTables); // Generate tables for THIS level
         foodStations.forEach(s => { // Reset kitchen stations
            s.classList.remove('preparing'); s.style.pointerEvents = 'auto';
            const pb = s.querySelector('.prep-progress-bar'); if (pb) { pb.style.transform = 'scaleX(0)'; pb.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';}
         });

        stopPlayerMovement();
        console.log("--- startGame: Cleared dynamic elements & stations, Generated Tables ---");
        console.log("--- startGame: Attempting to set background ---");
        try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; if (!BACKGROUND_IMAGE_URL) { console.warn("BG URL missing!"); } else { /* console.log("Set background to:", BACKGROUND_IMAGE_URL); */ } } catch (e) { console.error("--- startGame: ERROR setting background ---", e); }
        console.log("--- startGame: Background set (or attempted) ---");
        console.log("--- startGame: Initializing visuals ---");
        try { initializeGameVisuals(); } catch (e) { console.error("--- startGame: ERROR initializing visuals ---", e); }
        console.log("--- startGame: Visuals initialized (or attempted) ---");
        console.log("--- startGame: Starting timers ---");
        clearInterval(timerInterval); timerInterval = setInterval(gameTick, 1000);
        clearTimeout(customerSpawnTimeout); scheduleNextCustomer(); // Start customer spawning
        console.log(`--- startGame: Level ${level} Started ---`);
    }

    function endGame() { // Same as previous version...
        console.log("Ending game/day...");
        gameRunning = false; isPaused = true; clearInterval(timerInterval); clearTimeout(customerSpawnTimeout);
        stopPlayerMovement();
        readyItemsOnPass = []; // Clear pass state
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>'; // Reset pass visual
        // Clear table states just in case - Find tables dynamically for this level
        diningArea.querySelectorAll('.table').forEach(table => table.classList.remove('table-highlight', 'table-leaving-soon'));


        // --- Determine Win/Loss ---
        const moneyTarget = levelThresholds[level] || 99999; // Target needed to pass current level
        const levelWon = money >= moneyTarget;
        const isFinalLevel = level >= maxLevel;

        finalScoreDisplay.textContent = money; // Update score display on modal

        if (levelWon && isFinalLevel) {
            // --- Overall Game Won ---
            console.log("Overall Game Won!");
            finalWinScoreDisplay.textContent = money; // Use a separate span if needed
            gameWonModal.classList.remove('hidden'); // Show win screen

        } else if (levelWon) {
            // --- Level Complete ---
            console.log(`Level ${level} Complete! Target: ${moneyTarget}, Earned: ${money}`);
            levelEndTitle.textContent = `Level ${level} Complete!`;
            levelResultMessage.textContent = `You earned $${money}. Get ready for the next level!`;
            nextLevelBtn.classList.remove('hidden');
            retryLevelBtn.classList.add('hidden');
            gameOverScreen.classList.remove('hidden'); // Show level end screen

        } else {
            // --- Level Lost ---
             console.log(`Level ${level} Failed! Target: ${moneyTarget}, Earned: ${money}`);
             levelEndTitle.textContent = `End of Day - Level ${level}`;
             levelResultMessage.textContent = `You didn't reach the target of $${moneyTarget}. Try again?`;
             nextLevelBtn.classList.add('hidden');
             retryLevelBtn.classList.remove('hidden');
             gameOverScreen.classList.remove('hidden'); // Show level end screen
        }

        deliveryRadius.classList.remove('active');
        console.log("End of Day processed.");
    }

    // ... (pauseGame, resumeGame as before) ...
     function pauseGame() { if (!gameRunning || isPaused) return; isPaused = true; clearInterval(timerInterval); stopPlayerMovement(); console.log("Game Paused"); }
     function resumeGame() { if (!gameRunning || !isPaused) return; isPaused = false; // Set back to false
         // Restart the main timer ONLY if the game should still be running (time > 0)
         if (gameRunning && timeLeft > 0) {
             clearInterval(timerInterval); // Clear just in case
             timerInterval = setInterval(gameTick, 1000);
             console.log("Game Resumed");
         } else {
              console.log("Game NOT Resumed (already ended or time up)");
         }
     }

     function gameTick() { // Same as previous version...
         if (!gameRunning || isPaused) {
             // Ensure timer stops if paused or not running
             clearInterval(timerInterval);
             return;
         }
         timeLeft--;
         timerDisplay.textContent = timeLeft;
         updateCustomers();
         if (timeLeft <= 0) {
             endGame(); // This will stop the timer interval via gameRunning=false
             return; // Important to prevent further execution in this tick
         }
         // Trigger random event ~2% chance per second
         if (Math.random() < 0.02 && eventModal.classList.contains('hidden')) {
             triggerRandomEvent();
             // Note: triggerRandomEvent pauses the game, which stops the timer via pauseGame
         }
     }

    // ... (updateCustomers, customerLeavesAngry as before) ...
    function updateCustomers() { // Same as previous version...
        if (isPaused) return;
        const now = Date.now();
        const LEAVING_SOON_THRESHOLD = 5; // seconds

        customers.forEach((c) => {
            if (c.state === 'leaving' || c.state === 'served' || c.state === 'remove') return;

            const elapsed = (now - c.spawnTime) / 1000;
            c.patienceCurrent = Math.max(0, c.patienceTotal - elapsed);
            updateCustomerMood(c);

            // Need to re-select the table element potentially if tables were regenerated
            const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
            if (!tableEl) {
                 console.warn("Customer's table element not found:", c.tableElement.id);
                 // Maybe mark customer for removal if table vanishes?
                 // For now, just skip updating its visual state.
                 return;
            }


            if (c.patienceCurrent <= LEAVING_SOON_THRESHOLD && c.patienceCurrent > 0) {
                tableEl.classList.add('table-leaving-soon');
            } else {
                tableEl.classList.remove('table-leaving-soon');
            }

            if (c.patienceCurrent <= 0 && c.state === 'waiting') {
                customerLeavesAngry(c);
            }
        });

        // Filter out customers marked for removal
        customers = customers.filter(c => c.state !== 'remove');
    }

    function customerLeavesAngry(c) { // Same as previous version...
        if (!c || c.state === 'leaving' || c.state === 'remove') return; // Prevent multiple triggers

        console.log("Customer leaving angry:", c.id);
        c.state = 'leaving'; // Mark as leaving

        const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
        if (tableEl) {
            tableEl.classList.remove('table-highlight', 'table-leaving-soon');
        }

        showFeedbackIndicator(tableEl || player, "Left Angry! 😡", "negative");

        // Fade out the customer element
        if (c.element) {
            c.element.style.transition = 'opacity 0.5s ease';
            c.element.style.opacity = '0';
        }

        // Schedule removal from game state and DOM
        setTimeout(() => {
            if (c.element && c.element.parentNode) {
                c.element.remove();
            }
            c.state = 'remove'; // Mark for filtering in updateCustomers
        }, 500); // Remove after fade out
    }

    // ... (movePlayerToElement, movePlayerToCoordinates, stopPlayerMovement, updatePlayerPosition as before) ...
      function movePlayerToElement(targetEl, callback = null) { if (isPaused || !targetEl) return; const restRect = restaurantArea.getBoundingClientRect(); const plyH = player.offsetHeight / 2 || 35; const plyW = player.offsetWidth / 2 || 25; let tX, tY; if (targetEl.closest('.kitchen-row')) { const sI = targetEl.closest('.food-station') || targetEl; const tR = sI.getBoundingClientRect(); const sCX_v = tR.left + tR.width / 2; tX = sCX_v - restRect.left; tY = restaurantArea.offsetHeight - plyH - 10; const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5; tX = Math.max(minX, Math.min(maxX, tX)); } else if (targetEl.closest('.table') || targetEl === deliveryStation || targetEl === trashCan) { const tE = targetEl.closest('.table') || (targetEl === deliveryStation ? deliveryStation : trashCan); const tR = tE.getBoundingClientRect(); tX = tR.left - restRect.left + tR.width / 2; tY = tR.top - restRect.top + tR.height / 2; } else { console.warn("Move target unknown:", targetEl); return; } movePlayerToCoordinates(tX, tY, callback); }
      function movePlayerToCoordinates(tX, tY, callback = null) { if (isPaused || isMoving) { return; }; isMoving = true; const sX = playerPosition.x; const sY = playerPosition.y; const dist = Math.hypot(tX - sX, tY - sY); if (dist < 1) { isMoving = false; if (callback) callback(); return; } const speed = 400; const dur = (dist / speed) * 1000; let startT = null; function step(time) { if (isPaused) { cancelAnimationFrame(animationFrameId); animationFrameId = null; isMoving = false; return; } if (!isMoving) { cancelAnimationFrame(animationFrameId); animationFrameId = null; return; } if (!startT) startT = time; const elap = time - startT; const prog = Math.min(1, elap / dur); playerPosition.x = sX + (tX - sX) * prog; playerPosition.y = sY + (tY - sY) * prog; updatePlayerPosition(); if (prog < 1) { animationFrameId = requestAnimationFrame(step); } else { playerPosition.x = tX; playerPosition.y = tY; updatePlayerPosition(); isMoving = false; animationFrameId = null; if (callback) { try { callback(); } catch (e) { console.error("Move CB Error:", e); } } } } cancelAnimationFrame(animationFrameId); animationFrameId = requestAnimationFrame(step); }
      function stopPlayerMovement() { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } isMoving = false; }
      function updatePlayerPosition() { const plyW = player.offsetWidth / 2 || 25; const plyH = player.offsetHeight / 2 || 35; const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5; const minY = plyH + 5; const maxY = restaurantArea.offsetHeight - plyH - 5; playerPosition.x = Math.max(minX, Math.min(maxX, playerPosition.x)); playerPosition.y = Math.max(minY, Math.min(maxY, playerPosition.y)); player.style.transform = `translate(${playerPosition.x - plyW}px, ${playerPosition.y - plyH}px)`; deliveryRadius.style.left = `${playerPosition.x}px`; deliveryRadius.style.top = `${playerPosition.y}px`; }

    // --- Customer Spawning Logic (ADDED LOGGING) ---
      function scheduleNextCustomer() {
          if (!gameRunning || isPaused) {
              // console.log("Customer scheduling stopped (game not running or paused).");
              return; // Stop scheduling if game ended or paused
          }
          clearTimeout(customerSpawnTimeout); // Clear previous timeout

          const baseT = 6000; // Base spawn time (ms)
          const minT = 2500; // Minimum spawn time (ms)
          const reduc = (level - 1) * 350; // Reduction per level
          const delay = Math.max(minT, baseT - reduc);
          const randF = 0.8 + Math.random() * 0.4; // Random factor (80% to 120%)
          const finalDelay = delay * randF;

          // ***** DEBUG LOGGING *****
          console.log(`Scheduling next customer with delay: ${Math.round(finalDelay)}ms`);

          customerSpawnTimeout = setTimeout(spawnCustomer, finalDelay);
      }

      function spawnCustomer() {
          // ***** DEBUG LOGGING *****
          console.log("Attempting to spawn customer...");

          // Ensure game is still running and not paused before proceeding
          if (!gameRunning || isPaused) {
             console.log("Spawn aborted (game not running or paused).");
             return; // Don't spawn or reschedule if game stopped/paused during timeout
          }

          try { // Wrap in try...catch to prevent errors stopping the loop
            const currentTables = Array.from(diningArea.querySelectorAll('.table'));
            // Find tables that DON'T have an active customer (not leaving or removed)
            const availT = currentTables.filter(t => !customers.some(c => c.tableElement.id === t.id && c.state !== 'leaving' && c.state !== 'remove'));

            // ***** DEBUG LOGGING *****
            console.log(`Found ${availT.length} available tables.`);

            if (availT.length > 0) {
                const tableElement = availT[Math.floor(Math.random() * availT.length)];
                const seat = tableElement.querySelector('.seat');
                if (!seat) {
                    console.warn("Seat not found in available table:", tableElement.id);
                    scheduleNextCustomer(); // Try again soon
                    return;
                }

                const custEl = document.createElement('div');
                custEl.className = 'customer';
                custEl.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)];
                custEl.style.opacity = '0'; // Start invisible for fade-in

                const foods = Object.keys(foodItems);
                const order = foods[Math.floor(Math.random() * foods.length)];
                const foodData = foodItems[order];
                const orderIcon = getFoodIcon(order); // Get image src or emoji

                const bubble = document.createElement('div');
                bubble.className = 'speech-bubble';
                bubble.innerHTML = `
                    <div class="dish-name">${order}</div>
                    <div class="dish-price">$${foodData.price}</div>
                    <div class="dish-emoji"></div>
                `;
                const dishEmojiContainer = bubble.querySelector('.dish-emoji');
                dishEmojiContainer.appendChild(createIconElement(orderIcon, order)); // Add icon
                bubble.style.opacity = '0'; // Start invisible

                const moodIndicator = document.createElement('div');
                moodIndicator.className = 'mood-indicator';
                moodIndicator.textContent = moodEmojis.happy;

                custEl.appendChild(moodIndicator);
                custEl.appendChild(bubble);
                seat.appendChild(custEl);

                // Force reflow before adding class for transition
                requestAnimationFrame(() => {
                    custEl.style.opacity = '1';
                    bubble.style.opacity = '1';
                });

                const customerId = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`;
                const patienceTotal = Math.max(15, customerPatienceBase - (level - 1) * 2); // Decrease patience with levels

                const newCustomer = {
                    id: customerId,
                    element: custEl,
                    tableElement: tableElement, // Store the element itself
                    order: order,
                    orderPrice: foodData.price,
                    spawnTime: Date.now(),
                    patienceTotal: patienceTotal,
                    patienceCurrent: patienceTotal,
                    moodIndicator: moodIndicator,
                    state: 'waiting' // Initial state
                };

                customers.push(newCustomer);
                tableElement.classList.add('table-highlight'); // Highlight the occupied table

                // ***** DEBUG LOGGING *****
                console.log(`Spawned customer ${customerId} at table ${tableElement.id} ordering ${order}.`);

            } else {
                // ***** DEBUG LOGGING *****
                console.log("No available tables found, scheduling next attempt.");
            }

          } catch (error) {
              console.error("Error during spawnCustomer:", error);
              // Still try to reschedule even if an error occurred
          }

          // ***** IMPORTANT: Schedule the *next* attempt *****
          console.log("Scheduling next customer attempt from spawnCustomer.");
          scheduleNextCustomer();
      }

      function serveCustomer(cust) { // Same as previous version...
          if (!cust || cust.state !== 'waiting') return;

          cust.state = 'served'; // Update state

          // Find table element by ID (important if elements were regenerated)
          const tableEl = diningArea.querySelector(`#${cust.tableElement.id}`);

          const basePrice = cust.orderPrice;
          const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal;

          // Calculate tip based on patience
          let tipMultiplier = 0.05; // Base tip
          if (patienceRatio > 0.8) tipMultiplier = 0.20; // Happy
          else if (patienceRatio > 0.5) tipMultiplier = 0.15; // Neutral
          else if (patienceRatio > 0.2) tipMultiplier = 0.10; // Impatient

          const tipAmount = Math.ceil(basePrice * tipMultiplier);
          const totalEarned = basePrice + tipAmount;

          money += totalEarned;
          moneyDisplay.textContent = money;

          // Feedback indicator
          showFeedbackIndicator(tableEl || player, `+ $${basePrice}<br/>+ $${tipAmount} tip!`, "positive");

          // Update customer visuals
          cust.moodIndicator.textContent = '😋'; // Happy served face
          const bubble = cust.element.querySelector('.speech-bubble');
          if (bubble) bubble.innerHTML = "Grazie! 👌"; // Thank you message

          // Clear table state
          if (tableEl) {
              tableEl.classList.remove('table-highlight', 'table-leaving-soon');
          }

          // Clear player carrying state
          carryingFood = null;
          carryingFoodIcon = null;
          carryingDisplay.innerHTML = ''; // Clear visual
          deliveryRadius.classList.remove('active');
          if (debugMode) debugFood.textContent = "None";

          // checkLevelUp(); // Level up is handled at end of day now

          // Fade out customer after a delay
          if (cust.element) {
              cust.element.style.transition = 'opacity 1s ease 0.5s'; // Delay fade out
              cust.element.style.opacity = '0';
          }

          // Schedule removal
          setTimeout(() => {
              if (cust.element && cust.element.parentNode) {
                  cust.element.remove();
              }
              cust.state = 'remove'; // Mark for filtering
          }, 1500); // Remove after fade out + thank you visible time
      }

      function updateCustomerMood(cust) { // Same as previous version...
          if (!cust.moodIndicator) return;
          const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal;
          let mood = moodEmojis.happy;
          if (patienceRatio <= 0.2) mood = moodEmojis.angry;
          else if (patienceRatio <= 0.5) mood = moodEmojis.impatient;
          else if (patienceRatio <= 0.8) mood = moodEmojis.neutral;
          cust.moodIndicator.textContent = mood;
      }

      function checkLevelUp() { /* Removed level up logic - handled by endGame now */ }

      function clearCustomersAndIndicators() { // Same as previous version...
          customers.forEach(c => {
              if (c.element && c.element.parentNode) {
                  c.element.remove();
              }
          });
          customers = []; // Clear the array

          document.querySelectorAll('.money-indicator, .feedback-indicator').forEach(el => el.remove());

          // Clear highlights from any existing tables (even if regenerated later)
          diningArea.querySelectorAll('.table').forEach(t => {
              t.classList.remove('table-highlight', 'table-leaving-soon');
          });
      }

    // ... (Keep showFeedbackIndicator, triggerRandomEvent, handleEventChoice) ...
     function showFeedbackIndicator(tEl, txt, typ = "info", dur = 1800) { if (!tEl) return; const ind = document.createElement('div'); ind.className = 'feedback-indicator'; if (typ === "negative") ind.classList.add('negative'); else if (typ === "positive") ind.classList.add('positive'); ind.innerHTML = txt; const cont = restaurantArea; cont.appendChild(ind); const tR = tEl.getBoundingClientRect(); const cR = cont.getBoundingClientRect(); ind.style.position = 'absolute'; ind.style.left = `${tR.left - cR.left + tR.width / 2}px`; ind.style.top = `${tR.top - cR.top + tR.height / 2 - 20}px`; ind.style.animation = `float-up-fade ${dur / 1000}s forwards ease-out`; setTimeout(() => { if (ind.parentNode) ind.remove(); }, dur); }
     function triggerRandomEvent() { if (!gameRunning || isPaused || !eventModal.classList.contains('hidden') || randomEvents.length === 0) return; let eventIndex; if (randomEvents.length > 1) { do { eventIndex = Math.floor(Math.random() * randomEvents.length); } while (eventIndex === lastEventIndex); } else { eventIndex = 0; } lastEventIndex = eventIndex; const event = randomEvents[eventIndex]; console.log("Triggering random event:", event.title); pauseGame(); eventTitle.textContent = event.title; eventDescription.textContent = event.description; eventOptionsContainer.innerHTML = ''; event.options.forEach(opt => { const btn = document.createElement('button'); btn.textContent = opt.text; btn.dataset.effectMoney = opt.effect.money; btn.dataset.effectTime = opt.effect.time; btn.dataset.feedback = opt.feedback; btn.addEventListener('click', handleEventChoice); eventOptionsContainer.appendChild(btn); }); eventModal.classList.remove('hidden'); }
     function handleEventChoice(e) { const btn = e.target; const mE = parseInt(btn.dataset.effectMoney || '0'); const tE = parseInt(btn.dataset.effectTime || '0'); const fb = btn.dataset.feedback || "Okay."; money += mE; timeLeft += tE; money = Math.max(0, money); timeLeft = Math.max(0, timeLeft); moneyDisplay.textContent = money; timerDisplay.textContent = timeLeft; showFeedbackIndicator(player, fb, (mE < 0 || tE < 0) ? "negative" : "info"); eventModal.classList.add('hidden'); if (timeLeft > 0 && gameRunning) { resumeGame(); } else if (timeLeft <= 0) { endGame(); } }

    // ... (Keep populateMenuModal, getCategoryNameFromTabKey - only if menu is used) ...
    function populateMenuModal() { /* ... as before ... */ }
    function getCategoryNameFromTabKey(tK) { /* ... as before ... */ }

    // ... (Keep initializeGameVisuals - sets initial player pos, hides modals, ensures no startBtn) ...
    function initializeGameVisuals() { // Same as previous version...
        // Wait for layout calculation if needed
        if (restaurantArea.offsetWidth > 0) {
            const plyH = player.offsetHeight / 2 || 35;
            const plyW = player.offsetWidth / 2 || 25;
            // Initial position slightly above the bottom center
            playerPosition.x = restaurantArea.offsetWidth / 2;
            playerPosition.y = restaurantArea.offsetHeight - plyH - 10;
            updatePlayerPosition();
            player.style.opacity = '1'; // Make player visible
            player.style.display = 'flex'; // Ensure display is correct
        } else {
            // If layout not ready, try again shortly
            setTimeout(initializeGameVisuals, 100);
            return;
        }

        // Ensure all modals are hidden initially
        gameOverScreen.classList.add('hidden');
        menuModal.classList.add('hidden');
        eventModal.classList.add('hidden');
        gameWonModal.classList.add('hidden');

        // Set debug info visibility based on debugMode
        debugInfo.classList.toggle('hidden', !debugMode);
        debugFood.textContent = 'None'; // Reset debug display


        // Set background image
        try {
            restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`;
            if (!BACKGROUND_IMAGE_URL) {
                 console.warn("Background image URL is missing!");
            }
            // console.log("Set background image:", BACKGROUND_IMAGE_URL);
        } catch(e) {
            console.error("Error setting background image in initializeGameVisuals:", e);
        }
        console.log("Initial game visuals set.");
    }

    // --- Initialize & Auto-Start ---
    initializeGameVisuals(); // Set up initial visuals
    // Automatically start the game shortly after the page loads
    setTimeout(() => {
        if (!gameRunning) { // Check if game hasn't started already
             startGame();
        }
    }, 150); // Short delay to ensure everything is ready

}); // End DOMContentLoaded
