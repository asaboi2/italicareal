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

    // Selectors for the new layout
    const restaurantArea = document.querySelector('.restaurant'); // Main game area (middle row)
    const diningArea = restaurantArea.querySelector('.dining-area'); // Area inside restaurant for tables/clicks
    const kitchenRow = document.querySelector('.kitchen-row'); // Bottom row container
    const foodStations = kitchenRow.querySelectorAll('.food-station'); // Stations within the bottom row

    const tables = diningArea.querySelectorAll('.table'); // Tables within diningArea

    // Modals and Menu elements
    const menuModal = document.getElementById('menu-modal');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const tabBtns = menuModal.querySelectorAll('.tab-btn');
    const menuSectionsContainer = menuModal.querySelector('.menu-sections'); // Container for sections

    // Debug and Event elements
    const debugInfo = document.getElementById('debug-info');
    const debugFood = document.getElementById('debug-food');
    const eventModal = document.getElementById('event-modal');
    const eventTitle = document.getElementById('event-title');
    const eventDescription = document.getElementById('event-description');
    const eventOptionsContainer = document.getElementById('event-options');

    // Create and append delivery radius to the restaurant area
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
    let customerPatienceBase = 35; // seconds
    let level = 1;
    let playerPosition = { x: 0, y: 0 }; // Logical center position
    let isMoving = false;
    let debugMode = false; // Toggle with 'debug' typed quickly
    let levelThresholds = [0, 75, 180, 300, 450, 650, 900, 1200, 1600]; // Money needed for levels 2, 3, ...
    const BACKGROUND_IMAGE_URL = 'assets/your-widescreen-backdrop.png'; // *** MAKE SURE THIS PATH IS CORRECT ***

    // --- Game Configuration ---
    const foodItems = {
        'Bread Basket': { emoji: '🍞', price: 5, category: 'Appetizers', prepTime: 1 },
        'Cherry Tomato & Garlic Confit': { emoji: '🍅', price: 12, category: 'Appetizers', prepTime: 2 },
        'Whipped Ricotta': { emoji: '🧀', price: 14, category: 'Appetizers', prepTime: 2 },
        'Marinated Olives': { emoji: '🫒', price: 6, category: 'Appetizers', prepTime: 1 },
        'Crispy Gnudi': { emoji: '🍝', price: 12, category: 'Appetizers', prepTime: 3.5 },
        'House Salad': { emoji: '🥗', price: 12, category: 'Salads', prepTime: 2.5 },
        'Spicy Caesar Salad': { emoji: '🥗', price: 14, category: 'Salads', prepTime: 3 },
        'Cacio e Pepe': { emoji: '🍝', price: 20, category: 'Pasta', prepTime: 4 },
        'Seeing Red Pesto': { emoji: '🌶️', price: 24, category: 'Pasta', prepTime: 4 },
        'Short Rib Agnolotti': { emoji: '🥟', price: 32, category: 'Pasta', prepTime: 5 },
        'Pomodoro': { emoji: '🍝', price: 26, category: 'Pasta', prepTime: 3.5 },
        'Tomato Pie Slice': { emoji: '🍕', price: 5, category: 'Pizza', prepTime: 3 },
        'Tre Sale Slice': { emoji: '🍕', price: 6, category: 'Pizza', prepTime: 3.5 },
        'Garlic Girl': { emoji: '🍕', price: 25, category: 'Pizza', prepTime: 4.5 },
        'Toni Roni': { emoji: '🍕', price: 26, category: 'Pizza', prepTime: 5 },
        'Chicken Cutlets': { emoji: '🍗', price: 28, category: 'Mains', prepTime: 5 },
        'Roasted Half-Chicken': { emoji: '🐔', price: 34, category: 'Mains', prepTime: 7 },
        'Grilled Salmon': { emoji: '🐟', price: 36, category: 'Mains', prepTime: 4.5 },
        'Hanger Steak': { emoji: '🥩', price: 38, category: 'Mains', prepTime: 6 },
        'Mushroom Risotto': { emoji: '🍄', price: 12, category: 'Sides', prepTime: 5 },
        'Crispy Polenta': { emoji: '🌽', price: 10, category: 'Sides', prepTime: 4 },
        'Mashed Potatoes': { emoji: '🥔', price: 10, category: 'Sides', prepTime: 3 },
        'Shoestring Fries': { emoji: '🍟', price: 6, category: 'Sides', prepTime: 2.5 },
        'Grilled Asparagus': { emoji: '🍢', price: 8, category: 'Sides', prepTime: 3 },
        'Water': { emoji: '💧', price: 0, category: 'Drinks', prepTime: 0.5 },
        'Wine': { emoji: '🍷', price: 12, category: 'Drinks', prepTime: 0.5 },
        'Soda': { emoji: '🥤', price: 3, category: 'Drinks', prepTime: 0.5 }
    };

    const customerEmojis = ['👩','👨','👵','👴','👱‍♀️','👱','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','🧑‍🎄','👸','👨‍🎨','👩‍🔬','💂','🕵️'];
    const moodEmojis = { happy: '😊', neutral: '😐', impatient: '😠', angry: '😡' };

    const randomEvents = [
        { title: "Customer Complaint!", description: "A customer says their Cacio e Pepe is too peppery!", options: [ { text: "Apologize & Offer free drink (-$3)", effect: { money: -3, time: 0 }, feedback: "Comped a soda." }, { text: "Remake the dish (Lose time)", effect: { money: 0, time: -10 }, feedback: "Remade the pasta (-10s)." }, { text: "Argue politely (Risk anger)", effect: { money: 0, time: 0 }, feedback: "Defended the chef!" } ] },
        { title: "Kitchen Emergency!", description: "The oven suddenly stopped working!", options: [ { text: "Quick Fix Attempt (-$20, -15s)", effect: { money: -20, time: -15 }, feedback: "Paid for quick fix (-$20, -15s)." }, { text: "Work Around It (No Pizza/Roast)", effect: { money: 0, time: 0 }, feedback: "No oven dishes for now..." }, { text: "Ignore It (Riskier)", effect: { money: 0, time: 0 }, feedback: "Ignored the oven..." } ] },
        { title: "Ingredient Shortage", description: "Oh no! We're running low on fresh basil for Pomodoro!", options: [ { text: "Buy Emergency Basil (-$15)", effect: { money: -15, time: 0 }, feedback: "Bought expensive basil (-$15)." }, { text: "Improvise (Use dried herbs)", effect: { money: 0, time: 0 }, feedback: "Substituted herbs..." }, { text: "Stop serving Pomodoro", effect: { money: 0, time: 0 }, feedback: "Took Pomodoro off menu." } ] },
        { title: "VIP Guest", description: "A famous food critic just sat down at Table 3!", options: [ { text: "Offer Free Appetizer (-$10)", effect: { money: -10, time: 0 }, feedback: "Comped critic appetizer (-$10)." }, { text: "Chef's Special Attention (-10s)", effect: { money: 0, time: -10 }, feedback: "Chef gave extra attention (-10s)." }, { text: "Treat Like Normal", effect: { money: 0, time: 0 }, feedback: "Treated critic normally." } ] }
    ];

    // --- Event Listeners ---
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        startGame();
    });
    menuBtn.addEventListener('click', () => {
        pauseGame();
        populateMenuModal(); // Populate menu when opened
        menuModal.classList.remove('hidden');
         // Activate the first tab by default
        if (tabBtns.length > 0) {
            const allSections = menuSectionsContainer.querySelectorAll('.menu-section');
            tabBtns.forEach(t => t.classList.remove('active'));
            allSections.forEach(s => s.classList.remove('active'));

            tabBtns[0].classList.add('active');
            const firstTabId = tabBtns[0].getAttribute('data-tab');
             const firstSection = menuSectionsContainer.querySelector(`.menu-section[data-section="${firstTabId}"]`);
            if (firstSection) firstSection.classList.add('active');
        }
    });
    closeMenuBtn.addEventListener('click', () => {
        menuModal.classList.add('hidden');
        resumeGame();
    });

    // Menu Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const allSections = menuSectionsContainer.querySelectorAll('.menu-section');
            tabBtns.forEach(tab => tab.classList.remove('active'));
            allSections.forEach(section => section.classList.remove('active')); // Hide all sections first

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            const targetSection = menuSectionsContainer.querySelector(`.menu-section[data-section="${tabId}"]`); // Use data-section attribute
            if(targetSection) {
                targetSection.classList.add('active');
            } else {
                console.warn("Menu section for tab", tabId, "not found!");
            }
        });
    });

    // Debug mode listener
    let keysPressed = [];
    document.addEventListener('keydown', (e) => {
        keysPressed.push(e.key.toLowerCase());
        keysPressed = keysPressed.slice(-5); // Keep only last 5 keys
        if (keysPressed.join('') === 'debug') {
            debugMode = !debugMode;
            debugInfo.classList.toggle('hidden', !debugMode);
            console.log('Debug mode:', debugMode);
        }
    });

    // Food station clicks (selecting from kitchenRow)
    foodStations.forEach(station => {
        station.addEventListener('click', () => {
            if (!gameRunning || isPaused || isMoving || station.classList.contains('preparing')) return;

            const foodId = station.getAttribute('data-item');
            if (!foodId || !foodItems[foodId]) {
                console.error("Invalid food station:", station);
                return;
            }

            const foodData = foodItems[foodId];
            const prepTime = foodData.prepTime * 1000; // Convert seconds to ms

            if (!carryingFood) {
                // Move player to the station's interaction point (bottom edge)
                movePlayerToElement(station, () => {
                    station.classList.add('preparing');
                    station.style.pointerEvents = 'none'; // Prevent clicking again while preparing

                    setTimeout(() => {
                        carryingFood = foodId;
                        carryingFoodEmoji = foodData.emoji;
                        carryingDisplay.textContent = carryingFoodEmoji;
                        deliveryRadius.classList.add('active'); // Show delivery radius
                        if (debugMode) debugFood.textContent = foodId;
                        station.classList.remove('preparing');
                        station.style.pointerEvents = 'auto'; // Re-enable clicking
                    }, prepTime);
                });
            } else {
                showFeedbackIndicator(player, "Hands full!", "negative");
            }
        });
    });

    // Click on dining area background to move
    diningArea.addEventListener('click', (e) => {
        if (!gameRunning || isPaused || isMoving) return;
        // Prevent moving if clicking on player, customer, or table itself
        if (e.target.closest('.customer') || e.target.closest('.table') || e.target.closest('.player')) {
            return;
        }

        // Calculate click position relative to the dining/restaurant area
        const rect = diningArea.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const targetY = e.clientY - rect.top;
        movePlayerToCoordinates(targetX, targetY); // Move directly to coordinates
    });

    // Click on tables
    tables.forEach(table => {
        table.addEventListener('click', (e) => {
            if (!gameRunning || isPaused || isMoving) return;
            // Don't trigger if clicking on an indicator bubble
            if (e.target.classList.contains('money-indicator') || e.target.classList.contains('feedback-indicator')) return;

            // Find if there's a waiting customer at this table
            const customerObj = customers.find(c => c.tableElement === table && c.state === 'waiting');

            // Move player to the table, THEN check interaction
            movePlayerToElement(table, () => {
                if (customerObj) {
                    if (carryingFood) {
                        // Check if carrying the correct food
                        if (carryingFood === customerObj.order) {
                            serveCustomer(customerObj);
                        } else {
                            // Wrong order! Penalize slightly
                            showFeedbackIndicator(table, "Wrong Order!", "negative");
                            if (debugMode) console.log(`Wrong! Have: ${carryingFood}, Want: ${customerObj.order}`);
                            // Reduce patience slightly for wrong order
                            customerObj.patienceCurrent = Math.max(0, customerObj.patienceCurrent - 5);
                            updateCustomerMood(customerObj); // Update mood indicator
                        }
                    }
                    // else: Player arrived at waiting customer but has no food - do nothing yet
                } else if (carryingFood) {
                    // Player arrived at table with food, but no one is waiting there
                    showFeedbackIndicator(table, "No one waiting!", "negative");
                    // Optional: Drop food back? For now, just feedback.
                }
                // else: Player arrived at empty table with no food - do nothing
            });
        });
    });


    // --- Core Functions ---

    function startGame() {
        console.log("Starting game...");
        // Reset State
        money = 0;
        level = 1;
        timeLeft = 180;
        gameRunning = true;
        isPaused = false;
        carryingFood = null;
        carryingFoodEmoji = null;
        customers = [];
        isMoving = false; // Ensure player isn't stuck in moving state

        // Update UI
        moneyDisplay.textContent = money;
        levelDisplay.textContent = level;
        timerDisplay.textContent = timeLeft;
        carryingDisplay.textContent = '';
        deliveryRadius.classList.remove('active');
        debugFood.textContent = 'None';
        startBtn.style.display = 'none'; // Hide start button
        gameOverScreen.classList.add('hidden');
        menuModal.classList.add('hidden');
        eventModal.classList.add('hidden');

        // Clear dynamic elements
        clearCustomersAndIndicators();
        stopPlayerMovement(); // Cancel any ongoing movement animations

        // Set Background (Ensure path is correct)
        restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`;
        if (!BACKGROUND_IMAGE_URL || BACKGROUND_IMAGE_URL === 'assets/your-widescreen-backdrop.png') {
             console.warn("BACKGROUND_IMAGE_URL is not set or is the default placeholder!");
        }

        // Initialize Player Position and Visibility (runs after DOM is ready)
        initializeGameVisuals(); // Separate function for visual setup

        // Start Timers
        clearInterval(timerInterval); // Clear any previous interval
        timerInterval = setInterval(gameTick, 1000);
        clearTimeout(customerSpawnTimeout); // Clear any previous timeout
        scheduleNextCustomer();
        console.log("Game started.");
    }

    function endGame() {
        console.log("Ending game...");
        gameRunning = false;
        isPaused = true; // Effectively pause everything
        clearInterval(timerInterval);
        clearTimeout(customerSpawnTimeout); // Stop new customers
        stopPlayerMovement(); // Stop player movement if any

        // Show game over screen
        finalScoreDisplay.textContent = money;
        gameOverScreen.classList.remove('hidden');
        startBtn.style.display = 'inline-block'; // Show start button again
        deliveryRadius.classList.remove('active'); // Hide delivery radius
        console.log("Game ended. Final Score:", money);
    }

    function pauseGame() {
        if (!gameRunning || isPaused) return; // Don't pause if already paused or not running
        isPaused = true;
        clearInterval(timerInterval); // Stop game clock
        // We also need to effectively pause customer patience decrease in updateCustomers()
        stopPlayerMovement(); // Stop player movement if any
        console.log("Game Paused");
    }

    function resumeGame() {
        if (!gameRunning || !isPaused) return; // Don't resume if not paused or not running
        isPaused = false;
        // Resume game clock
        clearInterval(timerInterval); // Clear just in case
        timerInterval = setInterval(gameTick, 1000);
        // Customer patience will resume decreasing in updateCustomers()
        console.log("Game Resumed");
    }

    function gameTick() {
        if (!gameRunning || isPaused) {
            // Should not happen if intervals are managed correctly, but good safeguard
            clearInterval(timerInterval);
            return;
        }

        timeLeft--;
        timerDisplay.textContent = timeLeft;

        updateCustomers(); // Decrease patience, check for angry leavers

        if (timeLeft <= 0) {
            endGame();
            return; // Stop further processing this tick
        }

        // Random event chance
        if (Math.random() < 0.01) { // 1% chance per second
            triggerRandomEvent();
        }
    }

    function updateCustomers() {
        if (isPaused) return; // Don't update patience if paused
        const now = Date.now();
        customers.forEach((customer) => {
            // Don't update customers who are already leaving or served
            if (customer.state === 'leaving' || customer.state === 'served' || customer.state === 'remove') return;

            // Calculate time elapsed since spawn for patience
            // Adjust spawnTime if game was paused? Simpler to just let it run based on real time.
            const timeElapsed = (now - customer.spawnTime) / 1000; // in seconds
            customer.patienceCurrent = Math.max(0, customer.patienceTotal - timeElapsed);

            updateCustomerMood(customer); // Update visual mood based on patience

            // Check if customer runs out of patience
            if (customer.patienceCurrent <= 0 && customer.state === 'waiting') {
                customerLeavesAngry(customer);
            }
        });

        // Clean up customers marked for removal
        customers = customers.filter(c => c.state !== 'remove');
    }

    function customerLeavesAngry(customer) {
        if (customer.state === 'leaving') return; // Already leaving

        console.log("Customer leaving angry:", customer.id);
        customer.state = 'leaving';
        customer.tableElement.classList.remove('table-highlight'); // Remove highlight
        showFeedbackIndicator(customer.tableElement, "Left Angry! 😡", "negative");

        // Fade out customer element
        if (customer.element) {
            customer.element.style.transition = 'opacity 0.5s ease';
            customer.element.style.opacity = '0';
        }

        // Remove after fade out
        setTimeout(() => {
            if (customer.element && customer.element.parentNode) {
                customer.element.remove();
            }
            customer.state = 'remove'; // Mark for filtering out of the main array
        }, 500); // Matches fade out duration
    }

    let animationFrameId = null; // Store the animation frame ID

    // *** UPDATED for 3-row layout ***
    function movePlayerToElement(targetElement, callback = null) {
        if (isPaused || !targetElement) return;

        const restaurantRect = restaurantArea.getBoundingClientRect();
        const playerHeightHalf = player.offsetHeight / 2;
        const playerWidthHalf = player.offsetWidth / 2;
        let targetX, targetY;

        // Check if the target is a food station (now in the kitchen row below)
        if (targetElement.closest('.kitchen-row')) { // Check if the element or its parent is the kitchen row
            // Target: Move player to the bottom edge of the restaurant area,
            // horizontally aligned with the clicked station.

            const targetRect = targetElement.getBoundingClientRect(); // Station's position relative to viewport

            // Calculate the target X: Align horizontally with the station's center, relative to restaurant area
            const stationCenterX_viewport = targetRect.left + targetRect.width / 2;
            targetX = stationCenterX_viewport - restaurantRect.left; // Convert to restaurant area coordinates

            // Calculate the target Y: Just inside the bottom edge of the restaurant area
            targetY = restaurantArea.offsetHeight - playerHeightHalf - 5; // Small padding from bottom

            // --- Clamp X coordinate ---
            const minX = playerWidthHalf + 5;
            const maxX = restaurantArea.offsetWidth - playerWidthHalf - 5;
            targetX = Math.max(minX, Math.min(maxX, targetX));
            // --- End Clamp ---

            if (debugMode) console.log(`Targeting bottom edge for ${targetElement.dataset.item}: X=${targetX}, Y=${targetY}`);

        } else if (targetElement.closest('.table')) {
             // Logic for moving to tables within the restaurant
             const tableElement = targetElement.closest('.table'); // Ensure we have the table element
             const targetRect = tableElement.getBoundingClientRect(); // Element's position relative to viewport
             targetX = targetRect.left - restaurantRect.left + targetRect.width / 2;
             targetY = targetRect.top - restaurantRect.top + targetRect.height / 2; // Aim for table center

            if (debugMode) console.log(`Targeting table ${tableElement.id}: X=${targetX}, Y=${targetY}`);

        } else {
             // Moving to background click coordinates (This function shouldn't be called for this)
             console.warn("movePlayerToElement called for unknown target type:", targetElement);
             return; // Don't move if target isn't known
        }

        // Initiate the movement to the calculated coordinates
        movePlayerToCoordinates(targetX, targetY, callback);
    }

    function movePlayerToCoordinates(targetX, targetY, callback = null) {
        if (isPaused || isMoving) return; // Don't start a new move if paused or already moving

        isMoving = true;
        const startX = playerPosition.x;
        const startY = playerPosition.y;
        const distance = Math.hypot(targetX - startX, targetY - startY);

        // If already very close, snap and execute callback immediately
        if (distance < 1) {
            isMoving = false;
            if (callback) callback();
            return;
        }

        const speed = 400; // Pixels per second
        const duration = (distance / speed) * 1000; // Duration in milliseconds
        let startTime = null;

        function step(timestamp) {
            if (isPaused) {
                // If paused mid-movement, cancel the frame and stop
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                isMoving = false; // Allow restarting movement later
                // console.log("Movement paused");
                return;
            }
            if (!isMoving) { // Check if movement was cancelled externally (e.g., stopPlayerMovement)
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                // console.log("Movement cancelled");
                return;
            }

            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(1, elapsed / duration); // Clamp progress to 1

            // Interpolate position (logical center)
            playerPosition.x = startX + (targetX - startX) * progress;
            playerPosition.y = startY + (targetY - startY) * progress;

            updatePlayerPosition(); // Apply new CSS position via transform

            if (progress < 1) {
                // Continue animation
                animationFrameId = requestAnimationFrame(step);
            } else {
                // Animation finished
                playerPosition.x = targetX; // Ensure exact final logical position
                playerPosition.y = targetY;
                updatePlayerPosition(); // Final update
                isMoving = false;
                animationFrameId = null; // Clear the ID
                if (callback) {
                    try {
                        callback(); // Execute the callback after movement completes
                    } catch (error) {
                        console.error("Error in move callback:", error);
                    }
                }
            }
        }

        // Cancel any existing animation frame before starting a new one
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(step);
    }

    function stopPlayerMovement() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        isMoving = false; // Mark as not moving
        // console.log("Requested move stop / Marked as not moving");
    }

    // *** UPDATED to use transform ***
    function updatePlayerPosition() {
        // Constrain player's logical center within the bounds of the restaurant area
        const playerWidthHalf = player.offsetWidth / 2;
        const playerHeightHalf = player.offsetHeight / 2;

        // Define boundaries based on logical center
        const minX = playerWidthHalf + 5; // Small left padding
        const maxX = restaurantArea.offsetWidth - playerWidthHalf - 5; // Small right padding
        const minY = playerHeightHalf + 5; // Small top padding
        const maxY = restaurantArea.offsetHeight - playerHeightHalf - 5; // Small bottom padding

        // Clamp calculated logical center position
        playerPosition.x = Math.max(minX, Math.min(maxX, playerPosition.x));
        playerPosition.y = Math.max(minY, Math.min(maxY, playerPosition.y));

        // Apply style using translate. Translate moves the element's top-left corner,
        // so we subtract half width/height to center the visual element over the logical position.
        player.style.transform = `translate(${playerPosition.x - playerWidthHalf}px, ${playerPosition.y - playerHeightHalf}px)`;

        // Update delivery radius position (centered on player's logical center)
        deliveryRadius.style.left = `${playerPosition.x}px`;
        deliveryRadius.style.top = `${playerPosition.y}px`;
    }


    function scheduleNextCustomer() {
        if (!gameRunning || isPaused) return; // Don't schedule if game not running or paused

        clearTimeout(customerSpawnTimeout); // Clear existing timeout if any

        // Base spawn time decreases slightly with level, but has a minimum
        const baseSpawnTime = 6000; // ms (6 seconds)
        const minSpawnTime = 2500; // ms (2.5 seconds)
        const spawnTimeReduction = (level - 1) * 350; // ms reduction per level
        const nextSpawnDelay = Math.max(minSpawnTime, baseSpawnTime - spawnTimeReduction);

        // Add some randomness to the spawn time
        const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
        customerSpawnTimeout = setTimeout(spawnCustomer, nextSpawnDelay * randomFactor);
    }

    function spawnCustomer() {
        if (!gameRunning || isPaused) return; // Check again before spawning

        // Find tables that are currently empty
        const availableTables = Array.from(tables).filter(table =>
            !customers.some(c => c.tableElement === table && c.state !== 'leaving' && c.state !== 'remove')
        );

        if (availableTables.length > 0) {
            const table = availableTables[Math.floor(Math.random() * availableTables.length)];
            const seat = table.querySelector('.seat'); // Get the designated seat area

            if (!seat) {
                console.error("Table found, but seat element is missing:", table.id);
                scheduleNextCustomer(); // Try again later
                return;
            }

            // Create customer element
            const customerElement = document.createElement('div');
            customerElement.className = 'customer';
            customerElement.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)];
            customerElement.style.opacity = '0'; // Start invisible for fade-in

            // Choose a random order
            const availableFood = Object.keys(foodItems);
            const orderedFood = availableFood[Math.floor(Math.random() * availableFood.length)];
            const foodData = foodItems[orderedFood];

            // Create speech bubble
            const speechBubble = document.createElement('div');
            speechBubble.className = 'speech-bubble';
            speechBubble.innerHTML = `<div class="dish-name">${orderedFood}</div><div class="dish-price">$${foodData.price}</div><div class="dish-emoji">${foodData.emoji}</div>`;
            speechBubble.style.opacity = '0'; // Also start invisible

            // Create mood indicator
            const moodIndicator = document.createElement('div');
            moodIndicator.className = 'mood-indicator';
            moodIndicator.textContent = moodEmojis.happy; // Start happy

            // Append elements
            customerElement.appendChild(moodIndicator);
            customerElement.appendChild(speechBubble);
            seat.appendChild(customerElement); // Add customer to the seat

            // Fade in effect using CSS transition (triggered by changing opacity)
            requestAnimationFrame(() => { // Ensure styles are applied before transition starts
                customerElement.style.opacity = '1';
                speechBubble.style.opacity = '1'; // Speech bubble fades in slightly delayed via CSS
            });


            // Create customer object in state
            const customerId = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const patience = Math.max(15, customerPatienceBase - (level - 1) * 2); // Patience decreases with level (min 15s)

            const newCustomer = {
                id: customerId,
                element: customerElement,
                tableElement: table,
                order: orderedFood,
                orderPrice: foodData.price,
                spawnTime: Date.now(),
                patienceTotal: patience,
                patienceCurrent: patience, // Starts full
                moodIndicator: moodIndicator,
                state: 'waiting' // Initial state
            };
            customers.push(newCustomer);

            table.classList.add('table-highlight'); // Highlight the table
            if (debugMode) console.log("Customer spawned:", newCustomer.id, "at table", table.id, "ordering", orderedFood);
        }
        // else { if(debugMode) console.log("No available tables to spawn customer."); }

        scheduleNextCustomer(); // Schedule the next one regardless
    }

    function serveCustomer(customer) {
        if (!customer || customer.state !== 'waiting') return; // Can only serve waiting customers

        // console.log("Serving customer:", customer.id);
        customer.state = 'served'; // Change state

        const table = customer.tableElement;
        const price = customer.orderPrice;

        // Calculate tip based on remaining patience ratio
        const patienceRatio = Math.max(0, customer.patienceCurrent) / customer.patienceTotal;
        let tipMultiplier = 0.05; // Base tip
        if (patienceRatio > 0.8) tipMultiplier = 0.20;      // Excellent service
        else if (patienceRatio > 0.5) tipMultiplier = 0.15; // Good service
        else if (patienceRatio > 0.2) tipMultiplier = 0.10; // Okay service

        const tipAmount = Math.ceil(price * tipMultiplier); // Round tip up
        const totalEarned = price + tipAmount;

        // Update game state
        money += totalEarned;
        moneyDisplay.textContent = money;

        // Show feedback
        showFeedbackIndicator(table, `+ $${price}<br/>+ $${tipAmount} tip!`, "positive");

        // Update customer visuals
        customer.moodIndicator.textContent = '😋'; // Happy eating face
        const speechBubble = customer.element.querySelector('.speech-bubble');
        if (speechBubble) speechBubble.innerHTML = "Grazie! 👌"; // Thank you message

        table.classList.remove('table-highlight'); // Remove highlight

        // Clear player's hands
        carryingFood = null;
        carryingFoodEmoji = null;
        carryingDisplay.textContent = '';
        deliveryRadius.classList.remove('active');
        if (debugMode) debugFood.textContent = "None";

        checkLevelUp(); // Check if this earning triggers a level up

        // Make customer fade slightly and then remove
         if (customer.element) {
             customer.element.style.transition = 'opacity 1s ease 0.5s'; // Start fade after 0.5s
             customer.element.style.opacity = '0'; // Fade out
         }
         setTimeout(() => {
           if (customer.element && customer.element.parentNode) {
               customer.element.remove(); // Remove from DOM
           }
           customer.state = 'remove'; // Mark for removal from array
         }, 1500); // Remove after fade (1s fade + 0.5s delay)
    }

    function updateCustomerMood(customer) {
        // Update mood indicator emoji based on current patience ratio
        if (!customer.moodIndicator) return; // Safety check
        const patienceRatio = Math.max(0, customer.patienceCurrent) / customer.patienceTotal;
        let mood = moodEmojis.happy;
        if (patienceRatio <= 0.2) mood = moodEmojis.angry;
        else if (patienceRatio <= 0.5) mood = moodEmojis.impatient;
        else if (patienceRatio <= 0.8) mood = moodEmojis.neutral;
        customer.moodIndicator.textContent = mood;
    }

    function checkLevelUp() {
        // Level up based on cumulative money earned
        const nextLevelIndex = level; // Current level is index for next threshold
        if (nextLevelIndex >= levelThresholds.length) return; // Already max level

        const moneyNeeded = levelThresholds[nextLevelIndex];

        if (money >= moneyNeeded) {
            level++;
            levelDisplay.textContent = level;
            timeLeft += 20; // Bonus time for leveling up
            timerDisplay.textContent = timeLeft;
            showFeedbackIndicator(player, `Level Up! ${level} (+20s)`, "positive", 2500); // Longer display for level up
            console.log("Level Up! Reached level", level);
            // Potentially increase difficulty (handled via spawn/patience logic using 'level')
        }
    }

    function clearCustomersAndIndicators() {
        // console.log("Clearing customers and indicators...");
        // Remove customer elements from DOM
        customers.forEach(customer => {
            if (customer.element && customer.element.parentNode) {
                customer.element.remove();
            }
        });
        customers = []; // Reset customer array

        // Remove any lingering feedback/money indicators
        document.querySelectorAll('.money-indicator, .feedback-indicator').forEach(el => el.remove());

        // Remove table highlights
        tables.forEach(table => table.classList.remove('table-highlight'));
    }

    function showFeedbackIndicator(targetElement, text, type = "info", duration = 1800) {
        const indicator = document.createElement('div');
        indicator.className = 'feedback-indicator'; // Base class

        // Add type class for styling
        if (type === "negative") indicator.classList.add('negative');
        else if (type === "positive") indicator.classList.add('positive');
        // 'info' type doesn't need a special class unless styled

        indicator.innerHTML = text; // Use innerHTML to allow line breaks (<br/>)

        // Append to the restaurant area for consistent positioning relative to game space
        const container = restaurantArea; // Append to main game area
        container.appendChild(indicator);

        // Position the indicator near the target element's center
        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        indicator.style.position = 'absolute';
        // Center horizontally relative to target's center in container
        indicator.style.left = `${targetRect.left - containerRect.left + targetRect.width / 2}px`;
        // Position slightly above the target's center in container
        indicator.style.top = `${targetRect.top - containerRect.top + targetRect.height / 2 - 20}px`; // Adjust vertical offset

        // Apply animation class (defined in CSS)
        indicator.style.animation = `float-up-fade ${duration / 1000}s forwards ease-out`;

        // Remove the element after animation completes
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, duration);
    }

    function triggerRandomEvent() {
        if (!gameRunning || isPaused || !eventModal.classList.contains('hidden')) return; // Don't trigger if paused, game over, or modal already showing

        console.log("Triggering random event...");
        pauseGame(); // Pause game during event

        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        eventTitle.textContent = event.title;
        eventDescription.textContent = event.description;
        eventOptionsContainer.innerHTML = ''; // Clear previous options

        // Create buttons for options
        event.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            // Store effect data on the button using dataset attributes
            button.dataset.effectMoney = option.effect.money;
            button.dataset.effectTime = option.effect.time;
            button.dataset.feedback = option.feedback;
            button.addEventListener('click', handleEventChoice);
            eventOptionsContainer.appendChild(button);
        });

        eventModal.classList.remove('hidden'); // Show the modal
    }

    function handleEventChoice(e) {
        const button = e.target;
        const moneyEffect = parseInt(button.dataset.effectMoney || '0');
        const timeEffect = parseInt(button.dataset.effectTime || '0');
        const feedback = button.dataset.feedback || "Okay.";

        console.log(`Event choice: ${button.textContent}, Effect: Money ${moneyEffect}, Time ${timeEffect}`);

        // Apply effects
        money += moneyEffect;
        timeLeft += timeEffect;

        // Ensure money/time don't go below zero
        money = Math.max(0, money);
        timeLeft = Math.max(0, timeLeft);

        // Update UI
        moneyDisplay.textContent = money;
        timerDisplay.textContent = timeLeft;

        // Show feedback for the choice
        showFeedbackIndicator(player, feedback, (moneyEffect < 0 || timeEffect < 0) ? "negative" : "info");

        eventModal.classList.add('hidden'); // Hide modal
        if(timeLeft > 0 && gameRunning) { // Only resume if the event didn't end the game time and game is running
          resumeGame(); // Resume game
        } else if (timeLeft <= 0) {
          endGame(); // If time ran out due to event, end the game
        }
    }

    // --- Menu Modal Population ---
    function populateMenuModal() {
        menuSectionsContainer.innerHTML = ''; // Clear existing content

        const categories = {};
        // Group food items by category
        for (const itemName in foodItems) {
            const item = foodItems[itemName];
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            // Include name with the item data
            categories[item.category].push({ name: itemName, ...item });
        }

        // Get the order of tabs from the DOM
        const tabOrder = Array.from(tabBtns).map(btn => btn.getAttribute('data-tab'));

        // Create sections based on tab order
        tabOrder.forEach(tabKey => {
            const categoryName = getCategoryNameFromTabKey(tabKey); // Helper to map e.g., 'appetizers' -> 'Appetizers'
            let itemsInCategory = [];

            // Handle combined categories like "Mains & Sides" if needed
            if (tabKey === 'mains') { // Example: Combining Mains and Sides under one tab
                 itemsInCategory = [...(categories['Mains'] || []), ...(categories['Sides'] || [])];
                 if (!itemsInCategory.length) categoryName = null; // Don't create section if empty
            } else {
                 itemsInCategory = categories[categoryName];
            }


            if (itemsInCategory && itemsInCategory.length > 0) {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'menu-section';
                sectionDiv.setAttribute('data-section', tabKey); // Link section to tab

                // Optionally add category title within the section if not combining
                // if (tabKey !== 'mains') { // Example check
                //     const title = document.createElement('h4');
                //     title.textContent = categoryName;
                //     sectionDiv.appendChild(title);
                // }


                itemsInCategory.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'menu-item';
                    // Customize how each item is displayed in the menu
                    itemDiv.innerHTML = `
                        <h5>${item.name} ${item.emoji} - $${item.price}</h5>
                        <p>Prep Time: ${item.prepTime}s</p>
                        <!-- Add description if available in foodItems object -->
                    `;
                    sectionDiv.appendChild(itemDiv);
                });
                menuSectionsContainer.appendChild(sectionDiv);
            } else if (debugMode && categoryName) {
                console.log(`No items found for category: ${categoryName} (tab: ${tabKey})`);
            }
        });

        // Ensure at least one section is active if populated
        const firstActiveSection = menuSectionsContainer.querySelector('.menu-section');
        if(firstActiveSection) {
             // This activation logic is now handled in the menuBtn click listener
             // firstActiveSection.classList.add('active');
        }
    }

    function getCategoryNameFromTabKey(tabKey) {
        // Simple mapping based on your categories and tabs
        switch(tabKey) {
            case 'appetizers': return 'Appetizers';
            case 'salads': return 'Salads';
            case 'pasta': return 'Pasta';
            case 'pizza': return 'Pizza';
            case 'mains': return 'Mains'; // This tab might represent multiple categories
            case 'sides': return 'Sides';
            case 'drinks': return 'Drinks';
            default: return tabKey.charAt(0).toUpperCase() + tabKey.slice(1); // Default guess
        }
    }

    // --- Initial Setup ---
    function initializeGameVisuals() {
         // Set initial player position (needs restaurantArea dimensions)
        if (restaurantArea.offsetWidth > 0) {
             const playerHeightHalf = player.offsetHeight / 2 || 35; // Get actual height or fallback
             const playerWidthHalf = player.offsetWidth / 2 || 25;
             playerPosition.x = restaurantArea.offsetWidth / 2;
             playerPosition.y = restaurantArea.offsetHeight - playerHeightHalf - 10; // Start near bottom-center
             updatePlayerPosition(); // Apply initial position via transform
             player.style.opacity = '1'; // Show player initially
             player.style.display = 'flex';
        } else {
             // Fallback or wait for layout calculation if needed
             console.warn("Restaurant area dimensions not ready on init. Player position might be off.");
             setTimeout(initializeGameVisuals, 100); // Retry after 100ms
             return; // Stop further execution this time
        }

        // Hide modals and show start button (redundant if called from startGame, but safe)
        gameOverScreen.classList.add('hidden');
        menuModal.classList.add('hidden');
        eventModal.classList.add('hidden');
        debugInfo.classList.toggle('hidden', !debugMode); // Show/hide debug based on initial state
        startBtn.style.display = 'inline-block';

        // Attempt to set background
        restaurantArea.style.backgroundImage = `url('${BACKGROUND_IMAGE_URL}')`;
        if (!BACKGROUND_IMAGE_URL || BACKGROUND_IMAGE_URL === 'assets/your-widescreen-backdrop.png') {
             console.warn("BACKGROUND_IMAGE_URL is not set or is the default placeholder in JS!");
        }
        // else if (debugMode) console.log("Attempting to load background:", BACKGROUND_IMAGE_URL);

        console.log("Initial visuals set. Ready to start.");
    }

    // Run initial visual setup once the DOM is ready
    initializeGameVisuals();

}); // End DOMContentLoaded
