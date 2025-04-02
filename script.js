document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const player = document.getElementById('player');
    const carryingDisplay = document.getElementById('carrying');
    const moneyDisplay = document.getElementById('money');
    const timerDisplay = document.getElementById('timer');
    const levelDisplay = document.getElementById('level');
    // startBtn removed
    const restartBtn = document.getElementById('restart-btn'); // Keep for game over modal? Or replace? Using new buttons now.
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
    let carryingFoodEmoji = null;
    let customers = [];
    let timerInterval = null;
    let customerSpawnTimeout = null;
    let customerPatienceBase = 35;
    let level = 1; // Start at level 1
    const maxLevel = 5; // <<< Define the final level
    let playerPosition = { x: 0, y: 0 };
    let isMoving = false;
    let animationFrameId = null;
    let debugMode = false;
    // Use thresholds as WIN condition for PREVIOUS level
    // levelThresholds[0] = 0 (start)
    // To beat level 1, need >= levelThresholds[1] = $75
    // To beat level 2, need >= levelThresholds[2] = $180
    // etc.
    let levelThresholds = [0, 75, 180, 300, 450, 650]; // Needs target for level 5 win (index 5)
    const BACKGROUND_IMAGE_URL = 'assets/backdrop.png';
    let readyItemsOnPass = [];
    let lastEventIndex = -1;

    // --- Game Configuration ---
    const foodItems = { /* ... (full foodItems object) ... */
        'Bread Basket': { emoji: '🍞', price: 5, category: 'Appetizers', prepTime: 1 },'Cherry Tomato & Garlic Confit': { emoji: '🍅', price: 12, category: 'Appetizers', prepTime: 2 },'Whipped Ricotta': { emoji: '🧀', price: 14, category: 'Appetizers', prepTime: 2 },'Marinated Olives': { emoji: '🫒', price: 6, category: 'Appetizers', prepTime: 1 },'Crispy Gnudi': { emoji: '🍝', price: 12, category: 'Appetizers', prepTime: 3.5 },'House Salad': { emoji: '🥗', price: 12, category: 'Salads', prepTime: 2.5 },'Spicy Caesar Salad': { emoji: '🥗', price: 14, category: 'Salads', prepTime: 3 },'Cacio e Pepe': { emoji: '🍝', price: 20, category: 'Pasta', prepTime: 4 },'Seeing Red Pesto': { emoji: '🌶️', price: 24, category: 'Pasta', prepTime: 4 },'Short Rib Agnolotti': { emoji: '🥟', price: 32, category: 'Pasta', prepTime: 5 },'Pomodoro': { emoji: '🍝', price: 26, category: 'Pasta', prepTime: 3.5 },'Tomato Pie Slice': { emoji: '🍕', price: 5, category: 'Pizza', prepTime: 3 },'Tre Sale Slice': { emoji: '🍕', price: 6, category: 'Pizza', prepTime: 3.5 },'Garlic Girl': { emoji: '🍕', price: 25, category: 'Pizza', prepTime: 4.5 },'Toni Roni': { emoji: '🍕', price: 26, category: 'Pizza', prepTime: 5 },'Chicken Cutlets': { emoji: '🍗', price: 28, category: 'Mains', prepTime: 5 },'Roasted Half-Chicken': { emoji: '🐔', price: 34, category: 'Mains', prepTime: 7 },'Grilled Salmon': { emoji: '🐟', price: 36, category: 'Mains', prepTime: 4.5 },'Hanger Steak': { emoji: '🥩', price: 38, category: 'Mains', prepTime: 6 },'Mushroom Risotto': { emoji: '🍄', price: 12, category: 'Sides', prepTime: 5 },'Crispy Polenta': { emoji: '🌽', price: 10, category: 'Sides', prepTime: 4 },'Mashed Potatoes': { emoji: '🥔', price: 10, category: 'Sides', prepTime: 3 },'Shoestring Fries': { emoji: '🍟', price: 6, category: 'Sides', prepTime: 2.5 },'Grilled Asparagus': { emoji: '🍢', price: 8, category: 'Sides', prepTime: 3 },'Water': { emoji: '💧', price: 0, category: 'Drinks', prepTime: 0.5 },'Wine': { emoji: '🍷', price: 12, category: 'Drinks', prepTime: 0.5 },'Soda': { emoji: '🥤', price: 3, category: 'Drinks', prepTime: 0.5 }
    };
    const customerEmojis = ['👩','👨','👵','👴','👱‍♀️','👱','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','🧑‍🎄','👸','👨‍🎨','👩‍🔬','💂','🕵️'];
    const moodEmojis = { happy: '😊', neutral: '😐', impatient: '😠', angry: '😡' };
    const randomEvents = [ /* ... (full randomEvents array including new ones) ... */
         { title: "Customer Complaint!", description: "A customer says their Cacio e Pepe is too peppery!", options: [ { text: "Apologize & Offer free drink (-$3)", effect: { money: -3, time: 0 }, feedback: "Comped a soda." }, { text: "Remake the dish (Lose time)", effect: { money: 0, time: -10 }, feedback: "Remade the pasta (-10s)." }, { text: "Argue politely (Risk anger)", effect: { money: 0, time: 0 }, feedback: "Defended the chef!" } ] }, { title: "Kitchen Emergency!", description: "The oven suddenly stopped working!", options: [ { text: "Quick Fix Attempt (-$20, -15s)", effect: { money: -20, time: -15 }, feedback: "Paid for quick fix (-$20, -15s)." }, { text: "Work Around It (No Pizza/Roast)", effect: { money: 0, time: 0 }, feedback: "No oven dishes for now..." }, { text: "Ignore It (Riskier)", effect: { money: 0, time: 0 }, feedback: "Ignored the oven..." } ] }, { title: "Ingredient Shortage", description: "Oh no! We're running low on fresh basil for Pomodoro!", options: [ { text: "Buy Emergency Basil (-$15)", effect: { money: -15, time: 0 }, feedback: "Bought expensive basil (-$15)." }, { text: "Improvise (Use dried herbs)", effect: { money: 0, time: 0 }, feedback: "Substituted herbs..." }, { text: "Stop serving Pomodoro", effect: { money: 0, time: 0 }, feedback: "Took Pomodoro off menu." } ] }, { title: "VIP Guest", description: "A famous food critic just sat down!", options: [ { text: "Offer Free Appetizer (-$10)", effect: { money: -10, time: 0 }, feedback: "Comped critic appetizer (-$10)." }, { text: "Chef's Special Attention (-10s)", effect: { money: 0, time: -10 }, feedback: "Chef gave extra attention (-10s)." }, { text: "Treat Like Normal", effect: { money: 0, time: 0 }, feedback: "Treated critic normally." } ] }, { title: "Sudden Rush!", description: "A big group just walked in! Faster service needed!", options: [ { text: "Work Faster! (Bonus Time)", effect: { money: 0, time: +15 }, feedback: "Rush handled! (+15s)" }, { text: "Stay Calm (Risk Anger)", effect: { money: 0, time: 0 }, feedback: "Kept cool under pressure." } ] }, { title: "Generous Tipper", description: "A customer was so impressed they left a huge tip!", options: [ { text: "Awesome! (+$25)", effect: { money: +25, time: 0 }, feedback: "Wow! +$25 Tip!" } ] }, { title: "Spill in the Kitchen!", description: "Someone dropped a tray of sauce!", options: [ { text: "Clean it Up (-10s)", effect: { money: 0, time: -10 }, feedback: "Cleaned up the mess (-10s)." }, { text: "Work Around It (Carefully!)", effect: { money: 0, time: 0 }, feedback: "Carefully avoiding the spill..." } ] }, { title: "Health Inspector!", description: "A surprise visit! Everything needs to be perfect.", options: [ { text: "Brief Pause & Tidy (-5s)", effect: { money: 0, time: -5 }, feedback: "Quick tidy for inspector (-5s)." }, { text: "Bribe? (-$50, Risky)", effect: { money: -50, time: 0}, feedback: "Attempted a 'tip' (-$50)..."} ]}
    ];


    // --- Helper Functions ---
    function animatePrepProgress(progressBarElement, durationMs, onComplete) { /* ... as before ... */ }
    function addFoodToPass(foodId) { /* ... as before ... */ }

    // --- NEW: Generate Tables Function ---
    function generateTables(container, numTables) {
        container.innerHTML = ''; // Clear existing tables
        const numCols = 3;
        const rowPositions = [38, 80]; // Top percentages
        const colPositions = [18, 50, 82]; // Left percentages

        for (let i = 0; i < numTables; i++) {
            const table = document.createElement('div');
            table.classList.add('table');
            const tableIdNum = i + 1;
            table.id = `table-${tableIdNum}`;
            table.dataset.table = tableIdNum;
            const seat = document.createElement('div'); seat.classList.add('seat'); table.appendChild(seat);

            const row = Math.floor(i / numCols); const col = i % numCols;
            if (row < rowPositions.length && col < colPositions.length) {
                table.style.top = `${rowPositions[row]}%`;
                table.style.left = `${colPositions[col]}%`;
                table.style.transform = 'translate(-50%, -50%)';
            } else { table.style.top = '10px'; table.style.left = '10px'; } // Fallback
            container.appendChild(table);
        }
        console.log(`Generated ${numTables} tables for level ${level}.`);
    }

    // --- Event Listeners ---
    // No startBtn listener needed
    // restartBtn listener removed as we use specific modal buttons now
    if (closeMenuBtn) { // Check if menu elements exist
        closeMenuBtn.addEventListener('click', () => { menuModal.classList.add('hidden'); resumeGame(); });
        // Add tab logic back if menu is used
    }
    keysPressed = []; document.addEventListener('keydown', (e) => { /* ... debug mode logic ... */ });
    foodStations.forEach(station => { /* ... concurrent cooking listener ... */ });
    deliveryStation.addEventListener('click', (e) => { /* ... pickup listener ... */ });
    trashCan.addEventListener('click', () => { /* ... trash listener ... */ });
    diningArea.addEventListener('click', (e) => { /* ... table/background click listener (using event delegation) ... */ });

    // --- NEW Listeners for Modal Buttons ---
    nextLevelBtn.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        level++; // Increment level
        startGame(); // Start the next level
    });

    retryLevelBtn.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        // Don't change level, just restart
        startGame();
    });

    playAgainBtn.addEventListener('click', () => {
        gameWonModal.classList.add('hidden');
        level = 1; // Reset to level 1
        startGame();
    });


    // --- Core Functions ---

    function startGame() {
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
        carryingFood = null; carryingFoodEmoji = null; customers = []; isMoving = false;
        readyItemsOnPass = []; deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>';
        lastEventIndex = -1;

        console.log("--- startGame: State reset ---");
        moneyDisplay.textContent = money; levelDisplay.textContent = level; timerDisplay.textContent = timeLeft;
        carryingDisplay.textContent = ''; deliveryRadius.classList.remove('active'); debugFood.textContent = 'None';
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
        clearTimeout(customerSpawnTimeout); scheduleNextCustomer();
        console.log(`--- startGame: Level ${level} Started ---`);
    }

    function endGame() { // UPDATED for win/loss conditions
        console.log("Ending game/day...");
        gameRunning = false; isPaused = true; clearInterval(timerInterval); clearTimeout(customerSpawnTimeout);
        stopPlayerMovement();
        readyItemsOnPass = []; deliveryStation.innerHTML = '<div class="delivery-station-label">PASS</div>';
        tables.forEach(table => table.classList.remove('table-highlight', 'table-leaving-soon')); // Clear table states just in case

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

    // ... (pauseGame, resumeGame, gameTick as before) ...
     function pauseGame() { if (!gameRunning || isPaused) return; isPaused = true; clearInterval(timerInterval); stopPlayerMovement(); console.log("Game Paused"); }
     function resumeGame() { if (!gameRunning || !isPaused) return; isPaused = false; clearInterval(timerInterval); timerInterval = setInterval(gameTick, 1000); console.log("Game Resumed"); }
     function gameTick() { if (!gameRunning || isPaused) { clearInterval(timerInterval); return; } timeLeft--; timerDisplay.textContent = timeLeft; updateCustomers(); if (timeLeft <= 0) { endGame(); return; } if (Math.random() < 0.02) { triggerRandomEvent(); } } // Increased event chance

    // ... (updateCustomers with leaving soon logic as before) ...
    function updateCustomers() { if (isPaused) return; const now = Date.now(); const LEAVING_SOON_THRESHOLD = 5; customers.forEach((c) => { if (c.state === 'leaving' || c.state === 'served' || c.state === 'remove') return; const elapsed = (now - c.spawnTime) / 1000; c.patienceCurrent = Math.max(0, c.patienceTotal - elapsed); updateCustomerMood(c); const tableEl = diningArea.querySelector(`#${c.tableElement.id}`); if (!tableEl) return; if (c.patienceCurrent <= LEAVING_SOON_THRESHOLD && c.patienceCurrent > 0) { tableEl.classList.add('table-leaving-soon'); } else { tableEl.classList.remove('table-leaving-soon'); } if (c.patienceCurrent <= 0 && c.state === 'waiting') { customerLeavesAngry(c); } }); customers = customers.filter(c => c.state !== 'remove'); }
    function customerLeavesAngry(c) { if (c.state === 'leaving') return; console.log("Customer leaving angry:", c.id); c.state = 'leaving'; const tableEl = diningArea.querySelector(`#${c.tableElement.id}`); if (tableEl) tableEl.classList.remove('table-highlight', 'table-leaving-soon'); showFeedbackIndicator(tableEl || player, "Left Angry! 😡", "negative"); if (c.element) { c.element.style.transition = 'opacity 0.5s ease'; c.element.style.opacity = '0'; } setTimeout(() => { if (c.element && c.element.parentNode) c.element.remove(); c.state = 'remove'; }, 500); }

    // ... (movePlayerToElement, movePlayerToCoordinates, stopPlayerMovement, updatePlayerPosition as before) ...
      function movePlayerToElement(targetEl, callback = null) { if (isPaused || !targetEl) return; const restRect = restaurantArea.getBoundingClientRect(); const plyH = player.offsetHeight / 2 || 35; const plyW = player.offsetWidth / 2 || 25; let tX, tY; if (targetEl.closest('.kitchen-row')) { const sI = targetEl.closest('.food-station') || targetEl; const tR = sI.getBoundingClientRect(); const sCX_v = tR.left + tR.width / 2; tX = sCX_v - restRect.left; tY = restaurantArea.offsetHeight - plyH - 10; const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5; tX = Math.max(minX, Math.min(maxX, tX)); } else if (targetEl.closest('.table') || targetEl === deliveryStation || targetEl === trashCan) { const tE = targetEl.closest('.table') || (targetEl === deliveryStation ? deliveryStation : trashCan); const tR = tE.getBoundingClientRect(); tX = tR.left - restRect.left + tR.width / 2; tY = tR.top - restRect.top + tR.height / 2; } else { console.warn("Move target unknown:", targetEl); return; } movePlayerToCoordinates(tX, tY, callback); }
      function movePlayerToCoordinates(tX, tY, callback = null) { if (isPaused || isMoving) { return; }; isMoving = true; const sX = playerPosition.x; const sY = playerPosition.y; const dist = Math.hypot(tX - sX, tY - sY); if (dist < 1) { isMoving = false; if (callback) callback(); return; } const speed = 400; const dur = (dist / speed) * 1000; let startT = null; function step(time) { if (isPaused) { cancelAnimationFrame(animationFrameId); animationFrameId = null; isMoving = false; return; } if (!isMoving) { cancelAnimationFrame(animationFrameId); animationFrameId = null; return; } if (!startT) startT = time; const elap = time - startT; const prog = Math.min(1, elap / dur); playerPosition.x = sX + (tX - sX) * prog; playerPosition.y = sY + (tY - sY) * prog; updatePlayerPosition(); if (prog < 1) { animationFrameId = requestAnimationFrame(step); } else { playerPosition.x = tX; playerPosition.y = tY; updatePlayerPosition(); isMoving = false; animationFrameId = null; if (callback) { try { callback(); } catch (e) { console.error("Move CB Error:", e); } } } } cancelAnimationFrame(animationFrameId); animationFrameId = requestAnimationFrame(step); }
      function stopPlayerMovement() { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } isMoving = false; }
      function updatePlayerPosition() { const plyW = player.offsetWidth / 2 || 25; const plyH = player.offsetHeight / 2 || 35; const minX = plyW + 5; const maxX = restaurantArea.offsetWidth - plyW - 5; const minY = plyH + 5; const maxY = restaurantArea.offsetHeight - plyH - 5; playerPosition.x = Math.max(minX, Math.min(maxX, playerPosition.x)); playerPosition.y = Math.max(minY, Math.min(maxY, playerPosition.y)); player.style.transform = `translate(${playerPosition.x - plyW}px, ${playerPosition.y - plyH}px)`; deliveryRadius.style.left = `${playerPosition.x}px`; deliveryRadius.style.top = `${playerPosition.y}px`; }

    // ... (scheduleNextCustomer, spawnCustomer, serveCustomer, updateCustomerMood, checkLevelUp, clearCustomersAndIndicators) ...
      function scheduleNextCustomer() { if (!gameRunning || isPaused) return; clearTimeout(customerSpawnTimeout); const baseT = 6000, minT = 2500; const reduc = (level - 1) * 350; const delay = Math.max(minT, baseT - reduc); const randF = 0.8 + Math.random() * 0.4; customerSpawnTimeout = setTimeout(spawnCustomer, delay * randF); }
      function spawnCustomer() { if (!gameRunning || isPaused) return; const currentTables = Array.from(diningArea.querySelectorAll('.table')); const availT = currentTables.filter(t => !customers.some(c => c.tableElement === t && c.state !== 'leaving' && c.state !== 'remove')); if (availT.length > 0) { const t = availT[Math.floor(Math.random() * availT.length)]; const s = t.querySelector('.seat'); if (!s) { scheduleNextCustomer(); return; } const custEl = document.createElement('div'); custEl.className = 'customer'; custEl.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)]; custEl.style.opacity = '0'; const foods = Object.keys(foodItems); const order = foods[Math.floor(Math.random() * foods.length)]; const fData = foodItems[order]; const bub = document.createElement('div'); bub.className = 'speech-bubble'; bub.innerHTML = `<div class="dish-name">${order}</div><div class="dish-price">$${fData.price}</div><div class="dish-emoji">${fData.emoji}</div>`; bub.style.opacity = '0'; const moodI = document.createElement('div'); moodI.className = 'mood-indicator'; moodI.textContent = moodEmojis.happy; custEl.appendChild(moodI); custEl.appendChild(bub); s.appendChild(custEl); requestAnimationFrame(() => { custEl.style.opacity = '1'; bub.style.opacity = '1'; }); const cId = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`; const pat = Math.max(15, customerPatienceBase - (level - 1) * 2); const nC = { id: cId, element: custEl, tableElement: t, order: order, orderPrice: fData.price, spawnTime: Date.now(), patienceTotal: pat, patienceCurrent: pat, moodIndicator: moodI, state: 'waiting' }; customers.push(nC); t.classList.add('table-highlight'); } scheduleNextCustomer(); }
      function serveCustomer(cust) { if (!cust || cust.state !== 'waiting') return; cust.state = 'served'; const t = diningArea.querySelector(`#${cust.tableElement.id}`); const p = cust.orderPrice; const pR = Math.max(0, cust.patienceCurrent) / cust.patienceTotal; let tipM = 0.05; if (pR > 0.8) tipM = 0.20; else if (pR > 0.5) tipM = 0.15; else if (pR > 0.2) tipM = 0.10; const tipA = Math.ceil(p * tipM); const totE = p + tipA; money += totE; moneyDisplay.textContent = money; showFeedbackIndicator(t || player, `+ $${p}<br/>+ $${tipA} tip!`, "positive"); cust.moodIndicator.textContent = '😋'; const bub = cust.element.querySelector('.speech-bubble'); if (bub) bub.innerHTML = "Grazie! 👌"; if (t) t.classList.remove('table-highlight', 'table-leaving-soon'); carryingFood = null; carryingFoodEmoji = null; carryingDisplay.textContent = ''; deliveryRadius.classList.remove('active'); if (debugMode) debugFood.textContent = "None"; checkLevelUp(); if (cust.element) { cust.element.style.transition = 'opacity 1s ease 0.5s'; cust.element.style.opacity = '0'; } setTimeout(() => { if (cust.element && cust.element.parentNode) cust.element.remove(); cust.state = 'remove'; }, 1500); }
      function updateCustomerMood(cust) { if (!cust.moodIndicator) return; const pR = Math.max(0, cust.patienceCurrent) / cust.patienceTotal; let m = moodEmojis.happy; if (pR <= 0.2) m = moodEmojis.angry; else if (pR <= 0.5) m = moodEmojis.impatient; else if (pR <= 0.8) m = moodEmojis.neutral; cust.moodIndicator.textContent = m; }
      function checkLevelUp() { /* Removed level up logic - handled by endGame now */ }
      function clearCustomersAndIndicators() { customers.forEach(c => { if (c.element && c.element.parentNode) c.element.remove(); }); customers = []; document.querySelectorAll('.money-indicator, .feedback-indicator').forEach(el => el.remove()); diningArea.querySelectorAll('.table').forEach(t => { t.classList.remove('table-highlight', 'table-leaving-soon'); }); }

    // ... (Keep showFeedbackIndicator, triggerRandomEvent, handleEventChoice) ...
     function showFeedbackIndicator(tEl, txt, typ = "info", dur = 1800) { if (!tEl) return; const ind = document.createElement('div'); ind.className = 'feedback-indicator'; if (typ === "negative") ind.classList.add('negative'); else if (typ === "positive") ind.classList.add('positive'); ind.innerHTML = txt; const cont = restaurantArea; cont.appendChild(ind); const tR = tEl.getBoundingClientRect(); const cR = cont.getBoundingClientRect(); ind.style.position = 'absolute'; ind.style.left = `${tR.left - cR.left + tR.width / 2}px`; ind.style.top = `${tR.top - cR.top + tR.height / 2 - 20}px`; ind.style.animation = `float-up-fade ${dur / 1000}s forwards ease-out`; setTimeout(() => { if (ind.parentNode) ind.remove(); }, dur); }
     function triggerRandomEvent() { if (!gameRunning || isPaused || !eventModal.classList.contains('hidden') || randomEvents.length === 0) return; let eventIndex; if (randomEvents.length > 1) { do { eventIndex = Math.floor(Math.random() * randomEvents.length); } while (eventIndex === lastEventIndex); } else { eventIndex = 0; } lastEventIndex = eventIndex; const event = randomEvents[eventIndex]; console.log("Triggering random event:", event.title); pauseGame(); eventTitle.textContent = event.title; eventDescription.textContent = event.description; eventOptionsContainer.innerHTML = ''; event.options.forEach(opt => { const btn = document.createElement('button'); btn.textContent = opt.text; btn.dataset.effectMoney = opt.effect.money; btn.dataset.effectTime = opt.effect.time; btn.dataset.feedback = opt.feedback; btn.addEventListener('click', handleEventChoice); eventOptionsContainer.appendChild(btn); }); eventModal.classList.remove('hidden'); }
     function handleEventChoice(e) { const btn = e.target; const mE = parseInt(btn.dataset.effectMoney || '0'); const tE = parseInt(btn.dataset.effectTime || '0'); const fb = btn.dataset.feedback || "Okay."; money += mE; timeLeft += tE; money = Math.max(0, money); timeLeft = Math.max(0, timeLeft); moneyDisplay.textContent = money; timerDisplay.textContent = timeLeft; showFeedbackIndicator(player, fb, (mE < 0 || tE < 0) ? "negative" : "info"); eventModal.classList.add('hidden'); if (timeLeft > 0 && gameRunning) { resumeGame(); } else if (timeLeft <= 0) { endGame(); } }

    // ... (Keep populateMenuModal, getCategoryNameFromTabKey - only if menu is used) ...
    function populateMenuModal() { /* ... as before ... */ }
    function getCategoryNameFromTabKey(tK) { /* ... as before ... */ }

    // ... (Keep initializeGameVisuals - sets initial player pos, hides modals, ensures no startBtn) ...
    function initializeGameVisuals() { if (restaurantArea.offsetWidth > 0) { const plyH = player.offsetHeight / 2 || 35; const plyW = player.offsetWidth / 2 || 25; playerPosition.x = restaurantArea.offsetWidth / 2; playerPosition.y = restaurantArea.offsetHeight - plyH - 10; updatePlayerPosition(); player.style.opacity = '1'; player.style.display = 'flex'; } else { setTimeout(initializeGameVisuals, 100); return; } gameOverScreen.classList.add('hidden'); menuModal.classList.add('hidden'); eventModal.classList.add('hidden'); gameWonModal.classList.add('hidden'); debugInfo.classList.toggle('hidden', !debugMode); /* startBtn display not set */ try { restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`; if (!BACKGROUND_IMAGE_URL) { console.warn("BG URL missing!"); } else { console.log("Set background to:", BACKGROUND_IMAGE_URL);} } catch(e) { console.error("Error setting BG in init:", e)} console.log("Initial visuals set."); }

    // --- Initialize & Auto-Start ---
    initializeGameVisuals();
    setTimeout(() => { if (!gameRunning) { startGame(); } }, 150);

}); // End DOMContentLoaded
