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
    let timeLeft = 180;
    let gameRunning = false;
    let isPaused = false;
    let carryingFood = null;
    let carryingFoodIcon = null;
    let customers = []; // Holds active customer objects
    let timerInterval = null;
    let customerSpawnTimeout = null;
    let customerPatienceBase = 35; // Base seconds before anger
    let level = 1;
    const maxLevel = 5; // Or however many levels you plan
    let playerPosition = { x: 0, y: 0 };
    let isMoving = false;
    let animationFrameId = null;
    let debugMode = false; // Toggle with D+E+B+U+G keys
    let levelThresholds = [0, 75, 180, 300, 450, 650]; // Money needed for levels 1-5+ (index 0 unused)
    const BACKGROUND_IMAGE_URL = 'assets/backdrop.png';
    let readyItemsOnPass = []; // Food items waiting at the pass
    let lastEventIndex = -1; // Prevent immediate event repetition
    let isOvenBroken = false; // State for random event
    let backgroundSoundsStarted = false; // <<< FLAG: Tracks if BGM/Ambience started for the level

    // --- Game Configuration ---
    const MAX_CUSTOMERS_PER_TABLE = 2; // <<< CONFIG: Allow two customers per table
    const CUSTOMER_SPAWN_BASE_TIME = 5500; // ms - Base time between spawns
    const CUSTOMER_SPAWN_MIN_TIME = 2000; // ms - Minimum time between spawns
    const CUSTOMER_SPAWN_LEVEL_REDUCTION = 300; // ms - How much faster per level
    const CUSTOMER_SPAWN_RANDOM_FACTOR_MIN = 0.9; // <<< CONFIG: Min multiplier for spawn time (closer to 1 = less random)
    const CUSTOMER_SPAWN_RANDOM_FACTOR_MAX = 1.1; // <<< CONFIG: Max multiplier for spawn time (closer to 1 = less random)

    const OVEN_ITEMS = [ // Foods requiring the oven (affected by event)
        'Tomato Pie Slice', 'Tre Sale Slice', 'Garlic Girl', 'Toni Roni',
        'Roasted Half-Chicken'
        // 'Crispy Baked Polenta' // Add if this also needs oven
    ];
    const foodItems = { // Master list of all food items
        // ... (Your extensive foodItems object remains unchanged here) ...
        'Bread Basket': { image: 'assets/bread basket.png', price: 5, category: 'Appetizers', prepTime: 1 },
        'Cherry Tomato & Garlic Confit': { image: 'assets/cherry confit.png', price: 12, category: 'Appetizers', prepTime: 2 },
        'Ahi Crudo': { image: 'assets/ahi crudo.png', price: 20, category: 'Appetizers', prepTime: 3 },
        'Whipped Ricotta': { image: 'assets/ricotta.png', price: 14, category: 'Appetizers', prepTime: 2 },
        'Raviolo al Uovo': { image: 'assets/raviolo.png', price: 8, category: 'Appetizers', prepTime: 2.5 },
        'Prosciutto e Melone': { image: 'assets/prosciutto e melone.png', price: 10, category: 'Appetizers', prepTime: 1.5 },
        'Crispy Gnudi': { image: 'assets/crispy gnudi.png', price: 12, category: 'Appetizers', prepTime: 3.5 },
        'Marinated Olives': { image: 'assets/olives.png', price: 6, category: 'Appetizers', prepTime: 1 },
        'House Salad': { image: 'assets/house salad.png', price: 12, category: 'Salads', prepTime: 2.5 },
        'Spicy Caesar Salad': { image: 'assets/spicy caesar.png', price: 14, category: 'Salads', prepTime: 3 },
        'Mean Green Salad': { image: 'assets/mean green salad.png', price: 12, category: 'Salads', prepTime: 2.5 },
        'Summer Tomato Panzanella': { image: 'assets/tomato panzanella.png', price: 10, category: 'Salads', prepTime: 2 },
        'Cacio e Pepe': { image: 'assets/Cacio e pepe.png', price: 20, category: 'Pasta', prepTime: 4 },
        'Seeing Red Pesto': { image: 'assets/seeing red.png', price: 24, category: 'Pasta', prepTime: 4 },
        'Short Rib Agnolotti': { image: 'assets/agnolotti.png', price: 32, category: 'Pasta', prepTime: 5 },
        'Pomodoro': { image: 'assets/pomodoro.png', price: 26, category: 'Pasta', prepTime: 3.5 },
        'Tre Sale Slice': { image: 'assets/tresale.png', price: 6, category: 'Pizza', prepTime: 3.5 },
        'Tomato Pie Slice': { image: 'assets/tomato pie.png', price: 5, category: 'Pizza', prepTime: 3 },
        'Garlic Girl': { image: 'assets/garlic girl-Photoroom.png', price: 25, category: 'Pizza', prepTime: 4.5 },
        'Toni Roni': { image: 'assets/toni roni.png', price: 26, category: 'Pizza', prepTime: 5 },
        'Sweet & Spicy Chicken Cutlets': { image: 'assets/cutlets.png', price: 28, category: 'Mains', prepTime: 5 },
        'Roasted Half-Chicken': { image: 'assets/half chicken.png', price: 34, category: 'Mains', prepTime: 7 },
        'Grilled Sockeye Salmon': { image: 'assets/salmon.png', price: 36, category: 'Mains', prepTime: 4.5 },
        'Seared Hanger Steak': { image: 'assets/hangar steak.png', price: 38, category: 'Mains', prepTime: 6 },
        'Mushroom Risotto': { image: 'assets/mushroom risotto.png', price: 12, category: 'Sides', prepTime: 5 },
        'Crispy Baked Polenta': { image: 'assets/polenta.png', price: 10, category: 'Sides', prepTime: 4 },
        'Garlic Confit Mashed Potatoes': { image: 'assets/mashed potatoes.png', price: 10, category: 'Sides', prepTime: 3 },
        'Parmigiano-Crusted Roast Fingerlings': { image: 'assets/roasted fingerling.png', price: 8, category: 'Sides', prepTime: 3 },
        'Shoestring Fries': { image: 'assets/shoestring fries.png', price: 6, category: 'Sides', prepTime: 2.5 },
        'Blackened Eggplant': { image: 'assets/eggplant.png', price: 8, category: 'Sides', prepTime: 2.5 },
        'Sauteed Rainbow Chard': { image: 'assets/rainbow chard.png', price: 6, category: 'Sides', prepTime: 2 },
        'Grilled Asparagus': { image: 'assets/grilled asparagus.png', price: 8, category: 'Sides', prepTime: 3 },
        'Water': { emoji: '💧', price: 0, category: 'Drinks', prepTime: 0.5 },
        'Wine': { emoji: '🍷', price: 12, category: 'Drinks', prepTime: 0.5 },
        'Soda': { emoji: '🥤', price: 3, category: 'Drinks', prepTime: 0.5 }
    };
    const customerEmojis = ['👩','👨','👵','👴','👱‍♀️','👱','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','🧑‍🎄','👸','👨‍🎨','👩‍🔬','💂','🕵️'];
    const moodEmojis = { happy: '😊', neutral: '😐', impatient: '😠', angry: '😡' };
    const randomEvents = [ // List of possible random events
        // ... (Your randomEvents array remains unchanged here) ...
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
    function playSound(audioElement, volume = 0.5) { // <<< VOLUME: Default notification volume is now 0.5 (50%)
        if (!audioElement) {
            // console.warn("Attempted to play null audio element");
            return;
        }
        // Ensure volume is within valid range [0.0, 1.0]
        const clampedVolume = Math.max(0, Math.min(1, volume));
        audioElement.volume = clampedVolume;
        audioElement.currentTime = 0; // Rewind before playing

        // Use a try-catch block for the play() promise
        try {
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Autoplay was prevented or another error occurred.
                    // Log it but don't stop the game.
                     if (error.name === 'NotAllowedError') {
                         // console.log(`Audio play prevented for ${audioElement.id}: User interaction needed.`);
                     } else {
                         // console.log(`Audio play failed for ${audioElement.id}:`, error);
                     }
                });
            }
        } catch (error) {
             console.error(`Error attempting to play sound ${audioElement.id}:`, error);
        }
    }

    function playLoopingSound(audioElement, volume = 0.3) {
        if (!audioElement) return;
        audioElement.volume = Math.max(0, Math.min(1, volume)); // Ensure valid range
        audioElement.loop = true; // Make sure loop is explicitly set
        // Only play if it's not already playing
        if (audioElement.paused) {
            try {
                const playPromise = audioElement.play();
                 if (playPromise !== undefined) {
                     playPromise.catch(error => {
                         if (error.name === 'NotAllowedError') {
                            // console.log(`Looping audio play prevented for ${audioElement.id}: User interaction needed.`);
                         } else {
                            // console.log(`Looping audio play failed for ${audioElement.id}:`, error);
                         }
                     });
                 }
            } catch (error) {
                console.error(`Error attempting to play looping sound ${audioElement.id}:`, error);
            }
        }
    }

    function stopLoopingSound(audioElement) {
         if (!audioElement) return;
         audioElement.pause();
         audioElement.currentTime = 0; // Rewind
    }

    function getFoodIcon(foodId) {
        const item = foodItems[foodId];
        if (!item) return '?';
        // Prefer image, fallback to emoji, then question mark
        return item.image || item.emoji || '?';
    }

    function createIconElement(iconSrcOrEmoji, altText = 'Food item') {
        if (iconSrcOrEmoji.includes('/')) { // Crude check for image path
            const img = document.createElement('img');
            img.src = iconSrcOrEmoji;
            img.alt = altText;
            return img;
        } else { // Assume emoji
            const span = document.createElement('span');
            span.textContent = iconSrcOrEmoji;
            return span;
        }
    }

    function animatePrepProgress(progressBarElement, durationMs, onComplete) {
        if (!progressBarElement) return;
        let start = null;
        function step(timestamp) {
            if (isPaused) { // Stop animation if paused
                 start = null; // Reset start time for when resumed (optional)
                 return;
            }
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

    function addFoodToPass(foodId) {
        const itemData = foodItems[foodId];
        if (!itemData) return;
        const icon = getFoodIcon(foodId);
        readyItemsOnPass.push({ foodId: foodId, icon: icon });

        const itemDiv = document.createElement('div');
        itemDiv.className = 'ready-food-item';
        itemDiv.dataset.food = foodId;
        itemDiv.appendChild(createIconElement(icon, foodId));
        itemDiv.title = foodId; // Tooltip shows food name

        // Remove placeholder label if present
        const existingLabel = deliveryStation.querySelector('.delivery-station-label');
        if (existingLabel) existingLabel.remove();

        deliveryStation.appendChild(itemDiv);
        playSound(sfxReady); // Play optional 'ready' sound if available
    }

    // --- Table Generation (Updated for Two Seats) ---
    function generateTables(container, numTables) {
        container.innerHTML = ''; // Clear existing tables
        const numCols = 3; // Adjust layout as needed
        const rowPositions = [60, 85]; // Percentage from top
        const colPositions = [18, 50, 82]; // Percentage from left

        console.log(`Generating ${numTables} tables.`);
        for (let i = 0; i < numTables; i++) {
            const table = document.createElement('div');
            table.classList.add('table');
            const tableIdNum = i + 1;
            table.id = `table-${tableIdNum}`;
            table.dataset.table = tableIdNum;

            // <<< NEW: Create two distinct seat elements per table >>>
            // You will need CSS to position these within the table div
            // e.g., .seat-1 { top: 25%; } .seat-2 { top: 75%; }
            const seat1 = document.createElement('div');
            seat1.classList.add('seat', 'seat-1'); // Add specific class
            seat1.dataset.seatId = '1'; // Identify seat position
            table.appendChild(seat1);

            const seat2 = document.createElement('div');
            seat2.classList.add('seat', 'seat-2'); // Add specific class
            seat2.dataset.seatId = '2'; // Identify seat position
            table.appendChild(seat2);
            // <<< END NEW >>>

            // --- Positioning Logic (same as before) ---
            const row = Math.floor(i / numCols);
            const col = i % numCols;
            if (row < rowPositions.length && col < colPositions.length) {
                table.style.top = `${rowPositions[row]}%`;
                table.style.left = `${colPositions[col]}%`;
                table.style.transform = 'translate(-50%, -50%)'; // Center the table div
            } else {
                // Fallback positioning if more tables than defined positions
                console.warn(`Table ${tableIdNum} exceeded defined positions.`);
                table.style.top = `${55 + (row * 15)}%`;
                table.style.left = `${15 + (col * 25)}%`;
                table.style.transform = 'translate(-50%, -50%)';
            }
            container.appendChild(table);
        }
         // Add a CSS reminder comment in the JS
         console.log("REMINDER: Ensure CSS positions '.seat-1' and '.seat-2' within '.table' elements.");
    }


    // --- Event Listeners ---
    let keysPressed = {}; // For debug mode toggle
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;
        // Simple debug toggle: D+E+B+U+G
        if (keysPressed['d'] && keysPressed['e'] && keysPressed['b'] && keysPressed['u'] && keysPressed['g']) {
            debugMode = !debugMode;
            debugInfo.classList.toggle('hidden', !debugMode);
            console.log("Debug mode:", debugMode ? "ON" : "OFF");
            keysPressed = {}; // Reset after activation
        }
        // Reset if a non-debug key is pressed in the sequence
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
            resumeGame(); // Resume if paused by menu
         });
    }

    // Food Station Interaction
    foodStations.forEach(station => {
         station.addEventListener('click', () => {
             playSound(sfxClick); // Use low-volume click

             const foodId = station.dataset.item;
             const item = foodItems[foodId];
             if (!item) return; // Should not happen if configured correctly

             // Check for broken oven event
             if (isOvenBroken && OVEN_ITEMS.includes(foodId)) {
                 showFeedbackIndicator(station, "Oven is broken!", "negative", 1500);
                 console.log(`Prevented cooking ${foodId} - oven broken.`);
                 return;
             }

             // Prevent interaction if paused, already preparing, or hands full
             if (isPaused || station.classList.contains('preparing')) return;
             if (carryingFood) {
                 showFeedbackIndicator(station, "Hands full!", "negative", 1000);
                 return;
             }

            // Start preparation
            station.classList.add('preparing');
            station.style.pointerEvents = 'none'; // Disable clicks during prep
            const progressBar = station.querySelector('.prep-progress-bar');

            if (progressBar) {
                 progressBar.style.backgroundColor = '#ffcc00'; // Yellow progress
                 progressBar.style.transform = 'scaleX(0)';
                 const prepTimeMs = item.prepTime * 1000;
                 playSound(sfxCook); // Play cooking sound (if exists)

                 animatePrepProgress(progressBar, prepTimeMs, () => {
                    // On completion:
                    progressBar.style.backgroundColor = '#4CAF50'; // Green completion flash (optional)
                    station.classList.remove('preparing');
                    addFoodToPass(foodId); // Add item to pass, plays sfxReady
                    // Reset progress bar visually after a short delay
                    setTimeout(() => {
                         progressBar.style.transform = 'scaleX(0)';
                         progressBar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Reset color
                         station.style.pointerEvents = 'auto'; // Re-enable clicks
                    }, 200);
                 });
            } else {
                // Fallback if no progress bar element found (shouldn't happen ideally)
                 console.warn("Progress bar not found for station:", foodId);
                 playSound(sfxCook);
                 setTimeout(() => {
                     station.classList.remove('preparing');
                     addFoodToPass(foodId); // Plays sfxReady internally if available
                     station.style.pointerEvents = 'auto';
                 }, (item.prepTime || 0.1) * 1000); // Use prepTime, default 0.1s
             }
        });
    });

    // Delivery Station (Pass) Interaction
    deliveryStation.addEventListener('click', (e) => {
        playSound(sfxClick); // Low-volume click
        if (isPaused) return;
        const clickedItem = e.target.closest('.ready-food-item');

        // Prevent pickup if hands are full
        if (carryingFood) {
             showFeedbackIndicator(deliveryStation, "Place carried food first!", "negative", 1000);
             return;
        }

        // If a ready food item was clicked
        if (clickedItem) {
            const foodId = clickedItem.dataset.food;
            // Find the item in our state array
            const itemIndex = readyItemsOnPass.findIndex(item => item.foodId === foodId);

            if (itemIndex !== -1) {
                const itemToTake = readyItemsOnPass.splice(itemIndex, 1)[0]; // Remove from state
                clickedItem.remove(); // Remove from DOM

                // Update player state
                carryingFood = itemToTake.foodId;
                carryingFoodIcon = itemToTake.icon;
                carryingDisplay.innerHTML = ''; // Clear previous
                carryingDisplay.appendChild(createIconElement(carryingFoodIcon, carryingFood));
                deliveryRadius.classList.add('active'); // Show delivery indicator around player
                playSound(sfxPickup); // <<< Play specific pickup sound

                // If pass is now empty, show the 'PASS' label again
                if (readyItemsOnPass.length === 0 && !deliveryStation.querySelector('.delivery-station-label')) {
                    const label = document.createElement('div');
                    label.className = 'delivery-station-label';
                    label.textContent = 'PASS';
                    deliveryStation.prepend(label); // Add it back to the start
                }

                if (debugMode) debugFood.textContent = carryingFood;
                console.log("Picked up:", carryingFood);
            } else {
                 // This indicates a mismatch between DOM and state, should not happen
                 console.warn("Clicked item not found in readyItemsOnPass state:", foodId);
            }
        } else if (readyItemsOnPass.length > 0) {
             // Clicked on the pass area but not on a specific item
             showFeedbackIndicator(deliveryStation, "Click specific item to pick up!", "info", 1200);
        }
    });

    // Trash Can Interaction
    trashCan.addEventListener('click', () => {
        if (isPaused || !carryingFood) return; // Can only trash if carrying food

        playSound(sfxTrash); // Play new trash sound
        showFeedbackIndicator(trashCan, `Trashed ${carryingFood}!`, "negative");

        // Clear player carrying state
        carryingFood = null;
        carryingFoodIcon = null;
        carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active'); // Hide radius indicator

        if (debugMode) debugFood.textContent = "None";
        console.log("Trashed carried food");
    });

    // Dining Area / Table Interaction
    diningArea.addEventListener('click', (e) => {
        playSound(sfxClick); // Low-volume click
        if (isPaused) return;

        const targetTable = e.target.closest('.table');

        if (targetTable) {
            const tableId = targetTable.id;
            // Find any waiting customer at this specific table
            const customerAtTable = customers.find(c => c.tableElement.id === tableId && c.state === 'waiting');

            if (carryingFood) {
                // If carrying food, move to the table and attempt serve on arrival
                movePlayerToElement(targetTable, () => {
                     // This callback runs *after* the player arrives at the table
                     if (!carryingFood) return; // Check if still carrying food (might have been trashed?)

                     // Re-check for customer *at this specific table* who wants the *carried food*
                     const customerToServe = customers.find(c =>
                         c.tableElement.id === tableId &&
                         c.state === 'waiting' &&
                         c.order === carryingFood
                     );

                     if (customerToServe) {
                         serveCustomer(customerToServe); // Found matching customer, serve them
                     } else {
                         // Arrived with food, but no customer wants *this* food at this table
                         const anyWaiting = customers.some(c => c.tableElement.id === tableId && c.state === 'waiting');
                         if (anyWaiting) {
                             showFeedbackIndicator(targetTable, "Wrong order for this table!", "negative");
                         } else {
                             showFeedbackIndicator(targetTable, "No waiting customer here!", "negative");
                         }
                     }
                 });
            } else {
                 // If not carrying food, just move the player to the table
                 movePlayerToElement(targetTable);
            }
        } else {
             // Clicked on empty floor space in the dining area (or restaurant background)
             if (!isMoving) { // Prevent changing destination mid-movement
                const rect = restaurantArea.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // Prevent player from moving too far down (into kitchen visually) unless going to station
                const kitchenLineY = restaurantArea.offsetHeight * 0.90; // Approx. top edge of kitchen row
                const targetY = Math.min(clickY, kitchenLineY);

                movePlayerToCoordinates(clickX, targetY);
             }
        }
    });

    // Modal Button Clicks
    nextLevelBtn.addEventListener('click', () => {
        playSound(sfxClick);
        gameOverScreen.classList.add('hidden');
        level++; // Increment level
        startGame(); // Start the next level
    });

    retryLevelBtn.addEventListener('click', () => {
        playSound(sfxClick);
        gameOverScreen.classList.add('hidden');
        startGame(); // Restart the current level
    });

    playAgainBtn.addEventListener('click', () => {
        playSound(sfxClick);
        gameWonModal.classList.add('hidden');
        level = 1; // Reset to level 1
        startGame(); // Start a new game
    });

    // --- Core Functions ---

    function startGame() {
        if (gameRunning && !isPaused) return; // Prevent multiple starts if already running
         console.log(`--- startGame: Starting Level ${level} ---`);

        // --- Reset Game State for New Level ---
        money = 0;
        timeLeft = 180; // Or adjust based on level?
        gameRunning = true;
        isPaused = false;
        carryingFood = null;
        carryingFoodIcon = null;
        customers = []; // Clear customers from previous level
        readyItemsOnPass = []; // Clear pass
        lastEventIndex = -1; // Reset event tracking
        isOvenBroken = false; // Reset oven state
        disableOvenStations(false); // Ensure ovens are usable
        backgroundSoundsStarted = false; // <<< RESET: Ensure sounds trigger on first customer *of this level*

        console.log("--- startGame: State reset ---");

        // --- Reset UI Elements ---
        moneyDisplay.textContent = money;
        levelDisplay.textContent = level;
        timerDisplay.textContent = timeLeft;
        carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active');
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>'; // Reset pass label
        debugFood.textContent = 'None'; // Reset debug display
        gameOverScreen.classList.add('hidden');
        menuModal.classList.add('hidden');
        eventModal.classList.add('hidden');
        gameWonModal.classList.add('hidden');
        console.log("--- startGame: UI reset ---");

        // --- Reset Dynamic Elements ---
        clearCustomersAndIndicators(); // Remove leftover visuals
        const numTables = Math.min(8, 2 + level); // Increase tables per level (max 8)
        generateTables(diningArea, numTables); // Create tables for the level
        foodStations.forEach(s => { // Reset food station appearance/state
            s.classList.remove('preparing');
            s.style.pointerEvents = 'auto';
            const pb = s.querySelector('.prep-progress-bar');
            if (pb) {
                pb.style.transform = 'scaleX(0)';
                pb.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }
        });
        stopPlayerMovement(); // Cancel any ongoing player movement
        console.log("--- startGame: Cleared dynamic elements & stations, Generated Tables ---");

        // --- Initialize Visuals and Timers ---
        try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; }
        catch (e) { console.error("--- startGame: ERROR setting background ---", e); }
        initializeGameVisuals(); // Position player, ensure visibility

        console.log("--- startGame: Starting timers ---");
        // DO NOT START BGM/AMBIENCE HERE ANYMORE - Moved to first customer spawn

        clearInterval(timerInterval); // Clear any previous timer
        timerInterval = setInterval(gameTick, 1000); // Start the main game loop timer

        // Safety check before scheduling customer
        if (!gameRunning || isPaused) {
            console.error(`[startGame L${level}] CRITICAL: Game state prevents scheduling! gameRunning=${gameRunning}, isPaused=${isPaused}`);
            return; // Don't schedule if state is wrong
        }

        clearTimeout(customerSpawnTimeout); // Clear previous spawn timeout
        scheduleNextCustomer(); // Start the customer spawning loop

        console.log(`--- startGame: Level ${level} Started ---`);
    }

    function endGame() {
        console.log("Ending game/day...");
        gameRunning = false;
        isPaused = true; // Effectively pause timers etc.
        clearInterval(timerInterval);
        clearTimeout(customerSpawnTimeout); // Stop new customers
        stopPlayerMovement();

        // --- Cleanup ---
        readyItemsOnPass = []; // Clear pass state
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>'; // Reset pass display
        diningArea.querySelectorAll('.table').forEach(table => table.classList.remove('table-highlight', 'table-leaving-soon'));
        deliveryRadius.classList.remove('active');

        // --- Stop Looping Sounds ---
        stopLoopingSound(bgmAudio);
        stopLoopingSound(ambienceAudio);
        backgroundSoundsStarted = false; // Reset flag for next game/level

        // --- Determine Outcome ---
        const moneyTarget = levelThresholds[level] || 99999; // Get target or large number if beyond defined levels
        const levelWon = money >= moneyTarget;
        const isFinalLevel = level >= maxLevel;

        finalScoreDisplay.textContent = money; // Show final score on game over screen

        if (levelWon && isFinalLevel) {
            // --- Game Won Condition ---
            console.log("Overall Game Won!");
            finalWinScoreDisplay.textContent = money; // Show score on win modal
            gameWonModal.classList.remove('hidden'); // Show win modal
            playSound(sfxLevelWin); // Play win sound

        } else if (levelWon) {
            // --- Level Won (Not Final) Condition ---
            console.log(`Level ${level} Complete! Target: ${moneyTarget}, Earned: ${money}`);
            levelEndTitle.textContent = `Level ${level} Complete!`;
            levelResultMessage.textContent = `You earned $${money}. Target was $${moneyTarget}. Get ready!`;
            nextLevelBtn.classList.remove('hidden'); // Show "Next Level" button
            retryLevelBtn.classList.add('hidden');
            gameOverScreen.classList.remove('hidden'); // Show level end screen
            playSound(sfxLevelWin); // Play win sound

        } else {
             // --- Level Lost Condition ---
             console.log(`Level ${level} Failed! Target: ${moneyTarget}, Earned: ${money}`);
             levelEndTitle.textContent = `End of Day - Level ${level}`;
             levelResultMessage.textContent = `You needed $${moneyTarget} but only earned $${money}. Try again?`;
             nextLevelBtn.classList.add('hidden');
             retryLevelBtn.classList.remove('hidden'); // Show "Retry Level" button
             gameOverScreen.classList.remove('hidden'); // Show level end screen
             playSound(sfxLevelLose); // Play lose sound
        }

        console.log("End of Day processed.");
    }

    function pauseGame() {
         if (!gameRunning || isPaused) return; // Can't pause if not running or already paused
         isPaused = true;
         clearInterval(timerInterval); // Stop game timer
         // Don't clear customerSpawnTimeout, it will naturally pause as scheduleNextCustomer checks isPaused
         stopPlayerMovement(); // Stop player animation
         // Pause looping sounds IF they have started
         if(backgroundSoundsStarted) {
            if(bgmAudio) bgmAudio.pause();
            if(ambienceAudio) ambienceAudio.pause();
         }
         console.log("Game Paused");
     }

     function resumeGame() {
         if (!gameRunning || !isPaused) return; // Can't resume if not running or not paused
         isPaused = false;

         if (gameRunning && timeLeft > 0) { // Only resume if game should still be active
            // Resume loops ONLY if they should have already started
            if (backgroundSoundsStarted) { // <<< Check the flag
                playLoopingSound(bgmAudio, 0.3);
                playLoopingSound(ambienceAudio, 0.4);
            }
            clearInterval(timerInterval); // Clear just in case
            timerInterval = setInterval(gameTick, 1000); // Restart game timer
            scheduleNextCustomer(); // Re-check if a customer should spawn soon
            console.log("Game Resumed");
         } else {
              console.log("Game NOT Resumed (already ended or time up)");
              if (timeLeft <= 0 && gameRunning) { // If resume was called after time ran out but before endGame finished
                  endGame(); // Ensure endgame logic runs
              }
         }
     }

     function gameTick() {
         if (!gameRunning || isPaused) { // Double check state
             clearInterval(timerInterval); // Stop ticking if paused or game over
             return;
         }
         timeLeft--;
         timerDisplay.textContent = timeLeft;
         updateCustomers(); // Update patience, mood, etc.

         if (timeLeft <= 0) {
             endGame(); // Time's up!
             return; // Stop further processing this tick
         }

         // Trigger Random Event occasionally (e.g., 2% chance per second)
         if (Math.random() < 0.02 && eventModal.classList.contains('hidden')) {
             triggerRandomEvent();
         }
     }

    function updateCustomers() {
        if (isPaused) return; // Don't update if paused
        const now = Date.now();
        const LEAVING_SOON_THRESHOLD = 5; // Seconds left when table starts flashing red

        customers.forEach((c) => {
            // Skip customers already dealt with
            if (c.state === 'leaving' || c.state === 'served' || c.state === 'remove') return;

            // Calculate patience reduction
            const elapsedSinceSpawn = (now - c.spawnTime) / 1000; // In seconds
            const oldPatienceRatio = c.patienceCurrent / c.patienceTotal; // Store old ratio
            c.patienceCurrent = Math.max(0, c.patienceTotal - elapsedSinceSpawn); // Decrease patience, clamp at 0
            const newPatienceRatio = c.patienceCurrent / c.patienceTotal; // Calculate new ratio

            // --- Sound Cue for Impatience ---
            // Play sound when crossing the impatient threshold (e.g., 50%)
            if (oldPatienceRatio > 0.5 && newPatienceRatio <= 0.5) {
                 playSound(sfxImpatient); // Play impatient sound cue
            }
            // Optionally play again when crossing into angry (uncomment if desired, might be noisy)
            // if (oldPatienceRatio > 0.2 && newPatienceRatio <= 0.2) {
            //     playSound(sfxImpatient);
            // }

            // Update visual mood based on current patience
            updateCustomerMood(c);

            // Update table visual state (highlighting)
            const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
            if (!tableEl) {
                 console.warn("Customer's table element not found:", c.tableElement.id);
                 c.state = 'remove'; // Mark for removal if table is gone
                 return;
            }

            // Add/Remove 'leaving soon' visual warning
            if (c.patienceCurrent <= LEAVING_SOON_THRESHOLD && c.patienceCurrent > 0) {
                tableEl.classList.add('table-leaving-soon'); // Requires CSS for visual effect
            } else {
                tableEl.classList.remove('table-leaving-soon');
            }

            // Check if customer runs out of patience
            if (c.patienceCurrent <= 0 && c.state === 'waiting') {
                customerLeavesAngry(c); // Trigger angry leave sequence
            }
        });

        // Clean up customers marked for removal
        customers = customers.filter(c => c.state !== 'remove');
    }

    function customerLeavesAngry(c) {
        if (!c || c.state === 'leaving' || c.state === 'remove') return; // Already leaving/removed

        playSound(sfxAngryLeft); // Play specific angry left sound
        console.log("Customer leaving angry:", c.id, "from table:", c.tableElement.id);
        c.state = 'leaving'; // Mark state to prevent further interaction

        const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
        showFeedbackIndicator(c.element || tableEl || player, "Left Angry! 😡", "negative"); // Show feedback

        // Remove table highlights if this was the *last* active customer at the table
        if (tableEl) {
            const otherCustomersAtTable = customers.some(other =>
                other.id !== c.id &&
                other.tableElement.id === c.tableElement.id &&
                (other.state === 'waiting') // Only check for other *waiting* customers
            );
            if (!otherCustomersAtTable) {
                tableEl.classList.remove('table-highlight', 'table-leaving-soon');
            }
        }


        // Fade out the customer element
        if (c.element) {
            c.element.style.transition = 'opacity 0.5s ease';
            c.element.style.opacity = '0';
        }

        // Schedule removal from game state and DOM after fade
        setTimeout(() => {
            if (c.element && c.element.parentNode) {
                c.element.remove(); // Remove element from its seat
            }
            c.state = 'remove'; // Mark for filtering out of the main customers array
        }, 500); // Match fade duration
    }


    function movePlayerToElement(targetEl, callback = null) {
        if (isPaused || !targetEl) return;

        const restRect = restaurantArea.getBoundingClientRect();
        const plyH = player.offsetHeight / 2 || 35; // Player center offset Y
        const plyW = player.offsetWidth / 2 || 25;  // Player center offset X

        let targetX, targetY;

        // Determine target coordinates based on the element type
        if (targetEl.closest('.kitchen-row')) {
            // Target is a food station or trash can in the kitchen row
            const stationInteractionPoint = targetEl.closest('.food-station, #trash-can');
            const targetRect = stationInteractionPoint.getBoundingClientRect();
            // Aim for the center of the station horizontally
            const stationCenterXViewport = targetRect.left + targetRect.width / 2;
            targetX = stationCenterXViewport - restRect.left; // Convert to relative coordinates
            // Aim slightly above the bottom edge for kitchen interactions
            targetY = restaurantArea.offsetHeight - plyH - 10; // Near bottom edge
            // Clamp X to prevent going off-screen
             const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5;
             targetX = Math.max(minX, Math.min(maxX, targetX));

        } else if (targetEl.closest('.table') || targetEl === deliveryStation) {
             // Target is a table or the delivery pass
            const interactionElement = targetEl.closest('.table') || deliveryStation; // Prioritize table if nested
            const targetRect = interactionElement.getBoundingClientRect();
            // Aim for the center of the table/pass
            targetX = targetRect.left - restRect.left + targetRect.width / 2;
            targetY = targetRect.top - restRect.top + targetRect.height / 2;

        } else {
            console.warn("Move target element type unknown:", targetEl);
            return; // Don't move if target is unrecognized
        }

        movePlayerToCoordinates(targetX, targetY, callback);
    }

    function movePlayerToCoordinates(targetX, targetY, callback = null) {
        if (isPaused || isMoving) { return; }; // Don't start new move if paused or already moving
        isMoving = true;

        const startX = playerPosition.x;
        const startY = playerPosition.y;
        const distance = Math.hypot(targetX - startX, targetY - startY); // Calculate distance

        if (distance < 1) { // Already there (or very close)
            isMoving = false;
            if (callback) {
                try { callback(); } catch (e) { console.error("Move CB Error (near target):", e); }
            }
            return;
        }

        const playerSpeed = 400; // Pixels per second
        const durationMs = (distance / playerSpeed) * 1000; // Calculate duration
        let startTime = null;

        function step(timestamp) {
            // Abort conditions
            if (isPaused) { cancelAnimationFrame(animationFrameId); animationFrameId = null; isMoving = false; return; } // Abort if paused
            if (!isMoving) { cancelAnimationFrame(animationFrameId); animationFrameId = null; return; } // Abort if externally stopped

            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(1, elapsed / durationMs); // Clamp progress at 1

            // Calculate new position using linear interpolation
            playerPosition.x = startX + (targetX - startX) * progress;
            playerPosition.y = startY + (targetY - startY) * progress;

            updatePlayerPosition(); // Update visual position and radius

            if (progress < 1) {
                // Continue animation
                animationFrameId = requestAnimationFrame(step);
            } else {
                // Animation finished
                playerPosition.x = targetX; // Ensure exact final position
                playerPosition.y = targetY;
                updatePlayerPosition();
                isMoving = false;
                animationFrameId = null;
                // Execute callback if provided
                if (callback) {
                    try { callback(); } catch (e) { console.error("Move CB Error (end):", e); }
                }
            }
        }

        // Start the animation loop
        cancelAnimationFrame(animationFrameId); // Cancel any previous frame request
        animationFrameId = requestAnimationFrame(step);
    }


    function stopPlayerMovement() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        isMoving = false; // Update state
    }

    function updatePlayerPosition() {
        // Center the player visually based on its dimensions
        const playerHalfWidth = player.offsetWidth / 2 || 25;
        const playerHalfHeight = player.offsetHeight / 2 || 35;

        // Clamp position to stay within restaurant bounds (with padding)
        const minX = playerHalfWidth + 5;
        const maxX = restaurantArea.offsetWidth - playerHalfWidth - 5;
        const minY = playerHalfHeight + 5;
        const maxY = restaurantArea.offsetHeight - playerHalfHeight - 5; // Can go near bottom edge

        playerPosition.x = Math.max(minX, Math.min(maxX, playerPosition.x));
        playerPosition.y = Math.max(minY, Math.min(maxY, playerPosition.y));

        // Apply transform to move the player element
        player.style.transform = `translate(${playerPosition.x - playerHalfWidth}px, ${playerPosition.y - playerHalfHeight}px)`;

        // Update position of the delivery radius indicator
        deliveryRadius.style.left = `${playerPosition.x}px`;
        deliveryRadius.style.top = `${playerPosition.y}px`;
    }

    // --- Customer Spawning Logic ---
    function scheduleNextCustomer() {
        if (!gameRunning || isPaused) {
            // console.log(`[scheduleNextCustomer L${level}] Scheduling stopped.`);
            clearTimeout(customerSpawnTimeout); // Ensure no timeout is pending if stopped
            return;
        }

        clearTimeout(customerSpawnTimeout); // Clear previous timeout before setting a new one

        // Calculate base delay based on level, ensuring it doesn't go below min time
        const baseDelay = Math.max(
            CUSTOMER_SPAWN_MIN_TIME,
            CUSTOMER_SPAWN_BASE_TIME - (level - 1) * CUSTOMER_SPAWN_LEVEL_REDUCTION
        );

        // Add randomness within the defined min/max factor range
        const randomMultiplier = CUSTOMER_SPAWN_RANDOM_FACTOR_MIN + Math.random() * (CUSTOMER_SPAWN_RANDOM_FACTOR_MAX - CUSTOMER_SPAWN_RANDOM_FACTOR_MIN);
        const finalDelay = baseDelay * randomMultiplier;

        // console.log(`[scheduleNextCustomer L${level}] Next spawn in ~${Math.round(finalDelay / 1000)}s`);
        customerSpawnTimeout = setTimeout(spawnCustomer, finalDelay);
    }

    function spawnCustomer() {
        if (!gameRunning || isPaused) {
           // console.log(`[spawnCustomer L${level}] Spawn aborted (game not running or paused).`);
           scheduleNextCustomer(); // Reschedule even if aborted here
           return;
        }

        try {
            const allTables = Array.from(diningArea.querySelectorAll('.table'));
            if (allTables.length === 0) {
                 console.warn("No tables found to spawn customer.");
                 scheduleNextCustomer(); // Reschedule
                 return;
            }

            // <<< NEW LOGIC: Find tables with FEWER than MAX_CUSTOMERS_PER_TABLE >>>
            const potentialTables = allTables.filter(table => {
                const customersAtThisTable = customers.filter(c =>
                    c.tableElement.id === table.id &&
                    c.state !== 'leaving' && // Don't count customers who are leaving
                    c.state !== 'remove'    // Don't count customers already removed
                ).length;
                return customersAtThisTable < MAX_CUSTOMERS_PER_TABLE;
            });

            if (potentialTables.length > 0) {
                 // --- Trigger Background Sounds on VERY FIRST customer ---
                 if (!backgroundSoundsStarted) {
                     console.log("First customer spawning, starting background sounds.");
                     playLoopingSound(bgmAudio, 0.3); // Start BGM
                     playLoopingSound(ambienceAudio, 0.4); // Start Ambience
                     backgroundSoundsStarted = true; // Set flag so it only happens once per level
                 }

                // Play the 'new order' sound effect
                playSound(sfxOrdered);

                // Choose a random table from the potential ones
                const tableElement = potentialTables[Math.floor(Math.random() * potentialTables.length)];

                // <<< NEW LOGIC: Find an empty seat (.seat-1 or .seat-2) within the chosen table >>>
                const availableSeats = Array.from(tableElement.querySelectorAll('.seat:not(:has(.customer))')); // Find seats without a customer element inside

                if (availableSeats.length === 0) {
                    // This should ideally not happen if the table filtering worked, but handle it defensively.
                    console.warn(`Table ${tableElement.id} selected but no empty seat found.`);
                    scheduleNextCustomer(); // Try again sooner
                    return;
                }
                const seatElement = availableSeats[Math.floor(Math.random() * availableSeats.length)]; // Pick a random empty seat
                // <<< END NEW SEAT LOGIC >>>

                // --- Create Customer Element and Data ---
                const custEl = document.createElement('div');
                custEl.className = 'customer';
                custEl.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)]; // Random face
                custEl.style.opacity = '0'; // Start invisible for fade-in

                // Choose random order
                const foods = Object.keys(foodItems);
                const order = foods[Math.floor(Math.random() * foods.length)];
                const foodData = foodItems[order];
                const orderIcon = getFoodIcon(order);

                // Create Speech Bubble
                const bubble = document.createElement('div');
                bubble.className = 'speech-bubble';
                bubble.innerHTML = `
                    <div class="dish-name">${order}</div>
                    <div class="dish-price">$${foodData.price}</div>
                    <div class="dish-emoji"></div>
                `;
                const dishEmojiContainer = bubble.querySelector('.dish-emoji');
                dishEmojiContainer.appendChild(createIconElement(orderIcon, order)); // Add image or emoji
                bubble.style.opacity = '0'; // Start invisible

                // Create Mood Indicator
                const moodIndicator = document.createElement('div');
                moodIndicator.className = 'mood-indicator';
                moodIndicator.textContent = moodEmojis.happy; // Start happy

                // Assemble and Append
                custEl.appendChild(moodIndicator);
                custEl.appendChild(bubble);
                seatElement.appendChild(custEl); // Append customer to the chosen EMPTY seat

                // Fade in animation (using requestAnimationFrame for smoother start)
                requestAnimationFrame(() => {
                    custEl.style.transition = 'opacity 0.3s ease-in';
                    bubble.style.transition = 'opacity 0.3s ease-in 0.1s'; // Slight delay for bubble
                    custEl.style.opacity = '1';
                    bubble.style.opacity = '1';
                });

                // --- Store Customer State ---
                const customerId = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`;
                const patienceTotal = Math.max(15, customerPatienceBase - (level - 1) * 2); // Base patience, reduces slightly per level
                const newCustomer = {
                    id: customerId,
                    element: custEl,        // Reference to the customer's DOM element
                    seatElement: seatElement, // <<< Reference to the specific seat div
                    tableElement: tableElement, // Reference to the parent table div
                    order: order,
                    orderPrice: foodData.price,
                    spawnTime: Date.now(),
                    patienceTotal: patienceTotal, // Max patience seconds
                    patienceCurrent: patienceTotal, // Current patience seconds
                    moodIndicator: moodIndicator, // Reference to mood emoji element
                    state: 'waiting' // Initial state
                };
                customers.push(newCustomer);

                // Highlight the table visually (if not already highlighted by another customer)
                tableElement.classList.add('table-highlight'); // Requires CSS for visual effect

            } else {
                 // All tables are full (reached MAX_CUSTOMERS_PER_TABLE)
                 // console.log("[spawnCustomer] No available tables/seats.");
                 // No action needed, just wait for the next schedule check
            }

        } catch (error) {
            console.error("Error during spawnCustomer:", error);
        }

        // Always schedule the next attempt, regardless of whether a customer was spawned this time
        scheduleNextCustomer();
    }


    function serveCustomer(cust) {
        if (!cust || cust.state !== 'waiting') return; // Ensure valid customer in waiting state

        playSound(sfxServe); // Play happy served sound (use low-volume version)
        cust.state = 'served'; // Update state

        const tableEl = diningArea.querySelector(`#${cust.tableElement.id}`); // Get table element

        // --- Calculate Earnings (Base + Tip based on patience) ---
        const basePrice = cust.orderPrice;
        const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal; // 0.0 to 1.0
        let tipMultiplier = 0.05; // Default small tip
        if (patienceRatio > 0.8) tipMultiplier = 0.20;      // Happy = Big tip
        else if (patienceRatio > 0.5) tipMultiplier = 0.15; // Neutral = Medium tip
        else if (patienceRatio > 0.2) tipMultiplier = 0.10; // Impatient = Small tip
                                                        // Angry (ratio <= 0.2) = Default small tip (or 0?)

        const tipAmount = Math.ceil(basePrice * tipMultiplier); // Round tip up
        const totalEarned = basePrice + tipAmount;
        money += totalEarned; // Add to score
        moneyDisplay.textContent = money; // Update UI

        // Show feedback text near the customer/table
        showFeedbackIndicator(cust.element || tableEl || player, `+ $${basePrice}<br/>+ $${tipAmount} tip!`, "positive");

        // Update customer visuals
        cust.moodIndicator.textContent = '😋'; // Happy eating face
        const bubble = cust.element.querySelector('.speech-bubble');
        if (bubble) bubble.innerHTML = "Grazie! 👌"; // Thank you message

        // Clear player's hands
        carryingFood = null;
        carryingFoodIcon = null;
        carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active');
        if (debugMode) debugFood.textContent = "None";

        // --- Table Highlighting ---
        // Remove highlight ONLY if this was the LAST waiting customer at this table
         if (tableEl) {
            const otherWaitingCustomers = customers.some(other =>
                other.id !== cust.id &&
                other.tableElement.id === cust.tableElement.id &&
                other.state === 'waiting'
            );
            if (!otherWaitingCustomers) {
                tableEl.classList.remove('table-highlight', 'table-leaving-soon');
            }
         }

        // --- Customer Departure ---
        // Fade out after a delay (giving time to see the 'Grazie')
        if (cust.element) {
            cust.element.style.transition = 'opacity 1s ease 0.5s'; // Start fade after 0.5s
            cust.element.style.opacity = '0';
        }

        // Schedule removal from game state and DOM after fade completes
        setTimeout(() => {
            if (cust.element && cust.element.parentNode) {
                cust.element.remove(); // Remove element from its seat
            }
            cust.state = 'remove'; // Mark for filtering out of the main customers array
        }, 1500); // Total time before removal (0.5s delay + 1s fade)
    }


    function updateCustomerMood(cust) {
        if (!cust.moodIndicator || cust.state !== 'waiting') return; // Only update waiting customers

        const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal; // 0.0 to 1.0
        let newMoodEmoji = moodEmojis.happy; // Default happy

        // Determine mood based on patience ratio thresholds
        if (patienceRatio <= 0.2) newMoodEmoji = moodEmojis.angry;
        else if (patienceRatio <= 0.5) newMoodEmoji = moodEmojis.impatient;
        else if (patienceRatio <= 0.8) newMoodEmoji = moodEmojis.neutral;

        // Update the emoji text content if it changed
        if (cust.moodIndicator.textContent !== newMoodEmoji) {
             cust.moodIndicator.textContent = newMoodEmoji;
             // Note: Impatient sound is now played in updateCustomers based on crossing the threshold
        }
    }

    function clearCustomersAndIndicators() {
        // Remove customer elements from DOM
        customers.forEach(c => {
            if (c.element && c.element.parentNode) {
                c.element.remove();
            }
        });
        customers = []; // Clear the state array

        // Remove floating indicators
        document.querySelectorAll('.money-indicator, .feedback-indicator').forEach(el => el.remove());

        // Reset table visual state
        diningArea.querySelectorAll('.table').forEach(t => {
            t.classList.remove('table-highlight', 'table-leaving-soon');
            // Ensure seats are empty visually (might be redundant if customers removed correctly)
            t.querySelectorAll('.seat').forEach(s => s.innerHTML = '');
        });
    }


    function showFeedbackIndicator(targetElement, text, type = "info", duration = 1800) {
        // TargetElement could be a table, customer, player, or station
        if (!targetElement || !restaurantArea.contains(targetElement)) {
             // console.warn("Feedback target invalid or not in restaurant area.");
             targetElement = player; // Default to player if target is bad
        }

        const indicator = document.createElement('div');
        indicator.className = 'feedback-indicator'; // Base class

        // Add type class for styling (positive, negative, info)
        if (type === "negative") indicator.classList.add('negative');
        else if (type === "positive") indicator.classList.add('positive');
        // 'info' type uses the base style

        indicator.innerHTML = text; // Set text content (allows HTML like <br>)

        // Append to the main restaurant area for absolute positioning
        restaurantArea.appendChild(indicator);

        // --- Calculate Position ---
        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = restaurantArea.getBoundingClientRect();

        // Position near the center-top of the target element, relative to the restaurant area
        // Adjust vertical offset (-30) to appear slightly above the element
        const indicatorX = targetRect.left - containerRect.left + targetRect.width / 2;
        const indicatorY = targetRect.top - containerRect.top - 30;

        indicator.style.position = 'absolute';
        indicator.style.left = `${indicatorX}px`; // Centered horizontally on target
        indicator.style.top = `${indicatorY}px`; // Positioned above target
        indicator.style.transform = 'translateX(-50%)'; // Fine-tune horizontal centering

        // Apply animation (requires CSS @keyframes definition)
        indicator.style.animation = `float-up-fade ${duration / 1000}s forwards ease-out`;

        // Remove the element after the animation completes
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, duration);
    }


    // --- Event Logic ---
    function triggerRandomEvent() {
        // Conditions to prevent triggering an event
        if (!gameRunning || isPaused || !eventModal.classList.contains('hidden') || randomEvents.length === 0) {
            return;
        }

        // Choose a random event, avoiding immediate repetition
        let eventIndex;
        if (randomEvents.length > 1) {
            do {
                eventIndex = Math.floor(Math.random() * randomEvents.length);
            } while (eventIndex === lastEventIndex); // Keep trying if it's the same as the last one
        } else {
            eventIndex = 0; // Only one event possible
        }
        lastEventIndex = eventIndex; // Remember the chosen event index

        const event = randomEvents[eventIndex];
        console.log("Triggering random event:", event.title);

        // Pause the game immediately when event triggers
        pauseGame();

        // Populate and show the event modal
        eventTitle.textContent = event.title;
        eventDescription.textContent = event.description;
        eventOptionsContainer.innerHTML = ''; // Clear previous options

        event.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt.text;
            // Store effect data directly on the button using dataset attributes
            btn.dataset.effectMoney = opt.effect.money || '0';
            btn.dataset.effectTime = opt.effect.time || '0';
            btn.dataset.feedback = opt.feedback || "Okay.";
            // Store potential state changes (like breaking the oven)
            if (event.title === "Kitchen Emergency!" && opt.text.includes("Work Around It")) {
                btn.dataset.stateChange = 'ovenBroken';
            }
            btn.addEventListener('click', handleEventChoice); // Add listener for this button
            eventOptionsContainer.appendChild(btn);
        });

        eventModal.classList.remove('hidden'); // Make the modal visible
    }


    function handleEventChoice(e) {
        playSound(sfxClick); // Play generic click for button press
        const btn = e.target;

        // Retrieve effect data from dataset
        const moneyEffect = parseInt(btn.dataset.effectMoney || '0');
        const timeEffect = parseInt(btn.dataset.effectTime || '0');
        const feedbackText = btn.dataset.feedback || "Okay.";
        const stateChange = btn.dataset.stateChange; // e.g., 'ovenBroken'

        // Apply effects
        money += moneyEffect;
        timeLeft += timeEffect;
        money = Math.max(0, money); // Prevent negative money
        timeLeft = Math.max(0, timeLeft); // Prevent negative time

        // Update UI displays
        moneyDisplay.textContent = money;
        timerDisplay.textContent = timeLeft;

        // Show feedback message near the player
        showFeedbackIndicator(player, feedbackText, (moneyEffect < 0 || timeEffect < 0) ? "negative" : "info");

        // Apply specific state changes if any
        if (stateChange === 'ovenBroken') {
            isOvenBroken = true;
            console.log("EVENT: Oven is now broken!");
            disableOvenStations(true); // Visually disable oven stations
        }

        // Hide the modal
        eventModal.classList.add('hidden');

        // Decide whether to resume or end the game
        if (timeLeft > 0 && gameRunning) {
            // If time remains and game was running, resume it
            resumeGame();
        } else if (timeLeft <= 0) {
            // If time ran out due to the event, end the game
            console.log("Event caused time to run out.");
            endGame(); // Ensure endgame logic runs immediately
        }
        // If game wasn't running (shouldn't happen if pauseGame worked), do nothing more.
    }


    function disableOvenStations(disable) {
        console.log(`Setting oven stations disabled state: ${disable}`);
        foodStations.forEach(station => {
            const foodId = station.dataset.item;
            // Check if the station's item is in the OVEN_ITEMS list
            if (OVEN_ITEMS.includes(foodId)) {
                // Apply visual styles to indicate disabled state
                station.style.opacity = disable ? '0.5' : '1';
                station.style.cursor = disable ? 'not-allowed' : 'pointer';
                // Add/Remove tooltip explanation
                if (disable) {
                    station.title = "Oven is Broken!";
                } else {
                    station.title = ""; // Remove tooltip if re-enabled
                }
                // Note: The actual prevention happens in the station's click listener
            }
        });
    }


    // --- Initialization ---
    function initializeGameVisuals() {
        // Ensure the restaurant area has dimensions before positioning
        if (restaurantArea.offsetWidth > 0) {
            const playerHalfHeight = player.offsetHeight / 2 || 35;
            const playerHalfWidth = player.offsetWidth / 2 || 25;
            // Initial position: Bottom center
            playerPosition.x = restaurantArea.offsetWidth / 2;
            playerPosition.y = restaurantArea.offsetHeight - playerHalfHeight - 10; // Near bottom edge
            updatePlayerPosition(); // Apply position and clamp
            player.style.opacity = '1'; // Make player visible
            player.style.display = 'flex'; // Ensure display is not none
        } else {
            // If dimensions aren't ready, wait and retry
            // console.log("Restaurant area dimensions not ready, retrying visual init...");
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
             restaurantArea.style.backgroundSize = 'cover'; // Ensure it covers the area
             restaurantArea.style.backgroundPosition = 'center';
        } catch(e) { console.error("Error setting background in init:", e)}

        console.log("Initial game visuals set.");
    }

    // --- Game Start Trigger ---
    initializeGameVisuals(); // Set up initial look
    // Short delay before starting the game logic allows visuals to potentially render first
    // Note: BGM/Ambience now starts with the first customer, not here.
    setTimeout(() => {
        if (!gameRunning) { // Only start if not already running (e.g., from a rapid refresh)
            startGame(); // Begin Level 1
        }
    }, 150); // 150ms delay

}); // End DOMContentLoaded
