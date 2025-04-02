// <<< START OF UPDATED full.js (Multi-Item Orders) >>>
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
    // const sfxPickup = document.getElementById('sfx-pickup'); // Removed pickup sound earlier
    const sfxClick = document.getElementById('sfx-click');
    const sfxCook = document.getElementById('sfx-cook');
    const sfxReady = document.getElementById('sfx-ready'); // The "ding" sound
    const sfxLevelWin = document.getElementById('sfx-level-win');
    const sfxLevelLose = document.getElementById('sfx-level-lose');

    // --- Game State Variables ---
    let money = 0;
    let timeLeft = 180; // Will be set to 120 in startGame
    let gameRunning = false;
    let isPaused = false;
    let carryingFood = null;
    let carryingFoodIcon = null;
    let customers = []; // Array of customer objects
    let timerInterval = null;
    let customerSpawnTimeout = null;
    let customerPatienceBase = 45; // Slightly increased base patience for multi-orders
    let level = 1;
    const maxLevel = 5;
    let playerPosition = { x: 0, y: 0 };
    let isMoving = false;
    let animationFrameId = null;
    let debugMode = false;
    let levelThresholds = [0, 200, 250, 300, 450, 650];
    const BACKGROUND_IMAGE_URL = 'assets/backdrop.png';
    let readyItemsOnPass = [];
    let lastEventIndex = -1;
    let isOvenBroken = false;
    let backgroundSoundsStarted = false;
    let customersSpawnedThisLevel = 0;
    let temporarilyUnavailableItems = []; // For events like ingredient shortage

    // --- Game Configuration ---
    const CUSTOMER_SPAWN_BASE_TIME = 6000; // Slightly increased base time
    const CUSTOMER_SPAWN_MIN_TIME = 2500; // Slightly increased min time
    const CUSTOMER_SPAWN_LEVEL_REDUCTION = 350;
    const CUSTOMER_SPAWN_RANDOM_FACTOR_MIN = 0.9;
    const CUSTOMER_SPAWN_RANDOM_FACTOR_MAX = 1.1;
    const RANDOM_EVENT_MIN_CUSTOMERS = 3;
    const MULTI_ORDER_CHANCE = 0.60; // 60% chance for multi-item orders
    const ORDER_SEQUENCE_CATEGORIES = ['Drinks', 'Appetizers', 'Mains', 'Sides']; // Defines the order items are requested

    const OVEN_ITEMS = [
        'Tomato Pie Slice', 'Tre Sale Slice', 'Garlic Girl', 'Toni Roni',
        'Roasted Half-Chicken'
    ];
    // --- Food Items Definition (Ensure Categories are Correct) ---
    const foodItems = {
        // Drinks
        'Water': { emoji: '💧', price: 0, category: 'Drinks', prepTime: 0.5 },
        'Wine': { emoji: '🍷', price: 12, category: 'Drinks', prepTime: 0.5 },
        'Soda': { emoji: '🥤', price: 3, category: 'Drinks', prepTime: 0.5 },
        // Appetizers
        'Bread Basket': { image: 'assets/bread basket.png', price: 5, category: 'Appetizers', prepTime: 1 },
        'Cherry Tomato & Garlic Confit': { image: 'assets/cherry confit.png', price: 12, category: 'Appetizers', prepTime: 2 },
        'Ahi Crudo': { image: 'assets/ahi crudo.png', price: 20, category: 'Appetizers', prepTime: 3 },
        'Whipped Ricotta': { image: 'assets/ricotta.png', price: 14, category: 'Appetizers', prepTime: 2 },
        'Raviolo al Uovo': { image: 'assets/raviolo.png', price: 8, category: 'Appetizers', prepTime: 2.5 },
        'Prosciutto e Melone': { image: 'assets/prosciutto e melone.png', price: 10, category: 'Appetizers', prepTime: 1.5 },
        'Crispy Gnudi': { image: 'assets/crispy gnudi.png', price: 12, category: 'Appetizers', prepTime: 3.5 },
        'Marinated Olives': { image: 'assets/olives.png', price: 6, category: 'Appetizers', prepTime: 1 },
        'House Salad': { image: 'assets/house salad.png', price: 12, category: 'Appetizers', prepTime: 2.5 }, // Moved from Salads for simpler sequence
        'Spicy Caesar Salad': { image: 'assets/spicy caesar.png', price: 14, category: 'Appetizers', prepTime: 3 }, // Moved
        'Mean Green Salad': { image: 'assets/mean green salad.png', price: 12, category: 'Appetizers', prepTime: 2.5 }, // Moved
        'Summer Tomato Panzanella': { image: 'assets/tomato panzanella.png', price: 10, category: 'Appetizers', prepTime: 2 }, // Moved
        // Mains (Includes Pasta and Pizza now)
        'Cacio e Pepe': { image: 'assets/Cacio e pepe.png', price: 20, category: 'Mains', prepTime: 4 },
        'Seeing Red Pesto': { image: 'assets/seeing red.png', price: 24, category: 'Mains', prepTime: 4 },
        'Short Rib Agnolotti': { image: 'assets/agnolotti.png', price: 32, category: 'Mains', prepTime: 5 },
        'Pomodoro': { image: 'assets/pomodoro.png', price: 26, category: 'Mains', prepTime: 3.5 },
        'Tre Sale Slice': { image: 'assets/tresale.png', price: 6, category: 'Mains', prepTime: 3.5 },
        'Tomato Pie Slice': { image: 'assets/tomato pie.png', price: 5, category: 'Mains', prepTime: 3 },
        'Garlic Girl': { image: 'assets/garlic girl-Photoroom.png', price: 25, category: 'Mains', prepTime: 4.5 },
        'Toni Roni': { image: 'assets/toni roni.png', price: 26, category: 'Mains', prepTime: 5 },
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
    };
    const customerEmojis = ['👩','👨','👵','👴','👱‍♀️','👱','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','🧑‍🎄','👸','👨‍🎨','👩‍🔬','💂','🕵️'];
    const moodEmojis = { happy: '😊', neutral: '😐', impatient: '😠', angry: '😡' };
    const randomEvents = [ // Added an option to make items unavailable
         { title: "Customer Complaint!", description: "A customer says their Cacio e Pepe is too peppery!", options: [ { text: "Apologize & Offer free drink (-$3)", effect: { money: -3, time: 0 }, feedback: "Comped a soda." }, { text: "Remake the dish (Lose time)", effect: { money: 0, time: -10 }, feedback: "Remade the pasta (-10s)." }, { text: "Argue politely (Risk anger)", effect: { money: 0, time: 0 }, feedback: "Defended the chef!" } ] },
         { title: "Kitchen Emergency!", description: "The oven suddenly stopped working!", options: [ { text: "Quick Fix Attempt (-$20, -15s)", effect: { money: -20, time: -15 }, feedback: "Paid for quick fix (-$20, -15s)." }, { text: "Work Around It (No Pizza/Roast)", effect: { money: 0, time: 0, stateChange: 'ovenBroken'}, feedback: "No oven dishes for now..." }, { text: "Ignore It (Riskier)", effect: { money: 0, time: 0 }, feedback: "Ignored the oven..." } ] },
         { title: "Ingredient Shortage", description: "Oh no! We're running low on fresh basil for Pomodoro!", options: [ { text: "Buy Emergency Basil (-$15)", effect: { money: -15, time: 0 }, feedback: "Bought expensive basil (-$15)." }, { text: "Improvise (Use dried herbs)", effect: { money: 0, time: 0 }, feedback: "Substituted herbs..." }, { text: "Stop serving Pomodoro", effect: { money: 0, time: 0, stateChange: 'itemUnavailable', item: 'Pomodoro' }, feedback: "Took Pomodoro off menu." } ] }, // Make item unavailable
         { title: "VIP Guest", description: "A famous food critic just sat down!", options: [ { text: "Offer Free Appetizer (-$10)", effect: { money: -10, time: 0 }, feedback: "Comped critic appetizer (-$10)." }, { text: "Chef's Special Attention (-10s)", effect: { money: 0, time: -10 }, feedback: "Chef gave extra attention (-10s)." }, { text: "Treat Like Normal", effect: { money: 0, time: 0 }, feedback: "Treated critic normally." } ] },
         { title: "Sudden Rush!", description: "A big group just walked in! Faster service needed!", options: [ { text: "Work Faster! (Bonus Time)", effect: { money: 0, time: +15 }, feedback: "Rush handled! (+15s)" }, { text: "Stay Calm (Risk Anger)", effect: { money: 0, time: 0 }, feedback: "Kept cool under pressure." } ] },
         { title: "Generous Tipper", description: "A customer was so impressed they left a huge tip!", options: [ { text: "Awesome! (+$25)", effect: { money: +25, time: 0 }, feedback: "Wow! +$25 Tip!" } ] },
         { title: "Spill in the Kitchen!", description: "Someone dropped a tray of sauce!", options: [ { text: "Clean it Up (-10s)", effect: { money: 0, time: -10 }, feedback: "Cleaned up the mess (-10s)." }, { text: "Work Around It (Carefully!)", effect: { money: 0, time: 0 }, feedback: "Carefully avoiding the spill..." } ] },
         { title: "Health Inspector!", description: "A surprise visit! Everything needs to be perfect.", options: [ { text: "Brief Pause & Tidy (-5s)", effect: { money: 0, time: -5 }, feedback: "Quick tidy for inspector (-5s)." }, { text: "Bribe? (-$50, Risky)", effect: { money: -50, time: 0}, feedback: "Attempted a 'tip' (-$50)..."} ]}
    ];

    // --- Helper Functions ---
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
        if (!iconSrcOrEmoji) return document.createElement('span'); // Handle potential undefined icon
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

    // --- Get Available Items By Category (respecting oven/shortages) ---
    function getAvailableItemsByCategory(category) {
        return Object.entries(foodItems)
            .filter(([id, item]) =>
                item.category === category && // Match category
                !(isOvenBroken && OVEN_ITEMS.includes(id)) && // Exclude broken oven items
                !temporarilyUnavailableItems.includes(id) // Exclude unavailable items
            )
            .map(([id, item]) => id); // Return only the IDs
    }


    // --- Generate Order Sequence ---
    function generateOrderSequence() {
        const sequence = [];
        let currentCategories = [...ORDER_SEQUENCE_CATEGORIES]; // Copy the sequence order

        // Always add a Drink if available? (Optional, makes sense)
        const availableDrinks = getAvailableItemsByCategory('Drinks');
        if (availableDrinks.length > 0) {
            sequence.push(availableDrinks[Math.floor(Math.random() * availableDrinks.length)]);
        }
        currentCategories.shift(); // Remove 'Drinks' from further random selection

        // Add Appetizer (optional, maybe 70% chance?)
        if (Math.random() < 0.7) {
            const availableApps = getAvailableItemsByCategory('Appetizers');
            if (availableApps.length > 0) {
                sequence.push(availableApps[Math.floor(Math.random() * availableApps.length)]);
            }
        }
        currentCategories.shift(); // Remove 'Appetizers'

        // Always add a Main if available
        const availableMains = getAvailableItemsByCategory('Mains');
        if (availableMains.length > 0) {
             sequence.push(availableMains[Math.floor(Math.random() * availableMains.length)]);
        }
        currentCategories.shift(); // Remove 'Mains'

        // Add Side (optional, maybe 50% chance?)
        if (Math.random() < 0.5) {
             const availableSides = getAvailableItemsByCategory('Sides');
             if (availableSides.length > 0) {
                 sequence.push(availableSides[Math.floor(Math.random() * availableSides.length)]);
             }
        }
        currentCategories.shift(); // Remove 'Sides'

        // If sequence is empty (e.g., everything unavailable), add a default simple item
        if (sequence.length === 0) {
            const allAvailable = Object.entries(foodItems)
                .filter(([id, item]) =>
                    !(isOvenBroken && OVEN_ITEMS.includes(id)) &&
                    !temporarilyUnavailableItems.includes(id)
                ).map(([id, item]) => id);
            if (allAvailable.length > 0) {
                sequence.push(allAvailable[Math.floor(Math.random() * allAvailable.length)]);
            } else {
                sequence.push('Water'); // Absolute fallback
            }
        }

        console.log("Generated sequence:", sequence);
        return sequence;
    }


    // --- Update Customer Speech Bubble ---
    function updateCustomerBubble(cust) {
        if (!cust || !cust.element || cust.state === 'leaving' || cust.state === 'remove') return;

        const bubble = cust.element.querySelector('.speech-bubble');
        if (!bubble) {
             console.warn("Could not find speech bubble for customer:", cust.id);
             return;
         }

        const currentOrder = cust.orderSequence[cust.currentOrderIndex];
        if (!currentOrder) { // Should not happen if sequence generation is robust
            bubble.innerHTML = "Hmm...";
            console.error("Customer has no current order in sequence:", cust.id, cust.orderSequence, cust.currentOrderIndex);
            return;
        }

        const itemData = foodItems[currentOrder];
        if (!itemData) {
            bubble.innerHTML = "???";
             console.error("Current order item not found in foodItems:", currentOrder);
             return;
        }

        const orderIcon = getFoodIcon(currentOrder);
        bubble.innerHTML = `<div class="dish-name">${currentOrder}</div><div class="dish-price">$${itemData.price}</div><div class="dish-emoji"></div>`;
        const dishEmojiContainer = bubble.querySelector('.dish-emoji');
        dishEmojiContainer.appendChild(createIconElement(orderIcon, currentOrder));

        // Optionally add indicator for multi-item order progress
        if (cust.orderSequence.length > 1) {
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'order-progress';
            progressIndicator.textContent = `(${cust.currentOrderIndex + 1}/${cust.orderSequence.length})`;
            bubble.appendChild(progressIndicator);
        }

        // Ensure bubble is visible (it might be faded out if they were leaving)
         bubble.style.opacity = '1';
         bubble.style.transition = 'opacity 0.2s ease-in'; // Optional quick fade-in if needed
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
                // --- Animation Completion Logic ---
                if (gameRunning && !isPaused) { // Ensure game is active
                    if (animState.onComplete) {
                        try { animState.onComplete(); } // Execute the callback
                        catch(e) { console.error("Error in animation onComplete callback:", e); }
                    }
                } else {
                    // console.log("Animation finished but game not running/paused. Callback not executed.");
                }
                delete progressBarElement._animation; // Clean up animation state
                // --- End Completion Logic ---
            }
        }
        // Cancel any existing animation frame for this element before starting new one
        if (progressBarElement._animation && progressBarElement._animation.reqId) {
            cancelAnimationFrame(progressBarElement._animation.reqId);
        }
        progressBarElement._animation.reqId = requestAnimationFrame(step); // Start the animation loop
    }

    function addFoodToPass(foodId) {
        const itemData = foodItems[foodId];
        if (!itemData) return;
        const icon = getFoodIcon(foodId);
        readyItemsOnPass.push({ foodId: foodId, icon: icon }); // Add to internal state
        // Create visual element
        const itemDiv = document.createElement('div');
        itemDiv.className = 'ready-food-item';
        itemDiv.dataset.food = foodId;
        itemDiv.appendChild(createIconElement(icon, foodId));
        itemDiv.title = foodId; // Tooltip
        // Add to the pass DOM element
        const existingLabel = deliveryStation.querySelector('.delivery-station-label');
        if (existingLabel) existingLabel.remove(); // Remove "PASS" label if present
        deliveryStation.appendChild(itemDiv);

        // Play the "ready" sound when food appears on the pass
        playSound(sfxReady);
    }

    function generateTables(container, numTables) {
        container.innerHTML = ''; // Clear existing tables
        const numCols = 3;
        const numRows = Math.ceil(numTables / numCols);
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        // Basic check for dimensions
        if (containerWidth === 0 || containerHeight === 0) { console.warn("Dining area has no dimensions yet."); /* return or wait? */ }
        // Define padding/margins for the grid within the dining area
        const gridPaddingTopFraction = 0.50; // More space at the top
        const gridPaddingBottomFraction = 0.15; // Less space at bottom
        const gridPaddingHorizontalFraction = 0.15;
        // Calculate usable dimensions for the grid
        const usableHeight = containerHeight * (1 - gridPaddingTopFraction - gridPaddingBottomFraction);
        const usableWidth = containerWidth * (1 - gridPaddingHorizontalFraction * 2);
        // Calculate cell size
        const cellHeight = numRows > 0 ? usableHeight / numRows : usableHeight;
        const cellWidth = numCols > 0 ? usableWidth / numCols : usableWidth;
        // Calculate grid offsets
        const gridTopOffset = containerHeight * gridPaddingTopFraction;
        const gridLeftOffset = containerWidth * gridPaddingHorizontalFraction;
        // console.log(`Generating ${numTables} tables in a ${numRows}x${numCols} grid.`); // Optional debug
        for (let i = 0; i < numTables; i++) {
            const table = document.createElement('div');
            table.classList.add('table');
            const tableIdNum = i + 1;
            table.id = `table-${tableIdNum}`;
            table.dataset.table = tableIdNum;
            const seat = document.createElement('div');
            seat.classList.add('seat');
            table.appendChild(seat);
            // Calculate row and column for grid positioning
            const row = Math.floor(i / numCols);
            const col = i % numCols;
            // Calculate center coordinates for the cell
            const cellCenterX = gridLeftOffset + (col * cellWidth) + (cellWidth / 2);
            const cellCenterY = gridTopOffset + (row * cellHeight) + (cellHeight / 2);
            // Position the table absolutely, centered in its cell
            table.style.position = 'absolute';
            table.style.top = `${cellCenterY}px`;
            table.style.left = `${cellCenterX}px`;
            table.style.transform = 'translate(-50%, -50%)';
            container.appendChild(table);
        }
    }

    // --- Event Listeners ---
    let keysPressed = {};
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;
        // Debug toggle combo
        if (keysPressed['d'] && keysPressed['e'] && keysPressed['b'] && keysPressed['u'] && keysPressed['g']) {
            debugMode = !debugMode;
            debugInfo.classList.toggle('hidden', !debugMode);
            console.log("Debug mode:", debugMode ? "ON" : "OFF");
            keysPressed = {}; // Reset combo keys
        }
         // Reset if non-combo key is pressed after starting combo
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
            resumeGame(); // Resume game after closing menu
         });
    }

    foodStations.forEach(station => {
         station.addEventListener('click', () => {
             playSound(sfxClick); // Play general click sound
             const foodId = station.dataset.item;
             const item = foodItems[foodId];
             if (!item) { console.error("Clicked station has invalid item:", foodId); return; }

             // Check conditions preventing cooking
             if (isOvenBroken && OVEN_ITEMS.includes(foodId)) {
                 showFeedbackIndicator(station, "Oven is broken!", "negative", 1500);
                 return;
             }
             if (temporarilyUnavailableItems.includes(foodId)) {
                 showFeedbackIndicator(station, `${foodId} is unavailable!`, "negative", 1500);
                 return;
             }
             if (isPaused) return; // Don't cook if paused
             if (station.classList.contains('preparing')) return; // Don't restart if already cooking
             if (carryingFood) { // Prevent cooking if hands are full
                 showFeedbackIndicator(station, "Hands full!", "negative", 1000);
                 return;
             }

             // Start Cooking
             station.classList.add('preparing');
             station.style.pointerEvents = 'none'; // Prevent clicking again while preparing
             playSound(sfxCook); // Play cooking sound

             const progressBar = station.querySelector('.prep-progress-bar');
             const prepTimeMs = item.prepTime * 1000;

             if (progressBar) {
                 // Use animation for stations with progress bars
                 progressBar.style.backgroundColor = '#ffcc00'; // Yellow while cooking
                 progressBar.style.transform = 'scaleX(0)'; // Reset bar
                 animatePrepProgress(progressBar, prepTimeMs, () => {
                    // --- On Cooking Complete (Animation) ---
                    progressBar.style.backgroundColor = '#4CAF50'; // Green when done
                    station.classList.remove('preparing');
                    addFoodToPass(foodId); // Add to pass (plays ready sound)
                    // Reset progress bar visually after a short delay
                    setTimeout(() => {
                         progressBar.style.transform = 'scaleX(0)';
                         progressBar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Reset color
                         station.style.pointerEvents = 'auto'; // Re-enable clicks
                    }, 200);
                    // --- End On Cooking Complete ---
                 });
             } else {
                 // Use timeout for stations without progress bars (e.g., drinks)
                 console.warn("Progress bar not found for station:", foodId);
                 setTimeout(() => {
                     // Check game state again before completing, in case it ended/paused
                     if (!gameRunning || isPaused) {
                         console.log(`Timeout finished for ${foodId}, but game stopped/paused. Aborting completion.`);
                         station.classList.remove('preparing');
                         station.style.pointerEvents = 'auto';
                         return;
                     }
                     // --- On Cooking Complete (Timeout) ---
                     station.classList.remove('preparing');
                     addFoodToPass(foodId); // Add to pass (plays ready sound)
                     station.style.pointerEvents = 'auto'; // Re-enable clicks
                     // --- End On Cooking Complete ---
                 }, prepTimeMs);
             }
         });
    });

    deliveryStation.addEventListener('click', (e) => {
        playSound(sfxClick); // Play general click sound
        if (isPaused) return;
        const clickedItem = e.target.closest('.ready-food-item');

        if (carryingFood) { // Prevent pickup if hands are full
             showFeedbackIndicator(deliveryStation, "Place carried food first!", "negative", 1000);
             return;
        }

        if (clickedItem) { // Check if a specific item on the pass was clicked
            const foodId = clickedItem.dataset.food;
            // Find the item in the internal state array
            const itemIndex = readyItemsOnPass.findIndex(item => item.foodId === foodId);

            if (itemIndex !== -1) { // Found the item
                const itemToTake = readyItemsOnPass.splice(itemIndex, 1)[0]; // Remove from state
                clickedItem.remove(); // Remove from DOM

                // Update player state
                carryingFood = itemToTake.foodId;
                carryingFoodIcon = itemToTake.icon;
                carryingDisplay.innerHTML = ''; // Clear previous item
                carryingDisplay.appendChild(createIconElement(carryingFoodIcon, carryingFood));
                deliveryRadius.classList.add('active'); // Show delivery radius

                // REMOVED: playSound(sfxPickup); // No pickup sound

                // If pass is now empty, add back the "PASS" label
                if (readyItemsOnPass.length === 0 && !deliveryStation.querySelector('.delivery-station-label')) {
                    const label = document.createElement('div');
                    label.className = 'delivery-station-label';
                    label.textContent = 'PASS';
                    deliveryStation.prepend(label);
                }
                if (debugMode) debugFood.textContent = carryingFood;
                // console.log("Picked up:", carryingFood); // Optional debug
            } else {
                 // This might happen if the state and DOM are out of sync briefly
                 console.warn("Clicked item not found in readyItemsOnPass state:", foodId);
                 // Maybe try removing the clicked DOM element anyway?
                 // clickedItem.remove();
            }
        } else if (readyItemsOnPass.length > 0) {
             // Clicked the pass area but not a specific item when items are present
             showFeedbackIndicator(deliveryStation, "Click specific item to pick up!", "info", 1200);
        }
        // If clicked pass when empty, nothing happens (no feedback needed).
    });

    trashCan.addEventListener('click', () => {
        if (isPaused || !carryingFood) return; // Can only trash if holding something and not paused
        playSound(sfxTrash);
        showFeedbackIndicator(trashCan, `Trashed ${carryingFood}!`, "negative");
        // Clear player state
        carryingFood = null;
        carryingFoodIcon = null;
        carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active'); // Hide radius
        if (debugMode) debugFood.textContent = "None";
        console.log("Trashed carried food");
    });

    diningArea.addEventListener('click', (e) => {
        playSound(sfxClick); // Play general click sound
        if (isPaused) return;
        const targetTable = e.target.closest('.table');

        if (targetTable) { // Clicked on a table
            const tableId = targetTable.id;
            if (carryingFood) {
                // Move to the table, then attempt to serve after reaching it
                 movePlayerToElement(targetTable, () => {
                     if (!carryingFood) return; // Check if still holding food upon arrival

                     // Find customer at this table who is waiting
                     const customerToServe = customers.find(c =>
                         c.tableElement.id === tableId &&
                         c.state === 'waiting' // Only serve customers in 'waiting' state
                     );

                     if (customerToServe) {
                         // Found a waiting customer, attempt to serve
                         serveCustomer(customerToServe);
                     } else {
                         // No waiting customer found at this table
                         // Check if *any* customer is there (maybe already served, leaving?)
                         const anyCustomer = customers.some(c => c.tableElement.id === tableId);
                         if(anyCustomer) {
                             // Could be they are waiting for a *different* item or already finished
                              showFeedbackIndicator(targetTable, "Not waiting for this!", "negative");
                         } else {
                              showFeedbackIndicator(targetTable, "No customer here!", "negative");
                         }
                     }
                 });
            } else {
                 // Not carrying food, just move to the table
                 movePlayerToElement(targetTable);
            }
        } else { // Clicked on dining area floor, not a table
             if (!isMoving) { // Prevent queuing multiple moves
                const rect = restaurantArea.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                // Prevent player from going too far into the kitchen area by clicking floor
                const kitchenLineY = restaurantArea.offsetHeight * 0.90; // Adjust as needed
                const targetY = Math.min(clickY, kitchenLineY);
                movePlayerToCoordinates(clickX, targetY);
             }
        }
    });

    // Modal Button Clicks
    nextLevelBtn.addEventListener('click', () => {
        playSound(sfxClick);
        gameOverScreen.classList.add('hidden');
        level++;
        startGame();
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
        startGame();
    });

    // --- Core Functions ---

    function startGame() {
        if (gameRunning && !isPaused) return; // Avoid restarting if already running
        console.log(`--- startGame: Starting Level ${level} ---`);

        // --- Reset Game State ---
        money = 0;
        timeLeft = 120; // Set timer for the level
        gameRunning = true; isPaused = false;
        carryingFood = null; carryingFoodIcon = null; customers = [];
        readyItemsOnPass = []; lastEventIndex = -1; isOvenBroken = false;
        disableOvenStations(false); // Ensure oven stations are enabled
        temporarilyUnavailableItems = []; // Clear any item shortages from previous level/events
        backgroundSoundsStarted = false; // Reset sound trigger flag
        customersSpawnedThisLevel = 0; // Reset event counter
        console.log("--- startGame: State reset ---");

        // --- Reset UI ---
        moneyDisplay.textContent = money; levelDisplay.textContent = level;
        timerDisplay.textContent = timeLeft; carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active');
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>'; // Reset pass
        debugFood.textContent = 'None';
        gameOverScreen.classList.add('hidden'); menuModal.classList.add('hidden');
        eventModal.classList.add('hidden'); gameWonModal.classList.add('hidden');
        console.log("--- startGame: UI reset ---");

        // --- Clear Dynamic Elements ---
        clearCustomersAndIndicators(); // Remove customers, indicators, reset tables
        const numTables = Math.min(8, 2 + level); // Increase tables with level, max 8
        generateTables(diningArea, numTables); // Create tables for the level

        // Reset food station states
        foodStations.forEach(s => {
            s.classList.remove('preparing'); s.style.pointerEvents = 'auto';
            s.style.opacity = '1'; s.style.cursor = 'pointer'; s.title = ""; // Reset event effects
            const pb = s.querySelector('.prep-progress-bar');
            if (pb) { pb.style.transform = 'scaleX(0)'; pb.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; delete pb._animation; }
        });

        stopPlayerMovement(); // Cancel any residual movement
        console.log("--- startGame: Cleared dynamic elements & stations, Generated Tables ---");

        // Set background
        try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; }
        catch (e) { console.error("--- startGame: ERROR setting background ---", e); }

        initializeGameVisuals(); // Position player, ensure visibility
        console.log("--- startGame: Starting timers ---");

        // Start game loop and customer spawning
        clearInterval(timerInterval); timerInterval = setInterval(gameTick, 1000);
        clearTimeout(customerSpawnTimeout);
        // Initial delay before first customer
        customerSpawnTimeout = setTimeout(scheduleNextCustomer, CUSTOMER_SPAWN_MIN_TIME * 0.8); // Start spawning slightly sooner

        console.log(`--- startGame: Level ${level} Started ---`);
    }

    function endGame() {
        console.log("Ending game/day...");
        gameRunning = false; isPaused = true; // Stop game activity
        clearInterval(timerInterval); // Stop game tick
        clearTimeout(customerSpawnTimeout); // Stop spawning
        stopPlayerMovement(); // Stop player

        // Clear state that shouldn't persist between levels/retries
        readyItemsOnPass = [];
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>';
        diningArea.querySelectorAll('.table').forEach(table => table.classList.remove('table-highlight', 'table-leaving-soon'));
        deliveryRadius.classList.remove('active');

        // Stop sounds
        stopLoopingSound(bgmAudio); stopLoopingSound(ambienceAudio);
        backgroundSoundsStarted = false;

        // Cancel any ongoing cooking animations (important!)
        foodStations.forEach(s => { const pb = s.querySelector('.prep-progress-bar'); if (pb && pb._animation) { cancelAnimationFrame(pb._animation.reqId); delete pb._animation;} });

        // --- Determine Outcome ---
        const moneyTarget = levelThresholds[level] || (levelThresholds[levelThresholds.length - 1] + (level - levelThresholds.length + 1) * 100); // Estimate target if beyond defined thresholds
        const levelWon = money >= moneyTarget;
        const isFinalLevel = level >= maxLevel;

        finalScoreDisplay.textContent = money; // Show final score on the modal

        if (levelWon && isFinalLevel) {
            // Game Won!
            console.log("Overall Game Won!");
            finalWinScoreDisplay.textContent = money;
            gameWonModal.classList.remove('hidden'); // Show win modal
            playSound(sfxLevelWin);
        } else if (levelWon) {
            // Level Complete
            console.log(`Level ${level} Complete! Target: ${moneyTarget}, Earned: ${money}`);
            levelEndTitle.textContent = `Level ${level} Complete!`;
            levelResultMessage.textContent = `You earned $${money}. Target was $${moneyTarget}. Get ready!`;
            nextLevelBtn.classList.remove('hidden'); // Show next level button
            retryLevelBtn.classList.add('hidden');
            gameOverScreen.classList.remove('hidden'); // Show level end screen
            playSound(sfxLevelWin);
        } else {
             // Level Failed
             console.log(`Level ${level} Failed! Target: ${moneyTarget}, Earned: ${money}`);
             levelEndTitle.textContent = `End of Day - Level ${level}`;
             levelResultMessage.textContent = `You needed $${moneyTarget} but only earned $${money}. Try again?`;
             nextLevelBtn.classList.add('hidden');
             retryLevelBtn.classList.remove('hidden'); // Show retry button
             gameOverScreen.classList.remove('hidden'); // Show level end screen
             playSound(sfxLevelLose);
        }
        console.log("End of Day processed.");
    }

     function pauseGame() {
         if (!gameRunning || isPaused) return;
         isPaused = true;
         clearInterval(timerInterval); // Stop game tick
         stopPlayerMovement(); // Stop player animation
         // Pause background sounds
         if(backgroundSoundsStarted) {
             if(bgmAudio) bgmAudio.pause();
             if(ambienceAudio) ambienceAudio.pause();
         }
         // Crucially, the animation function `animatePrepProgress` checks `isPaused`
         // and stops progressing time, preserving the state.
         console.log("Game Paused");
     }

     function resumeGame() {
         if (!gameRunning || !isPaused) return;
         isPaused = false;

         if (gameRunning && timeLeft > 0) {
            // Resume background sounds if they were started
            if (backgroundSoundsStarted) {
                playLoopingSound(bgmAudio, 0.3);
                playLoopingSound(ambienceAudio, 0.4);
            }
            // Restart game tick
            clearInterval(timerInterval);
            timerInterval = setInterval(gameTick, 1000);
            // Reschedule customer spawning (it handles its own clearing/setting)
            scheduleNextCustomer();
            // Animations will automatically resume due to the logic within `animatePrepProgress` checking `isPaused`.
            console.log("Game Resumed");
         } else {
              console.log("Game NOT Resumed (already ended or time up)");
              if (timeLeft <= 0 && gameRunning) { endGame(); } // End if time ran out while paused
         }
     }

     function gameTick() {
         if (!gameRunning || isPaused) {
             clearInterval(timerInterval); // Should not happen if called correctly, but safety check
             return;
         }
         timeLeft--;
         timerDisplay.textContent = timeLeft;
         updateCustomers(); // Update patience, mood, check for angry leavers

         // Check for game end condition
         if (timeLeft <= 0) {
             endGame();
             return; // Stop further processing in this tick
         }

         // Check for triggering a random event
         // Trigger less frequently? Adjust probability e.g. 0.015
         if (customersSpawnedThisLevel >= RANDOM_EVENT_MIN_CUSTOMERS && Math.random() < 0.015 && eventModal.classList.contains('hidden')) {
             triggerRandomEvent();
         }
     }

    function updateCustomers() {
        if (isPaused) return; // Don't update if paused
        const now = Date.now();
        const LEAVING_SOON_THRESHOLD = 8; // Increased threshold slightly for multi-orders

        customers.forEach((c) => {
            // Skip customers who are already leaving or fully served/removed
            if (c.state === 'leaving' || c.state === 'served_final' || c.state === 'remove') return;

            // Decrease patience based on time since spawn (or last served item?)
            // For simplicity, let's keep it based on initial spawn time. Serving doesn't reset patience.
            const elapsedSinceSpawn = (now - c.spawnTime) / 1000;
            const oldPatienceRatio = c.patienceCurrent / c.patienceTotal;
            c.patienceCurrent = Math.max(0, c.patienceTotal - elapsedSinceSpawn);
            const newPatienceRatio = c.patienceCurrent / c.patienceTotal;

            // Play impatient sound only once when crossing the threshold
            if (oldPatienceRatio > 0.5 && newPatienceRatio <= 0.5 && c.state === 'waiting') { // Only if still waiting
                 playSound(sfxImpatient);
             }

            updateCustomerMood(c); // Update visual mood indicator based on current patience

            const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
            if (!tableEl) { c.state = 'remove'; return; } // Safety check if table removed

            // Visual cue for nearly angry customer
            if (c.patienceCurrent <= LEAVING_SOON_THRESHOLD && c.patienceCurrent > 0 && c.state === 'waiting') {
                 tableEl.classList.add('table-leaving-soon');
             }
            else { tableEl.classList.remove('table-leaving-soon'); }

            // Customer runs out of patience while waiting for ANY item
            if (c.patienceCurrent <= 0 && c.state === 'waiting') {
                 customerLeavesAngry(c);
             }
        });

        // Clean up customers marked for removal
        customers = customers.filter(c => c.state !== 'remove');
    }

    function customerLeavesAngry(cust) {
        if (!cust || cust.state === 'leaving' || cust.state === 'remove') return; // Already handled
        playSound(sfxAngryLeft);
        console.log("Customer leaving angry:", cust.id, "from table:", cust.tableElement.id, "Bill lost:", cust.currentBill);
        cust.state = 'leaving'; // Mark as leaving

        const tableEl = diningArea.querySelector(`#${cust.tableElement.id}`);
        // Show stronger feedback for lost multi-orders
        const feedbackMsg = cust.orderSequence.length > 1 ? `Left Angry! Lost $${cust.currentBill}!` : "Left Angry! 😡";
        showFeedbackIndicator(cust.element || tableEl || player, feedbackMsg, "negative");

        cust.currentBill = 0; // No money earned if they leave angry

        if (tableEl) {
            tableEl.classList.remove('table-highlight', 'table-leaving-soon'); // Clear table state
        }
        // Fade out the customer element
        if (cust.element) {
            // Ensure bubble also fades or disappears immediately
            const bubble = cust.element.querySelector('.speech-bubble');
            if (bubble) bubble.style.opacity = '0';
            cust.element.style.transition = 'opacity 0.5s ease';
            cust.element.style.opacity = '0';
        }
        // Schedule removal from the game state and DOM after fade out
        setTimeout(() => {
            if (cust.element && cust.element.parentNode) { cust.element.remove(); }
            cust.state = 'remove'; // Mark for filtering out
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
             if (!stationInteractionPoint) return; // Safety check
            const targetRect = stationInteractionPoint.getBoundingClientRect();
            targetX = targetRect.left - restRect.left + targetRect.width / 2;
            targetY = restaurantArea.offsetHeight - plyH - 10; // Position just above the kitchen row
             const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5;
             targetX = Math.max(minX, Math.min(maxX, targetX)); // Clamp X
        } else if (targetEl.closest('.table') || targetEl === deliveryStation) {
            const interactionElement = targetEl.closest('.table') || deliveryStation;
             if (!interactionElement) return; // Safety check
            const targetRect = interactionElement.getBoundingClientRect();
            targetX = targetRect.left - restRect.left + targetRect.width / 2;
            targetY = targetRect.top - restRect.top + targetRect.height / 2;
        } else {
            return; // Clicked on something invalid
        }
        movePlayerToCoordinates(targetX, targetY, callback);
    }

    function movePlayerToCoordinates(targetX, targetY, callback = null) {
        if (isPaused || isMoving) { return; }; // Don't move if paused or already moving
        isMoving = true;
        const startX = playerPosition.x; const startY = playerPosition.y;
        const distance = Math.hypot(targetX - startX, targetY - startY);

        if (distance < 1) { // Already there
            playerPosition.x = targetX; playerPosition.y = targetY; updatePlayerPosition();
            isMoving = false;
            if (callback) { try { callback(); } catch (e) { console.error("Move CB Error (near):", e); } }
            return;
        }

        const playerSpeed = 400; // Pixels per second
        const durationMs = (distance / playerSpeed) * 1000;
        let startTime = null;

        function step(timestamp) {
            if (isPaused) { cancelAnimationFrame(animationFrameId); animationFrameId = null; isMoving = false; return; }
            if (!isMoving) { cancelAnimationFrame(animationFrameId); animationFrameId = null; return; } // Stopped externally

            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(1, elapsed / durationMs);

            playerPosition.x = startX + (targetX - startX) * progress;
            playerPosition.y = startY + (targetY - startY) * progress;
            updatePlayerPosition();

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(step);
            } else {
                playerPosition.x = targetX; playerPosition.y = targetY; updatePlayerPosition(); // Snap to final position
                isMoving = false;
                animationFrameId = null;
                if (callback) { try { callback(); } catch (e) { console.error("Move CB Error (end):", e); } }
            }
        }
        cancelAnimationFrame(animationFrameId); // Clear previous frame
        animationFrameId = requestAnimationFrame(step); // Start new animation
    }

    function stopPlayerMovement() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        isMoving = false;
    }

    function updatePlayerPosition() {
        const playerHalfWidth = player.offsetWidth / 2 || 25;
        const playerHalfHeight = player.offsetHeight / 2 || 35;
        const minX = playerHalfWidth + 5;
        const maxX = restaurantArea.offsetWidth - playerHalfWidth - 5;
        const minY = playerHalfHeight + 5;
        const maxY = restaurantArea.offsetHeight - playerHalfHeight - 5; // Allow reaching bottom edge

        playerPosition.x = Math.max(minX, Math.min(maxX, playerPosition.x));
        playerPosition.y = Math.max(minY, Math.min(maxY, playerPosition.y));

        player.style.transform = `translate(${playerPosition.x - playerHalfWidth}px, ${playerPosition.y - playerHalfHeight}px)`;
        deliveryRadius.style.left = `${playerPosition.x}px`;
        deliveryRadius.style.top = `${playerPosition.y}px`;
    }

    function scheduleNextCustomer() {
        if (!gameRunning || isPaused) {
            clearTimeout(customerSpawnTimeout);
            return;
        }
        clearTimeout(customerSpawnTimeout);

        const baseDelay = Math.max(
            CUSTOMER_SPAWN_MIN_TIME,
            CUSTOMER_SPAWN_BASE_TIME - (level - 1) * CUSTOMER_SPAWN_LEVEL_REDUCTION
        );
        const randomMultiplier = CUSTOMER_SPAWN_RANDOM_FACTOR_MIN + Math.random() * (CUSTOMER_SPAWN_RANDOM_FACTOR_MAX - CUSTOMER_SPAWN_RANDOM_FACTOR_MIN);
        const finalDelay = baseDelay * randomMultiplier;

        customerSpawnTimeout = setTimeout(spawnCustomer, finalDelay);
    }

    function spawnCustomer() {
        if (!gameRunning || isPaused) {
            scheduleNextCustomer(); // Reschedule if paused
            return;
        }
        try {
            const allTables = Array.from(diningArea.querySelectorAll('.table'));
            if (allTables.length === 0) { scheduleNextCustomer(); return; } // No tables available

            const potentialTables = allTables.filter(table => {
                const isOccupied = customers.some(c => c.tableElement.id === table.id && c.state !== 'leaving' && c.state !== 'remove');
                return !isOccupied;
            });

            if (potentialTables.length > 0) {
                // --- Start Background Music/Ambience ---
                if (!backgroundSoundsStarted) {
                    console.log("First customer spawning, starting background sounds.");
                    playLoopingSound(bgmAudio, 0.3);
                    playLoopingSound(ambienceAudio, 0.4);
                    backgroundSoundsStarted = true;
                }
                // --- End Background Music Trigger ---

                playSound(sfxOrdered); // Play order sound

                const tableElement = potentialTables[Math.floor(Math.random() * potentialTables.length)];
                const seatElement = tableElement.querySelector('.seat');
                if (!seatElement) { scheduleNextCustomer(); return; } // Table missing seat? Skip.

                // --- Generate Order ---
                let orderSequence;
                if (Math.random() < MULTI_ORDER_CHANCE) {
                    orderSequence = generateOrderSequence(); // Generate multi-item sequence
                } else {
                    // Single item order
                     const allAvailable = Object.entries(foodItems)
                         .filter(([id, item]) =>
                             !(isOvenBroken && OVEN_ITEMS.includes(id)) &&
                             !temporarilyUnavailableItems.includes(id)
                         ).map(([id, item]) => id);
                     if (allAvailable.length > 0) {
                         orderSequence = [allAvailable[Math.floor(Math.random() * allAvailable.length)]];
                     } else {
                         orderSequence = ['Water']; // Fallback if absolutely nothing is available
                     }
                     console.log("Generated single order:", orderSequence);
                }

                 if (!orderSequence || orderSequence.length === 0) {
                     console.error("Failed to generate any order sequence!");
                     scheduleNextCustomer(); // Try again later
                     return;
                 }

                // --- Create Customer Element & Data ---
                const custEl = document.createElement('div'); custEl.className = 'customer';
                custEl.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)]; custEl.style.opacity = '0';

                const bubble = document.createElement('div'); bubble.className = 'speech-bubble'; bubble.style.opacity = '0';
                const moodIndicator = document.createElement('div'); moodIndicator.className = 'mood-indicator'; moodIndicator.textContent = moodEmojis.happy;

                custEl.appendChild(moodIndicator); custEl.appendChild(bubble);
                seatElement.appendChild(custEl);

                const customerId = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`;
                // Adjust patience based on number of items? Maybe slightly more patience for longer orders.
                const numItems = orderSequence.length;
                const patienceTotal = Math.max(20, customerPatienceBase - (level - 1) * 2 + (numItems * 3)); // Add ~3s per item


                const newCustomer = {
                    id: customerId,
                    element: custEl,
                    tableElement: tableElement,
                    orderSequence: orderSequence, // Full list of items
                    currentOrderIndex: 0,         // Start waiting for the first item
                    order: orderSequence[0],      // Explicitly set the first item being waited for
                    currentBill: 0,               // Bill starts at 0
                    spawnTime: Date.now(),
                    patienceTotal: patienceTotal,
                    patienceCurrent: patienceTotal,
                    moodIndicator: moodIndicator,
                    state: 'waiting' // Initial state
                };

                customers.push(newCustomer);
                customersSpawnedThisLevel++;
                updateCustomerBubble(newCustomer); // Display the first item in the bubble

                 // Fade in customer and bubble
                 requestAnimationFrame(() => {
                     custEl.style.transition = 'opacity 0.3s ease-in';
                     bubble.style.transition = 'opacity 0.3s ease-in 0.1s'; // Bubble fades slightly later
                     custEl.style.opacity = '1';
                     bubble.style.opacity = '1';
                 });

                tableElement.classList.add('table-highlight'); // Highlight the table

            } else {
                // console.log("No available tables currently."); // Optional debug
            }
        } catch (error) { console.error("Error during spawnCustomer:", error); }

        scheduleNextCustomer(); // Always schedule the next attempt
    }

    function serveCustomer(cust) {
        if (!cust || cust.state !== 'waiting' || !carryingFood) {
            // console.log("Serve attempt failed: Invalid customer state, or not carrying food.");
             if (carryingFood && cust && cust.state === 'waiting') {
                 // Holding food, customer is waiting, but maybe not for this?
                 showFeedbackIndicator(cust.element || cust.tableElement, "Not what I want!", "negative");
             }
             // Don't clear hands if the serve was invalid/wrong item
            return;
        }

        const expectedItem = cust.orderSequence[cust.currentOrderIndex];

        if (carryingFood === expectedItem) {
            // --- CORRECT ITEM SERVED ---
            playSound(sfxServe);
            const itemData = foodItems[expectedItem];
            const basePrice = itemData.price || 0;

            // Calculate tip for THIS item based on CURRENT patience
            const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal;
            let tipMultiplier = 0.05;
            if (patienceRatio > 0.8) tipMultiplier = 0.20;
            else if (patienceRatio > 0.5) tipMultiplier = 0.15;
            else if (patienceRatio > 0.2) tipMultiplier = 0.10;
            const tipAmount = Math.ceil(basePrice * tipMultiplier);

            cust.currentBill += (basePrice + tipAmount); // Add item price + tip to their running bill

            // Show feedback for the item served
             showFeedbackIndicator(cust.element || cust.tableElement, `+ $${basePrice}<br/>+ $${tipAmount} tip!`, "positive");

            cust.currentOrderIndex++; // Move to the next item in sequence

            // --- Check if Order Complete ---
            if (cust.currentOrderIndex >= cust.orderSequence.length) {
                // FINAL ITEM SERVED - Order Complete
                cust.state = 'served_final'; // Mark as fully served
                money += cust.currentBill; // Add accumulated bill to total money
                moneyDisplay.textContent = money; // Update UI

                // Final feedback
                cust.moodIndicator.textContent = '😋';
                const bubble = cust.element.querySelector('.speech-bubble');
                if (bubble) bubble.innerHTML = `Grazie! Total: $${cust.currentBill} 👌`; // Show final bill

                if (cust.tableElement) { cust.tableElement.classList.remove('table-highlight', 'table-leaving-soon'); }

                // Fade out customer
                if (cust.element) {
                     cust.element.style.transition = 'opacity 1s ease 0.5s';
                     cust.element.style.opacity = '0';
                 }
                 setTimeout(() => {
                     if (cust.element && cust.element.parentNode) { cust.element.remove(); }
                     cust.state = 'remove';
                 }, 1500); // Remove after fade

            } else {
                // INTERIM ITEM SERVED - More items to come
                 cust.order = cust.orderSequence[cust.currentOrderIndex]; // Update the *next* item they expect
                 updateCustomerBubble(cust); // Update bubble to show the next item
                 // Customer remains in 'waiting' state
                 // Table remains highlighted
            }

            // Clear player's hands AFTER successful serve
            carryingFood = null; carryingFoodIcon = null; carryingDisplay.innerHTML = '';
            deliveryRadius.classList.remove('active');
            if (debugMode) debugFood.textContent = "None";

        } else {
            // --- WRONG ITEM SERVED ---
            showFeedbackIndicator(cust.element || cust.tableElement, `Wrong order! I want ${expectedItem}!`, "negative");
            // Do NOT clear player's hands - they still hold the wrong item
            // Customer remains waiting for the 'expectedItem'
        }
    }

    function updateCustomerMood(cust) {
        if (!cust.moodIndicator || cust.state !== 'waiting') return; // Only update waiting customers

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

    function showFeedbackIndicator(targetElement, text, type = "info", duration = 1800) {
        if (!targetElement || !restaurantArea.contains(targetElement)) { targetElement = player; }
        const indicator = document.createElement('div');
        indicator.className = 'feedback-indicator';
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

    // --- Event Logic ---
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
            // Add state change info if present in the event option
            if (opt.effect.stateChange) {
                 btn.dataset.stateChange = opt.effect.stateChange;
                 if (opt.effect.item) { // Include item if state change affects a specific one
                     btn.dataset.item = opt.effect.item;
                 }
             }
            btn.addEventListener('click', handleEventChoice); eventOptionsContainer.appendChild(btn);
        });
        eventModal.classList.remove('hidden');
    }

    function handleEventChoice(e) {
        playSound(sfxClick); const btn = e.target;
        const moneyEffect = parseInt(btn.dataset.effectMoney || '0');
        const timeEffect = parseInt(btn.dataset.effectTime || '0');
        const feedbackText = btn.dataset.feedback || "Okay.";
        const stateChange = btn.dataset.stateChange;
        const itemAffected = btn.dataset.item; // Get affected item if applicable

        // Apply immediate effects
        money += moneyEffect; timeLeft += timeEffect;
        money = Math.max(0, money); timeLeft = Math.max(0, timeLeft);
        moneyDisplay.textContent = money; timerDisplay.textContent = timeLeft;
        showFeedbackIndicator(player, feedbackText, (moneyEffect < 0 || timeEffect < 0) ? "negative" : "info");

        // Apply state changes
        if (stateChange === 'ovenBroken') {
            isOvenBroken = true; console.log("EVENT: Oven is now broken!");
            disableOvenStations(true); // Visually disable stations
        } else if (stateChange === 'itemUnavailable' && itemAffected) {
            if (!temporarilyUnavailableItems.includes(itemAffected)) {
                temporarilyUnavailableItems.push(itemAffected);
                console.log(`EVENT: ${itemAffected} is now unavailable!`);
                // Optionally update affected station visuals immediately
                foodStations.forEach(station => {
                    if (station.dataset.item === itemAffected) {
                        station.style.opacity = '0.5'; station.style.cursor = 'not-allowed';
                        station.title = `${itemAffected} Unavailable`;
                    }
                });
            }
        }
        // Add more state changes here if needed (e.g., 'ovenFixed')

        eventModal.classList.add('hidden'); // Hide modal

        // Resume or end game
        if (timeLeft > 0 && gameRunning) { resumeGame(); }
        else if (timeLeft <= 0) { console.log("Event caused time to run out."); endGame(); }
    }

    function disableOvenStations(disable) {
        console.log(`Setting oven stations disabled state: ${disable}`);
        isOvenBroken = disable; // Update the global state variable
        foodStations.forEach(station => {
            const foodId = station.dataset.item;
            if (OVEN_ITEMS.includes(foodId)) {
                const isAlsoUnavailable = temporarilyUnavailableItems.includes(foodId);
                station.style.opacity = (disable || isAlsoUnavailable) ? '0.5' : '1';
                station.style.cursor = (disable || isAlsoUnavailable) ? 'not-allowed' : 'pointer';
                if (disable) { station.title = "Oven is Broken!"; }
                else if (!isAlsoUnavailable) { station.title = ""; } // Only clear title if oven fixed AND not otherwise unavailable
            }
        });
    }


    // --- Initialization ---
    function initializeGameVisuals() {
        // Position player only after dimensions are known
        if (restaurantArea.offsetWidth > 0) {
            const playerHalfHeight = player.offsetHeight / 2 || 35;
            const playerHalfWidth = player.offsetWidth / 2 || 25;
            playerPosition.x = restaurantArea.offsetWidth / 2;
            playerPosition.y = restaurantArea.offsetHeight - playerHalfHeight - 10; // Start at bottom center
            updatePlayerPosition();
            player.style.opacity = '1';
            player.style.display = 'flex'; // Ensure player is visible
        } else {
            setTimeout(initializeGameVisuals, 50); // Retry if dimensions not ready
            return;
        }
        // Ensure modals are hidden
        gameOverScreen.classList.add('hidden'); menuModal.classList.add('hidden');
        eventModal.classList.add('hidden'); gameWonModal.classList.add('hidden');
        // Set debug display based on mode
        debugInfo.classList.toggle('hidden', !debugMode);
        debugFood.textContent = 'None';
        // Set background
        try {
             restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`;
             restaurantArea.style.backgroundSize = 'cover';
             restaurantArea.style.backgroundPosition = 'center';
        } catch(e) { console.error("Error setting background in init:", e)}
        console.log("Initial game visuals set.");
    }

    // --- Game Start Trigger ---
    initializeGameVisuals(); // Set up visuals first
    setTimeout(() => { // Short delay before starting game logic
        if (!gameRunning) { startGame(); }
    }, 150);

}); // End DOMContentLoaded
// <<< END OF UPDATED full.js (Multi-Item Orders) >>>
