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

    // --- NEW/UPDATED Audio Elements ---
    const bgmAudio = document.getElementById('bgm');
    const ambienceAudio = document.getElementById('ambience'); // New looping sound
    const sfxOrdered = document.getElementById('sfx-ordered'); // New
    const sfxImpatient = document.getElementById('sfx-impatient'); // New
    const sfxServe = document.getElementById('sfx-serve'); // Updated src via HTML
    const sfxAngryLeft = document.getElementById('sfx-angry-left'); // New
    const sfxTrash = document.getElementById('sfx-trash'); // Updated src via HTML
    const sfxPickup = document.getElementById('sfx-pickup'); // New

    // --- Old SFX variables (will be null if elements removed/commented) ---
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

    // --- Game Configuration ---
    const OVEN_ITEMS = [
        'Tomato Pie Slice', 'Tre Sale Slice', 'Garlic Girl', 'Toni Roni',
        'Roasted Half-Chicken'
        // 'Crispy Baked Polenta' // Add if this also needs oven
    ];
    const foodItems = { // Full menu from previous step
        'Bread Basket': { image: 'assets/bread basket.png', price: 5, category: 'Appetizers', prepTime: 1 },
        'Cherry Tomato & Garlic Confit': { image: 'assets/cherry confit.png', price: 12, category: 'Appetizers', prepTime: 2 },
        'Ahi Crudo': { image: 'assets/ahi crudo.png', price: 20, category: 'Appetizers', prepTime: 3 },
        'Whipped Ricotta': { image: 'assets/ricotta.png', price: 14, category: 'Appetizers', prepTime: 2 },
        'Raviolo al Uovo': { image: 'assets/raviolo.png', price: 8, category: 'Appetizers', prepTime: 2.5 },
        'Prosciutto e Melone': { image: 'assets/prosciutto-e-melone.png', price: 10, category: 'Appetizers', prepTime: 1.5 },
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
    const randomEvents = [ // Same as before
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
    function playSound(audioElement, volume = 0.7) {
        if (!audioElement) {
            // console.log("Attempted to play null audio element");
            return;
        }
        audioElement.volume = volume;
        audioElement.currentTime = 0;
        audioElement.play().catch(error => {
            // console.log(`Audio play failed for ${audioElement.id}:`, error);
        });
    }

    function playLoopingSound(audioElement, volume = 0.3) { // Helper for looping sounds
        if (!audioElement) return;
        audioElement.volume = volume;
        // Only play if it's not already playing (or paused at the very start)
        if (audioElement.paused) {
             audioElement.play().catch(error => {
                 // console.log(`Looping audio play failed for ${audioElement.id}:`, error);
             });
        }
    }

    function stopLoopingSound(audioElement) { // Helper to stop loops
         if (!audioElement) return;
         audioElement.pause();
         audioElement.currentTime = 0; // Rewind
    }

    function getFoodIcon(foodId) {
        const item = foodItems[foodId];
        if (!item) return '?';
        return item.image || item.emoji || '?';
    }

    function createIconElement(iconSrcOrEmoji, altText = 'Food item') {
        if (iconSrcOrEmoji.includes('/')) { // Image path
            const img = document.createElement('img');
            img.src = iconSrcOrEmoji;
            img.alt = altText;
            return img;
        } else { // Emoji
            const span = document.createElement('span');
            span.textContent = iconSrcOrEmoji;
            return span;
        }
    }

    function animatePrepProgress(progressBarElement, durationMs, onComplete) {
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

    function addFoodToPass(foodId) {
        const itemData = foodItems[foodId];
        if (!itemData) return;
        const icon = getFoodIcon(foodId);
        readyItemsOnPass.push({ foodId: foodId, icon: icon });
        const itemDiv = document.createElement('div');
        itemDiv.className = 'ready-food-item';
        itemDiv.dataset.food = foodId;
        itemDiv.appendChild(createIconElement(icon, foodId));
        itemDiv.title = foodId;
        const existingLabel = deliveryStation.querySelector('.delivery-station-label');
        if (existingLabel) existingLabel.remove();
        deliveryStation.appendChild(itemDiv);
        playSound(sfxReady); // Play optional 'ready' sound if available
    }

    function generateTables(container, numTables) {
        container.innerHTML = '';
        const numCols = 3;
        const rowPositions = [60, 85];
        const colPositions = [18, 50, 82];
        for (let i = 0; i < numTables; i++) {
            const table = document.createElement('div');
            table.classList.add('table');
            const tableIdNum = i + 1;
            table.id = `table-${tableIdNum}`;
            table.dataset.table = tableIdNum;
            const seat = document.createElement('div'); seat.classList.add('seat'); table.appendChild(seat);
            const row = Math.floor(i / numCols);
            const col = i % numCols;
            if (row < rowPositions.length && col < colPositions.length) {
                table.style.top = `${rowPositions[row]}%`;
                table.style.left = `${colPositions[col]}%`;
                table.style.transform = 'translate(-50%, -50%)';
            } else {
                console.warn(`Table ${tableIdNum} exceeded defined positions.`);
                table.style.top = `${55 + (row * 15)}%`;
                table.style.left = `${15 + (col * 25)}%`;
                table.style.transform = 'translate(-50%, -50%)';
            }
            container.appendChild(table);
        }
    }

    // --- Event Listeners ---
    let keysPressed = {};
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;
        if (keysPressed['d'] && keysPressed['e'] && keysPressed['b'] && keysPressed['u'] && keysPressed['g']) {
            debugMode = !debugMode;
            debugInfo.classList.toggle('hidden', !debugMode);
            console.log("Debug mode:", debugMode ? "ON" : "OFF");
            keysPressed = {};
        }
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
            resumeGame();
         });
    }

    foodStations.forEach(station => {
         station.addEventListener('click', () => {
             playSound(sfxClick);

             const foodId = station.dataset.item;
             const item = foodItems[foodId];
             if (!item) return;

             if (isOvenBroken && OVEN_ITEMS.includes(foodId)) {
                 showFeedbackIndicator(station, "Oven is broken!", "negative", 1500);
                 console.log(`Prevented cooking ${foodId} - oven broken.`);
                 return;
             }

             if (isPaused || station.classList.contains('preparing')) return;
             if (carryingFood) {
                 showFeedbackIndicator(station, "Hands full!", "negative", 1000);
                 return;
             }

            station.classList.add('preparing');
            station.style.pointerEvents = 'none';
            const progressBar = station.querySelector('.prep-progress-bar');

            if (progressBar) {
                 progressBar.style.backgroundColor = '#ffcc00';
                 progressBar.style.transform = 'scaleX(0)';
                 const prepTimeMs = item.prepTime * 1000;
                 playSound(sfxCook);

                 animatePrepProgress(progressBar, prepTimeMs, () => {
                    progressBar.style.backgroundColor = '#4CAF50';
                    station.classList.remove('preparing');
                    addFoodToPass(foodId); // Plays sfxReady internally if available
                    progressBar.style.transform = 'scaleX(0)';
                    progressBar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                    station.style.pointerEvents = 'auto';
                 });
            } else {
                 playSound(sfxCook);
                 setTimeout(() => {
                     station.classList.remove('preparing');
                     addFoodToPass(foodId); // Plays sfxReady internally if available
                     station.style.pointerEvents = 'auto';
                 }, (item.prepTime || 0.1) * 1000);
             }
        });
    });

    deliveryStation.addEventListener('click', (e) => {
        playSound(sfxClick);
        if (isPaused) return;
        const clickedItem = e.target.closest('.ready-food-item');

        if (carryingFood) {
             showFeedbackIndicator(deliveryStation, "Place food on tables!", "negative", 1000);
             return;
        }

        if (clickedItem) {
            const foodId = clickedItem.dataset.food;
            const itemIndex = readyItemsOnPass.findIndex(item => item.foodId === foodId);
            if (itemIndex !== -1) {
                const itemToTake = readyItemsOnPass.splice(itemIndex, 1)[0];
                clickedItem.remove();
                carryingFood = itemToTake.foodId;
                carryingFoodIcon = itemToTake.icon;
                carryingDisplay.innerHTML = '';
                carryingDisplay.appendChild(createIconElement(carryingFoodIcon, carryingFood));
                deliveryRadius.classList.add('active');
                playSound(sfxPickup); // <<< Play specific pickup sound
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
    });

    trashCan.addEventListener('click', () => {
        if (isPaused || !carryingFood) return;
        playSound(sfxTrash); // Play new trash sound
        showFeedbackIndicator(trashCan, `Trashed ${carryingFood}!`, "negative");
        carryingFood = null;
        carryingFoodIcon = null;
        carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active');
        if (debugMode) debugFood.textContent = "None";
        console.log("Trashed carried food");
    });

    diningArea.addEventListener('click', (e) => {
        playSound(sfxClick);
        if (isPaused) return;
        const targetTable = e.target.closest('.table');
        if (targetTable) {
            const tableId = targetTable.id;
            const customer = customers.find(c => c.tableElement.id === tableId && c.state === 'waiting');
            if (carryingFood) {
                movePlayerToElement(targetTable, () => {
                     if (!carryingFood) return;
                     const currentCustomer = customers.find(c => c.tableElement.id === tableId && c.state === 'waiting');
                     if (currentCustomer && currentCustomer.order === carryingFood) {
                         serveCustomer(currentCustomer); // Plays serve sound inside
                     } else if (currentCustomer) {
                         showFeedbackIndicator(targetTable, "Wrong order!", "negative");
                     } else {
                         showFeedbackIndicator(targetTable, "No waiting customer!", "negative");
                     }
                 });
            } else {
                 movePlayerToElement(targetTable);
            }
        } else {
             if (!isMoving) {
                const rect = restaurantArea.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                const kitchenLineY = restaurantArea.offsetHeight * 0.90;
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
        startGame();
    });

    playAgainBtn.addEventListener('click', () => {
        playSound(sfxClick);
        gameWonModal.classList.add('hidden');
        level = 1;
        startGame();
    });

    // --- Core Functions ---

    function startGame() {
        if (gameRunning && !isPaused) return;
         console.log(`--- startGame: Starting Level ${level} ---`);

        const numTables = Math.min(8, 2 + level);
        const moneyTarget = levelThresholds[level] || 99999;
        console.log(`Level ${level}: Tables=${numTables}, Target=$${moneyTarget}`);

        money = 0; timeLeft = 180; gameRunning = true; isPaused = false;
        carryingFood = null; carryingFoodIcon = null; customers = []; isMoving = false;
        readyItemsOnPass = [];
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>';
        lastEventIndex = -1; isOvenBroken = false;
        disableOvenStations(false);

        console.log("--- startGame: State reset ---");
        moneyDisplay.textContent = money; levelDisplay.textContent = level; timerDisplay.textContent = timeLeft;
        carryingDisplay.innerHTML = ''; deliveryRadius.classList.remove('active'); debugFood.textContent = 'None';
        gameOverScreen.classList.add('hidden'); menuModal.classList.add('hidden'); eventModal.classList.add('hidden'); gameWonModal.classList.add('hidden');
        console.log("--- startGame: UI reset ---");

        clearCustomersAndIndicators();
        generateTables(diningArea, numTables);
         foodStations.forEach(s => {
            s.classList.remove('preparing'); s.style.pointerEvents = 'auto';
            const pb = s.querySelector('.prep-progress-bar'); if (pb) { pb.style.transform = 'scaleX(0)'; pb.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';}
         });

        stopPlayerMovement();
        console.log("--- startGame: Cleared dynamic elements & stations, Generated Tables ---");
        try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; } catch (e) { console.error("--- startGame: ERROR setting background ---", e); }
        console.log("--- startGame: Background set (or attempted) ---");
        try { initializeGameVisuals(); } catch (e) { console.error("--- startGame: ERROR initializing visuals ---", e); }
        console.log("--- startGame: Visuals initialized (or attempted) ---");

        console.log("--- startGame: Starting timers & Audio ---");
        playLoopingSound(bgmAudio, 0.3); // Start BGM loop
        playLoopingSound(ambienceAudio, 0.4); // Start Ambience loop

        clearInterval(timerInterval); timerInterval = setInterval(gameTick, 1000);

        console.log(`[startGame L${level}] Final state before scheduling: gameRunning=${gameRunning}, isPaused=${isPaused}`);
        if (!gameRunning || isPaused) {
            console.error(`[startGame L${level}] CRITICAL: Game state prevents scheduling! gameRunning=${gameRunning}, isPaused=${isPaused}`);
        }

        clearTimeout(customerSpawnTimeout);
        scheduleNextCustomer(); // Start customer spawning loop

        console.log(`--- startGame: Level ${level} Started ---`);
    }

    function endGame() {
        console.log("Ending game/day...");
        gameRunning = false; isPaused = true; clearInterval(timerInterval); clearTimeout(customerSpawnTimeout);
        stopPlayerMovement();
        readyItemsOnPass = [];
        deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>';
        diningArea.querySelectorAll('.table').forEach(table => table.classList.remove('table-highlight', 'table-leaving-soon'));

        stopLoopingSound(bgmAudio); // Stop loops
        stopLoopingSound(ambienceAudio);

        const moneyTarget = levelThresholds[level] || 99999;
        const levelWon = money >= moneyTarget;
        const isFinalLevel = level >= maxLevel;

        finalScoreDisplay.textContent = money;

        if (levelWon && isFinalLevel) {
            console.log("Overall Game Won!");
            finalWinScoreDisplay.textContent = money;
            gameWonModal.classList.remove('hidden');
            playSound(sfxLevelWin); // Play win sound (if element exists)

        } else if (levelWon) {
            console.log(`Level ${level} Complete! Target: ${moneyTarget}, Earned: ${money}`);
            levelEndTitle.textContent = `Level ${level} Complete!`;
            levelResultMessage.textContent = `You earned $${money}. Get ready for the next level!`;
            nextLevelBtn.classList.remove('hidden');
            retryLevelBtn.classList.add('hidden');
            gameOverScreen.classList.remove('hidden');
            playSound(sfxLevelWin); // Play win sound (if element exists)

        } else {
             console.log(`Level ${level} Failed! Target: ${moneyTarget}, Earned: ${money}`);
             levelEndTitle.textContent = `End of Day - Level ${level}`;
             levelResultMessage.textContent = `You didn't reach the target of $${moneyTarget}. Try again?`;
             nextLevelBtn.classList.add('hidden');
             retryLevelBtn.classList.remove('hidden');
             gameOverScreen.classList.remove('hidden');
             playSound(sfxLevelLose); // Play lose sound (if element exists)
        }

        deliveryRadius.classList.remove('active');
        console.log("End of Day processed.");
    }

    function pauseGame() {
         if (!gameRunning || isPaused) return;
         isPaused = true;
         clearInterval(timerInterval);
         stopPlayerMovement();
         if(bgmAudio) bgmAudio.pause(); // Pause loops
         if(ambienceAudio) ambienceAudio.pause();
         console.log("Game Paused");
     }

     function resumeGame() {
         if (!gameRunning || !isPaused) return;
         isPaused = false;
         if (gameRunning && timeLeft > 0) {
            playLoopingSound(bgmAudio, 0.3); // Resume loops
            playLoopingSound(ambienceAudio, 0.4);
            clearInterval(timerInterval);
            timerInterval = setInterval(gameTick, 1000);
            console.log("Game Resumed");
         } else {
              console.log("Game NOT Resumed (already ended or time up)");
         }
     }

     function gameTick() {
         if (!gameRunning || isPaused) {
             clearInterval(timerInterval);
             return;
         }
         timeLeft--;
         timerDisplay.textContent = timeLeft;
         updateCustomers();
         if (timeLeft <= 0) {
             endGame();
             return;
         }
         if (Math.random() < 0.02 && eventModal.classList.contains('hidden')) {
             triggerRandomEvent();
         }
     }

    function updateCustomers() {
        if (isPaused) return;
        const now = Date.now();
        const LEAVING_SOON_THRESHOLD = 5;

        customers.forEach((c) => {
            if (c.state === 'leaving' || c.state === 'served' || c.state === 'remove') return;
            const elapsed = (now - c.spawnTime) / 1000;
            const oldPatienceRatio = c.patienceCurrent / c.patienceTotal; // Store old ratio
            c.patienceCurrent = Math.max(0, c.patienceTotal - elapsed);
            const newPatienceRatio = c.patienceCurrent / c.patienceTotal; // Calculate new ratio

            // Play impatient sound when crossing the threshold
            if (oldPatienceRatio > 0.5 && newPatienceRatio <= 0.5) {
                 playSound(sfxImpatient);
            }
             // Optionally play again when crossing into angry (uncomment if desired)
             // if (oldPatienceRatio > 0.2 && newPatienceRatio <= 0.2) {
             //     playSound(sfxImpatient);
             // }

            updateCustomerMood(c); // Update visual mood based on current patience

            const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
            if (!tableEl) {
                 console.warn("Customer's table element not found:", c.tableElement.id);
                 return;
            }
            if (c.patienceCurrent <= LEAVING_SOON_THRESHOLD && c.patienceCurrent > 0) {
                tableEl.classList.add('table-leaving-soon');
            } else {
                tableEl.classList.remove('table-leaving-soon');
            }
            if (c.patienceCurrent <= 0 && c.state === 'waiting') {
                customerLeavesAngry(c); // Plays angry left sound inside
            }
        });
        customers = customers.filter(c => c.state !== 'remove');
    }

    function customerLeavesAngry(c) {
        if (!c || c.state === 'leaving' || c.state === 'remove') return;
        playSound(sfxAngryLeft); // Play specific angry left sound
        console.log("Customer leaving angry:", c.id);
        c.state = 'leaving';
        const tableEl = diningArea.querySelector(`#${c.tableElement.id}`);
        if (tableEl) {
            tableEl.classList.remove('table-highlight', 'table-leaving-soon');
        }
        showFeedbackIndicator(tableEl || player, "Left Angry! 😡", "negative");
        if (c.element) {
            c.element.style.transition = 'opacity 0.5s ease';
            c.element.style.opacity = '0';
        }
        setTimeout(() => {
            if (c.element && c.element.parentNode) {
                c.element.remove();
            }
            c.state = 'remove';
        }, 500);
    }

    function movePlayerToElement(targetEl, callback = null) {
        if (isPaused || !targetEl) return;
        const restRect = restaurantArea.getBoundingClientRect();
        const plyH = player.offsetHeight / 2 || 35;
        const plyW = player.offsetWidth / 2 || 25;
        let tX, tY;
        if (targetEl.closest('.kitchen-row')) {
            const sI = targetEl.closest('.food-station') || targetEl;
            const tR = sI.getBoundingClientRect();
            const sCX_v = tR.left + tR.width / 2;
            tX = sCX_v - restRect.left;
            tY = restaurantArea.offsetHeight - plyH - 10;
            const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5;
            tX = Math.max(minX, Math.min(maxX, tX));
        } else if (targetEl.closest('.table') || targetEl === deliveryStation || targetEl === trashCan) {
            const tE = targetEl.closest('.table') || (targetEl === deliveryStation ? deliveryStation : trashCan);
            const tR = tE.getBoundingClientRect();
            tX = tR.left - restRect.left + tR.width / 2;
            tY = tR.top - restRect.top + tR.height / 2;
        } else {
            console.warn("Move target unknown:", targetEl); return;
        }
        movePlayerToCoordinates(tX, tY, callback);
    }

    function movePlayerToCoordinates(tX, tY, callback = null) {
        if (isPaused || isMoving) { return; };
        isMoving = true;
        const sX = playerPosition.x; const sY = playerPosition.y;
        const dist = Math.hypot(tX - sX, tY - sY);
        if (dist < 1) { isMoving = false; if (callback) callback(); return; }
        const speed = 400; const dur = (dist / speed) * 1000;
        let startT = null;
        function step(time) {
            if (isPaused) { cancelAnimationFrame(animationFrameId); animationFrameId = null; isMoving = false; return; }
            if (!isMoving) { cancelAnimationFrame(animationFrameId); animationFrameId = null; return; }
            if (!startT) startT = time;
            const elap = time - startT;
            const prog = Math.min(1, elap / dur);
            playerPosition.x = sX + (tX - sX) * prog;
            playerPosition.y = sY + (tY - sY) * prog;
            updatePlayerPosition();
            if (prog < 1) {
                animationFrameId = requestAnimationFrame(step);
            } else {
                playerPosition.x = tX; playerPosition.y = tY;
                updatePlayerPosition();
                isMoving = false; animationFrameId = null;
                if (callback) { try { callback(); } catch (e) { console.error("Move CB Error:", e); } }
            }
        }
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(step);
    }

    function stopPlayerMovement() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId); animationFrameId = null;
        }
        isMoving = false;
    }

    function updatePlayerPosition() {
        const plyW = player.offsetWidth / 2 || 25;
        const plyH = player.offsetHeight / 2 || 35;
        const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5;
        const minY = plyH + 5; const maxY = restaurantArea.offsetHeight - plyH - 5;
        playerPosition.x = Math.max(minX, Math.min(maxX, playerPosition.x));
        playerPosition.y = Math.max(minY, Math.min(maxY, playerPosition.y));
        player.style.transform = `translate(${playerPosition.x - plyW}px, ${playerPosition.y - plyH}px)`;
        deliveryRadius.style.left = `${playerPosition.x}px`;
        deliveryRadius.style.top = `${playerPosition.y}px`;
    }

    function scheduleNextCustomer() {
        if (!gameRunning || isPaused) {
            // console.log(`[scheduleNextCustomer L${level}] Scheduling stopped (game not running or paused).`);
            clearTimeout(customerSpawnTimeout);
            return;
        }
        clearTimeout(customerSpawnTimeout);
        const baseT = 6000, minT = 2500;
        const reduc = (level - 1) * 350;
        const delay = Math.max(minT, baseT - reduc);
        const randF = 0.8 + Math.random() * 0.4;
        const finalDelay = delay * randF;
        customerSpawnTimeout = setTimeout(spawnCustomer, finalDelay);
    }

    function spawnCustomer() {
        if (!gameRunning || isPaused) {
           // console.log(`[spawnCustomer L${level}] Spawn aborted (game not running or paused).`);
           return;
        }
        try {
            const currentTables = Array.from(diningArea.querySelectorAll('.table'));
            const availT = currentTables.filter(t => !customers.some(c => c.tableElement.id === t.id && c.state !== 'leaving' && c.state !== 'remove'));

            if (availT.length > 0) {
                playSound(sfxOrdered); // Play order sound when customer appears
                const tableElement = availT[Math.floor(Math.random() * availT.length)];
                const seat = tableElement.querySelector('.seat');
                if (!seat) { scheduleNextCustomer(); return; } // Skip if seat isn't found
                const custEl = document.createElement('div');
                custEl.className = 'customer';
                custEl.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)];
                custEl.style.opacity = '0';
                const foods = Object.keys(foodItems);
                const order = foods[Math.floor(Math.random() * foods.length)];
                const foodData = foodItems[order];
                const orderIcon = getFoodIcon(order);
                const bubble = document.createElement('div');
                bubble.className = 'speech-bubble';
                bubble.innerHTML = `
                    <div class="dish-name">${order}</div>
                    <div class="dish-price">$${foodData.price}</div>
                    <div class="dish-emoji"></div>
                `;
                const dishEmojiContainer = bubble.querySelector('.dish-emoji');
                dishEmojiContainer.appendChild(createIconElement(orderIcon, order));
                bubble.style.opacity = '0';
                const moodIndicator = document.createElement('div');
                moodIndicator.className = 'mood-indicator';
                moodIndicator.textContent = moodEmojis.happy;
                custEl.appendChild(moodIndicator);
                custEl.appendChild(bubble);
                seat.appendChild(custEl);
                requestAnimationFrame(() => {
                    custEl.style.opacity = '1';
                    bubble.style.opacity = '1';
                });
                const customerId = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`;
                const patienceTotal = Math.max(15, customerPatienceBase - (level - 1) * 2);
                const newCustomer = {
                    id: customerId, element: custEl, tableElement: tableElement, order: order,
                    orderPrice: foodData.price, spawnTime: Date.now(), patienceTotal: patienceTotal,
                    patienceCurrent: patienceTotal, moodIndicator: moodIndicator, state: 'waiting'
                };
                customers.push(newCustomer);
                tableElement.classList.add('table-highlight');
            }
        } catch (error) {
            console.error("Error during spawnCustomer:", error);
        }
        scheduleNextCustomer(); // Always schedule the next one
    }

    function serveCustomer(cust) {
        if (!cust || cust.state !== 'waiting') return;
        playSound(sfxServe); // Play happy served sound
        cust.state = 'served';
        const tableEl = diningArea.querySelector(`#${cust.tableElement.id}`);
        const basePrice = cust.orderPrice;
        const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal;
        let tipMultiplier = 0.05;
        if (patienceRatio > 0.8) tipMultiplier = 0.20;
        else if (patienceRatio > 0.5) tipMultiplier = 0.15;
        else if (patienceRatio > 0.2) tipMultiplier = 0.10;
        const tipAmount = Math.ceil(basePrice * tipMultiplier);
        const totalEarned = basePrice + tipAmount;
        money += totalEarned;
        moneyDisplay.textContent = money;
        showFeedbackIndicator(tableEl || player, `+ $${basePrice}<br/>+ $${tipAmount} tip!`, "positive");
        cust.moodIndicator.textContent = '😋';
        const bubble = cust.element.querySelector('.speech-bubble');
        if (bubble) bubble.innerHTML = "Grazie! 👌";
        if (tableEl) {
            tableEl.classList.remove('table-highlight', 'table-leaving-soon');
        }
        carryingFood = null; carryingFoodIcon = null; carryingDisplay.innerHTML = '';
        deliveryRadius.classList.remove('active');
        if (debugMode) debugFood.textContent = "None";
        if (cust.element) {
            cust.element.style.transition = 'opacity 1s ease 0.5s';
            cust.element.style.opacity = '0';
        }
        setTimeout(() => {
            if (cust.element && cust.element.parentNode) {
                cust.element.remove();
            }
            cust.state = 'remove';
        }, 1500);
    }

    function updateCustomerMood(cust) { // Plays impatient sound now
        if (!cust.moodIndicator) return;
        const patienceRatio = Math.max(0, cust.patienceCurrent) / cust.patienceTotal;
        let newMood = moodEmojis.happy;
        if (patienceRatio <= 0.2) newMood = moodEmojis.angry;
        else if (patienceRatio <= 0.5) newMood = moodEmojis.impatient;
        else if (patienceRatio <= 0.8) newMood = moodEmojis.neutral;

        // Only update and play sound if the mood actually changes to impatient/angry
        const oldMood = cust.moodIndicator.textContent;
        if (newMood !== oldMood) {
             cust.moodIndicator.textContent = newMood;
             // Play sound when becoming impatient or angry
             if (newMood === moodEmojis.impatient || newMood === moodEmojis.angry) {
                 playSound(sfxImpatient);
             }
        }
    }

    function clearCustomersAndIndicators() {
        customers.forEach(c => {
            if (c.element && c.element.parentNode) {
                c.element.remove();
            }
        });
        customers = [];
        document.querySelectorAll('.money-indicator, .feedback-indicator').forEach(el => el.remove());
        diningArea.querySelectorAll('.table').forEach(t => {
            t.classList.remove('table-highlight', 'table-leaving-soon');
        });
    }

    function showFeedbackIndicator(tEl, txt, typ = "info", dur = 1800) {
        if (!tEl) return;
        const ind = document.createElement('div');
        ind.className = 'feedback-indicator';
        if (typ === "negative") ind.classList.add('negative');
        else if (typ === "positive") ind.classList.add('positive');
        ind.innerHTML = txt;
        const cont = restaurantArea; cont.appendChild(ind);
        const tR = tEl.getBoundingClientRect(); const cR = cont.getBoundingClientRect();
        ind.style.position = 'absolute';
        ind.style.left = `${tR.left - cR.left + tR.width / 2}px`;
        ind.style.top = `${tR.top - cR.top + tR.height / 2 - 20}px`;
        ind.style.animation = `float-up-fade ${dur / 1000}s forwards ease-out`;
        setTimeout(() => { if (ind.parentNode) ind.remove(); }, dur);
    }

    // --- Event Logic ---
    function triggerRandomEvent() {
        if (!gameRunning || isPaused || !eventModal.classList.contains('hidden') || randomEvents.length === 0) return;
        let eventIndex;
        if (randomEvents.length > 1) {
            do { eventIndex = Math.floor(Math.random() * randomEvents.length); } while (eventIndex === lastEventIndex);
        } else { eventIndex = 0; }
        lastEventIndex = eventIndex;
        const event = randomEvents[eventIndex];
        console.log("Triggering random event:", event.title);
        pauseGame();
        eventTitle.textContent = event.title; eventDescription.textContent = event.description;
        eventOptionsContainer.innerHTML = '';
        event.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt.text;
            btn.dataset.effectMoney = opt.effect.money; btn.dataset.effectTime = opt.effect.time;
            btn.dataset.feedback = opt.feedback;
            if (event.title === "Kitchen Emergency!" && opt.text.includes("Work Around It")) {
                btn.dataset.stateChange = 'ovenBroken';
            }
            btn.addEventListener('click', handleEventChoice);
            eventOptionsContainer.appendChild(btn);
        });
        eventModal.classList.remove('hidden');
    }

    function handleEventChoice(e) {
        playSound(sfxClick); // Play generic click for button press
        const btn = e.target;
        const mE = parseInt(btn.dataset.effectMoney || '0');
        const tE = parseInt(btn.dataset.effectTime || '0');
        const fb = btn.dataset.feedback || "Okay.";
        const stateChange = btn.dataset.stateChange;

        money += mE; timeLeft += tE; money = Math.max(0, money); timeLeft = Math.max(0, timeLeft);
        moneyDisplay.textContent = money; timerDisplay.textContent = timeLeft;
        showFeedbackIndicator(player, fb, (mE < 0 || tE < 0) ? "negative" : "info");

        if (stateChange === 'ovenBroken') {
            isOvenBroken = true;
            console.log("EVENT: Oven is now broken!");
            disableOvenStations(true);
        }

        eventModal.classList.add('hidden');
        if (timeLeft > 0 && gameRunning) {
            resumeGame();
        } else if (timeLeft <= 0) {
            endGame();
        }
    }

    function disableOvenStations(disable) {
        console.log(`Setting oven stations disabled state: ${disable}`);
        foodStations.forEach(station => {
            const foodId = station.dataset.item;
            if (OVEN_ITEMS.includes(foodId)) {
                station.style.opacity = disable ? '0.5' : '1';
                station.style.cursor = disable ? 'not-allowed' : 'pointer';
                if(disable) { station.title = "Oven Broken!"; } else { station.title = ""; }
            }
        });
    }

    // --- Initialization ---
    function initializeGameVisuals() {
        if (restaurantArea.offsetWidth > 0) {
            const plyH = player.offsetHeight / 2 || 35; const plyW = player.offsetWidth / 2 || 25;
            playerPosition.x = restaurantArea.offsetWidth / 2; playerPosition.y = restaurantArea.offsetHeight - plyH - 10;
            updatePlayerPosition(); player.style.opacity = '1'; player.style.display = 'flex';
        } else { setTimeout(initializeGameVisuals, 100); return; }
        gameOverScreen.classList.add('hidden'); menuModal.classList.add('hidden'); eventModal.classList.add('hidden'); gameWonModal.classList.add('hidden');
        debugInfo.classList.toggle('hidden', !debugMode); debugFood.textContent = 'None';
        try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; } catch(e) { console.error("Error setting BG in init:", e)}
        console.log("Initial game visuals set.");
    }

    // --- Start ---
    initializeGameVisuals();
    setTimeout(() => { if (!gameRunning) { startGame(); } }, 150);

}); // End DOMContentLoaded
