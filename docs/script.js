{\rtf1\ansi\ansicpg1252\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 document.addEventListener('DOMContentLoaded', () => \{\
  // --- DOM Elements ---\
  const player = document.getElementById('player');\
  const carryingDisplay = document.getElementById('carrying');\
  const moneyDisplay = document.getElementById('money');\
  const timerDisplay = document.getElementById('timer');\
  const levelDisplay = document.getElementById('level');\
  const startBtn = document.getElementById('start-btn');\
  const menuBtn = document.getElementById('menu-btn');\
  const restartBtn = document.getElementById('restart-btn');\
  const gameOverScreen = document.getElementById('game-over');\
  const finalScoreDisplay = document.getElementById('final-score');\
  const tables = document.querySelectorAll('.table');\
  const foodStations = document.querySelectorAll('.food-station');\
  const menuModal = document.getElementById('menu-modal');\
  const closeMenuBtn = document.getElementById('close-menu-btn');\
  const tabBtns = document.querySelectorAll('.tab-btn');\
  const menuSections = document.querySelectorAll('.menu-section');\
  const restaurantArea = document.querySelector('.restaurant');\
  const diningArea = document.querySelector('.dining-area');\
  const debugInfo = document.getElementById('debug-info');\
  const debugFood = document.getElementById('debug-food');\
  const eventModal = document.getElementById('event-modal');\
  const eventTitle = document.getElementById('event-title');\
  const eventDescription = document.getElementById('event-description');\
  const eventOptionsContainer = document.getElementById('event-options');\
\
  const deliveryRadius = document.createElement('div');\
  deliveryRadius.className = 'delivery-radius';\
  restaurantArea.appendChild(deliveryRadius);\
\
  // --- Game State Variables ---\
  let money = 0;\
  let timeLeft = 180;\
  let gameRunning = false;\
  let isPaused = false;\
  let carryingFood = null;\
  let carryingFoodEmoji = null;\
  let customers = [];\
  let timerInterval = null;\
  let customerSpawnTimeout = null;\
  let customerPatienceBase = 35;\
  let level = 1;\
  let playerPosition = \{ x: 0, y: 0 \};\
  let isMoving = false;\
  let debugMode = false;\
  let levelThresholds = [0, 75, 180, 300, 450, 650, 900, 1200, 1600];\
  // Set background image to your asset\
  const BACKGROUND_IMAGE_URL = 'assets/backdrop.png';\
\
  // --- Game Configuration ---\
  const foodItems = \{\
    'Bread Basket': \{ emoji: '\uc0\u55356 \u57182 ', price: 5, category: 'Appetizers', prepTime: 1 \},\
    'Cherry Tomato & Garlic Confit': \{ emoji: '\uc0\u55356 \u57157 ', price: 12, category: 'Appetizers', prepTime: 2 \},\
    'Whipped Ricotta': \{ emoji: '\uc0\u55358 \u56768 ', price: 14, category: 'Appetizers', prepTime: 2 \},\
    'Marinated Olives': \{ emoji: '\uc0\u55358 \u57042 ', price: 6, category: 'Appetizers', prepTime: 1 \},\
    'Crispy Gnudi': \{ emoji: '\uc0\u55356 \u57181 ', price: 12, category: 'Appetizers', prepTime: 3.5 \},\
\
    'House Salad': \{ emoji: '\uc0\u55358 \u56663 ', price: 12, category: 'Salads', prepTime: 2.5 \},\
    'Spicy Caesar Salad': \{ emoji: '\uc0\u55358 \u56663 ', price: 14, category: 'Salads', prepTime: 3 \},\
\
    'Cacio e Pepe': \{ emoji: '\uc0\u55356 \u57181 ', price: 20, category: 'Pasta', prepTime: 4 \},\
    'Seeing Red Pesto': \{ emoji: '\uc0\u55356 \u57142 \u65039 ', price: 24, category: 'Pasta', prepTime: 4 \},\
    'Short Rib Agnolotti': \{ emoji: '\uc0\u55358 \u56671 ', price: 32, category: 'Pasta', prepTime: 5 \},\
    'Pomodoro': \{ emoji: '\uc0\u55356 \u57181 ', price: 26, category: 'Pasta', prepTime: 3.5 \},\
\
    'Tomato Pie Slice': \{ emoji: '\uc0\u55356 \u57173 ', price: 5, category: 'Pizza', prepTime: 3 \},\
    'Tre Sale Slice': \{ emoji: '\uc0\u55356 \u57173 ', price: 6, category: 'Pizza', prepTime: 3.5 \},\
    'Garlic Girl': \{ emoji: '\uc0\u55356 \u57173 ', price: 25, category: 'Pizza', prepTime: 4.5 \},\
    'Toni Roni': \{ emoji: '\uc0\u55356 \u57173 ', price: 26, category: 'Pizza', prepTime: 5 \},\
\
    'Chicken Cutlets': \{ emoji: '\uc0\u55356 \u57175 ', price: 28, category: 'Mains', prepTime: 5 \},\
    'Roasted Half-Chicken': \{ emoji: '\uc0\u55357 \u56340 ', price: 34, category: 'Mains', prepTime: 7 \},\
    'Grilled Salmon': \{ emoji: '\uc0\u55357 \u56351 ', price: 36, category: 'Mains', prepTime: 4.5 \},\
    'Hanger Steak': \{ emoji: '\uc0\u55358 \u56681 ', price: 38, category: 'Mains', prepTime: 6 \},\
\
    'Mushroom Risotto': \{ emoji: '\uc0\u55356 \u57156 ', price: 12, category: 'Sides', prepTime: 5 \},\
    'Crispy Polenta': \{ emoji: '\uc0\u55356 \u57149 ', price: 10, category: 'Sides', prepTime: 4 \},\
    'Mashed Potatoes': \{ emoji: '\uc0\u55358 \u56660 ', price: 10, category: 'Sides', prepTime: 3 \},\
    'Shoestring Fries': \{ emoji: '\uc0\u55356 \u57183 ', price: 6, category: 'Sides', prepTime: 2.5 \},\
    'Grilled Asparagus': \{ emoji: '\uc0\u55356 \u57186 ', price: 8, category: 'Sides', prepTime: 3 \},\
\
    'Water': \{ emoji: '\uc0\u55357 \u56487 ', price: 0, category: 'Drinks', prepTime: 0.5 \},\
    'Wine': \{ emoji: '\uc0\u55356 \u57207 ', price: 12, category: 'Drinks', prepTime: 0.5 \},\
    'Soda': \{ emoji: '\uc0\u55358 \u56676 ', price: 3, category: 'Drinks', prepTime: 0.5 \}\
  \};\
\
  const customerEmojis = ['\uc0\u55357 \u56425 ', '\u55357 \u56424 ', '\u55357 \u56437 ', '\u55357 \u56436 ', '\u55357 \u56433 \u8205 \u9792 \u65039 ', '\u55357 \u56433 ', '\u55357 \u56425 \u8205 \u55358 \u56752 ', '\u55357 \u56424 \u8205 \u55358 \u56752 ', '\u55357 \u56425 \u8205 \u55358 \u56753 ', '\u55357 \u56424 \u8205 \u55358 \u56753 ', '\u55358 \u56785 \u8205 \u55356 \u57220 ', '\u55357 \u56440 ', '\u55357 \u56424 \u8205 \u55356 \u57256 ', '\u55357 \u56425 \u8205 \u55357 \u56620 ', '\u55357 \u56450 ', '\u55357 \u56693 \u65039 '];\
  const moodEmojis = \{ happy: '\uc0\u55357 \u56842 ', neutral: '\u55357 \u56848 ', impatient: '\u55357 \u56864 ', angry: '\u55357 \u56865 ' \};\
\
  const randomEvents = [\
    \{\
      title: "Customer Complaint!",\
      description: "A customer says their Cacio e Pepe is too peppery!",\
      options: [\
        \{ text: "Apologize & Offer free drink (-$3)", effect: \{ money: -3, time: 0 \}, feedback: "Comped a soda." \},\
        \{ text: "Remake the dish (Lose time)", effect: \{ money: 0, time: -10 \}, feedback: "Remade the pasta (-10s)." \},\
        \{ text: "Argue politely (Risk anger)", effect: \{ money: 0, time: 0 \}, feedback: "Defended the chef!" \}\
      ]\
    \},\
    \{\
      title: "Kitchen Emergency!",\
      description: "The oven suddenly stopped working!",\
      options: [\
        \{ text: "Quick Fix Attempt (-$20, -15s)", effect: \{ money: -20, time: -15 \}, feedback: "Paid for quick fix (-$20, -15s)." \},\
        \{ text: "Work Around It (No Pizza/Roast)", effect: \{ money: 0, time: 0 \}, feedback: "No oven dishes for now..." \},\
        \{ text: "Ignore It (Riskier)", effect: \{ money: 0, time: 0 \}, feedback: "Ignored the oven..." \}\
      ]\
    \},\
    \{\
      title: "Ingredient Shortage",\
      description: "Oh no! We're running low on fresh basil for Pomodoro!",\
      options: [\
        \{ text: "Buy Emergency Basil (-$15)", effect: \{ money: -15, time: 0 \}, feedback: "Bought expensive basil (-$15)." \},\
        \{ text: "Improvise (Use dried herbs)", effect: \{ money: 0, time: 0 \}, feedback: "Substituted herbs..." \},\
        \{ text: "Stop serving Pomodoro", effect: \{ money: 0, time: 0 \}, feedback: "Took Pomodoro off menu." \}\
      ]\
    \},\
    \{\
      title: "VIP Guest",\
      description: "A famous food critic just sat down at Table 3!",\
      options: [\
        \{ text: "Offer Free Appetizer (-$10)", effect: \{ money: -10, time: 0 \}, feedback: "Comped critic appetizer (-$10)." \},\
        \{ text: "Chef's Special Attention (-10s)", effect: \{ money: 0, time: -10 \}, feedback: "Chef gave extra attention (-10s)." \},\
        \{ text: "Treat Like Normal", effect: \{ money: 0, time: 0 \}, feedback: "Treated critic normally." \}\
      ]\
    \}\
  ];\
\
  // --- Event Listeners ---\
  startBtn.addEventListener('click', startGame);\
  restartBtn.addEventListener('click', () => \{\
    gameOverScreen.classList.add('hidden');\
    startGame();\
  \});\
  menuBtn.addEventListener('click', () => \{\
    pauseGame();\
    menuModal.classList.remove('hidden');\
  \});\
  closeMenuBtn.addEventListener('click', () => \{\
    menuModal.classList.add('hidden');\
    resumeGame();\
  \});\
  tabBtns.forEach(btn => \{\
    btn.addEventListener('click', () => \{\
      tabBtns.forEach(tab => tab.classList.remove('active'));\
      menuSections.forEach(section => section.classList.remove('active'));\
      btn.classList.add('active');\
      const tabId = btn.getAttribute('data-tab');\
      document.getElementById(tabId)?.classList.add('active');\
    \});\
  \});\
  let keysPressed = [];\
  document.addEventListener('keydown', (e) => \{\
    keysPressed.push(e.key.toLowerCase());\
    keysPressed = keysPressed.slice(-5);\
    if (keysPressed.join('') === 'debug') \{\
      debugMode = !debugMode;\
      debugInfo.classList.toggle('hidden', !debugMode);\
      console.log('Debug mode:', debugMode);\
    \}\
  \});\
  foodStations.forEach(station => \{\
    station.addEventListener('click', () => \{\
      if (!gameRunning || isPaused || isMoving || station.classList.contains('preparing')) return;\
      const foodId = station.getAttribute('data-item');\
      if (!foodId || !foodItems[foodId]) \{\
        console.error("Invalid food station:", station);\
        return;\
      \}\
      const foodData = foodItems[foodId];\
      const prepTime = foodData.prepTime * 1000;\
      if (!carryingFood) \{\
        movePlayerToElement(station, () => \{\
          station.classList.add('preparing');\
          station.style.pointerEvents = 'none';\
          setTimeout(() => \{\
            carryingFood = foodId;\
            carryingFoodEmoji = foodData.emoji;\
            carryingDisplay.textContent = carryingFoodEmoji;\
            deliveryRadius.classList.add('active');\
            if (debugMode) debugFood.textContent = foodId;\
            station.classList.remove('preparing');\
            station.style.pointerEvents = 'auto';\
          \}, prepTime);\
        \});\
      \} else \{\
        showFeedbackIndicator(player, "Hands full!", "negative");\
      \}\
    \});\
  \});\
  diningArea.addEventListener('click', (e) => \{\
    if (!gameRunning || isPaused || isMoving) return;\
    if (e.target.closest('.customer') || e.target.closest('.table') || e.target.closest('.player')) return;\
    const rect = diningArea.getBoundingClientRect();\
    const targetX = e.clientX - rect.left;\
    const targetY = e.clientY - rect.top;\
    movePlayerToCoordinates(targetX, targetY);\
  \});\
  tables.forEach(table => \{\
    table.addEventListener('click', (e) => \{\
      if (!gameRunning || isPaused || isMoving) return;\
      if (e.target.classList.contains('money-indicator') || e.target.classList.contains('feedback-indicator')) return;\
      const customerObj = customers.find(c => c.tableElement === table && c.state === 'waiting');\
      movePlayerToElement(table, () => \{\
        if (customerObj) \{\
          if (carryingFood) \{\
            if (carryingFood === customerObj.order) \{\
              serveCustomer(customerObj);\
            \} else \{\
              showFeedbackIndicator(table, "Wrong Order!", "negative");\
              if (debugMode) console.log(`Wrong! Have: $\{carryingFood\}, Want: $\{customerObj.order\}`);\
              customerObj.patienceCurrent = Math.max(0, customerObj.patienceCurrent - 5);\
              updateCustomerMood(customerObj);\
            \}\
          \}\
        \} else if (carryingFood) \{\
          showFeedbackIndicator(table, "No one waiting!", "negative");\
        \}\
      \});\
    \});\
  \});\
\
  // --- Game Loop and Functions ---\
  function startGame() \{\
    console.log("Starting game...");\
    money = 0;\
    level = 1;\
    timeLeft = 180;\
    gameRunning = true;\
    isPaused = false;\
    carryingFood = null;\
    carryingFoodEmoji = null;\
    customers = [];\
    isMoving = false;\
\
    moneyDisplay.textContent = money;\
    levelDisplay.textContent = level;\
    timerDisplay.textContent = timeLeft;\
    carryingDisplay.textContent = '';\
    deliveryRadius.classList.remove('active');\
    debugFood.textContent = 'None';\
    startBtn.style.display = 'none';\
    gameOverScreen.classList.add('hidden');\
    menuModal.classList.add('hidden');\
    eventModal.classList.add('hidden');\
\
    clearCustomersAndIndicators();\
    stopPlayerMovement();\
\
    restaurantArea.style.backgroundImage = `url('$\{BACKGROUND_IMAGE_URL\}')`;\
    if (!BACKGROUND_IMAGE_URL) console.warn("BACKGROUND_IMAGE_URL is not set!");\
\
    playerPosition.x = restaurantArea.offsetWidth / 2;\
    playerPosition.y = restaurantArea.offsetHeight - 60;\
    updatePlayerPosition();\
    player.style.opacity = '1';\
    player.style.display = 'flex';\
\
    clearInterval(timerInterval);\
    timerInterval = setInterval(gameTick, 1000);\
    clearTimeout(customerSpawnTimeout);\
    scheduleNextCustomer();\
    console.log("Game started.");\
  \}\
\
  function endGame() \{\
    console.log("Ending game...");\
    gameRunning = false;\
    isPaused = true;\
    clearInterval(timerInterval);\
    clearTimeout(customerSpawnTimeout);\
    finalScoreDisplay.textContent = money;\
    gameOverScreen.classList.remove('hidden');\
    startBtn.style.display = 'inline-block';\
    deliveryRadius.classList.remove('active');\
    console.log("Game ended. Final Score:", money);\
  \}\
\
  function pauseGame() \{\
    if (!gameRunning || isPaused) return;\
    isPaused = true;\
    clearInterval(timerInterval);\
    stopPlayerMovement();\
    console.log("Game Paused");\
  \}\
\
  function resumeGame() \{\
    if (!gameRunning || !isPaused) return;\
    isPaused = false;\
    clearInterval(timerInterval);\
    timerInterval = setInterval(gameTick, 1000);\
    console.log("Game Resumed");\
  \}\
\
  function gameTick() \{\
    if (!gameRunning || isPaused) \{\
      clearInterval(timerInterval);\
      return;\
    \}\
    timeLeft--;\
    timerDisplay.textContent = timeLeft;\
    updateCustomers();\
    if (timeLeft <= 0) \{\
      endGame();\
      return;\
    \}\
    if (Math.random() < 0.01) \{\
      triggerRandomEvent();\
    \}\
  \}\
\
  function updateCustomers() \{\
    if (isPaused) return;\
    const now = Date.now();\
    customers.forEach((customer) => \{\
      if (customer.state === 'leaving' || customer.state === 'served' || customer.state === 'remove') return;\
      const timeElapsed = (now - customer.spawnTime) / 1000;\
      customer.patienceCurrent = Math.max(0, customer.patienceTotal - timeElapsed);\
      updateCustomerMood(customer);\
      if (customer.patienceCurrent <= 0 && customer.state === 'waiting') \{\
        customerLeavesAngry(customer);\
      \}\
    \});\
    customers = customers.filter(c => c.state !== 'remove');\
  \}\
\
  function customerLeavesAngry(customer) \{\
    if (customer.state === 'leaving') return;\
    console.log("Customer leaving angry:", customer.id);\
    customer.state = 'leaving';\
    customer.tableElement.classList.remove('table-highlight');\
    showFeedbackIndicator(customer.tableElement, "Left Angry! \uc0\u55357 \u56865 ", "negative");\
    if(customer.element) \{\
      customer.element.style.transition = 'opacity 0.5s ease';\
      customer.element.style.opacity = '0';\
    \}\
    setTimeout(() => \{\
      if (customer.element && customer.element.parentNode) customer.element.remove();\
      customer.state = 'remove';\
    \}, 500);\
  \}\
\
  function movePlayerToElement(targetElement, callback = null) \{\
    if (isPaused || !targetElement) return;\
    const targetRect = targetElement.getBoundingClientRect();\
    const restaurantRect = restaurantArea.getBoundingClientRect();\
    const targetX = targetRect.left - restaurantRect.left + targetRect.width / 2;\
    const yOffset = targetElement.classList.contains('food-station') ? targetRect.height * 0.1 : targetRect.height / 2;\
    const targetY = targetRect.top - restaurantRect.top + yOffset;\
    movePlayerToCoordinates(targetX, targetY, callback);\
  \}\
\
  function movePlayerToCoordinates(targetX, targetY, callback = null) \{\
    if (isPaused || isMoving) return;\
    isMoving = true;\
    const startX = playerPosition.x;\
    const startY = playerPosition.y;\
    const distance = Math.hypot(targetX - startX, targetY - startY);\
    if (distance < 1) \{\
      isMoving = false;\
      if (callback) callback();\
      return;\
    \}\
    const speed = 400;\
    const duration = (distance / speed) * 1000;\
    let startTime;\
    let animationFrameId;\
    function step(timestamp) \{\
      if (isPaused) \{\
        cancelAnimationFrame(animationFrameId);\
        isMoving = false;\
        console.log("Movement paused");\
        return;\
      \}\
      if (!startTime) startTime = timestamp;\
      const elapsed = timestamp - startTime;\
      const progress = Math.min(1, elapsed / duration);\
      playerPosition.x = startX + (targetX - startX) * progress;\
      playerPosition.y = startY + (targetY - startY) * progress;\
      updatePlayerPosition();\
      if (progress < 1) \{\
        animationFrameId = requestAnimationFrame(step);\
      \} else \{\
        playerPosition.x = targetX;\
        playerPosition.y = targetY;\
        updatePlayerPosition();\
        isMoving = false;\
        if (callback) \{\
          try \{\
            callback();\
          \} catch (error) \{\
            console.error("Callback error:", error);\
          \}\
        \}\
      \}\
    \}\
    animationFrameId = requestAnimationFrame(step);\
  \}\
\
  function stopPlayerMovement() \{\
    isMoving = false;\
    console.log("Requested move stop / Marked as not moving");\
  \}\
\
  function updatePlayerPosition() \{\
    const kitchenHeight = document.querySelector('.kitchen').offsetHeight;\
    const playerWidthHalf = player.offsetWidth / 2;\
    const playerHeightHalf = player.offsetHeight / 2;\
    const minX = playerWidthHalf;\
    const maxX = restaurantArea.offsetWidth - playerWidthHalf;\
    const minY = kitchenHeight + playerHeightHalf + 5;\
    const maxY = restaurantArea.offsetHeight - playerHeightHalf - 5;\
    playerPosition.x = Math.max(minX, Math.min(maxX, playerPosition.x));\
    playerPosition.y = Math.max(minY, Math.min(maxY, playerPosition.y));\
    player.style.left = `$\{playerPosition.x\}px`;\
    player.style.top = `$\{playerPosition.y\}px`;\
    deliveryRadius.style.left = `$\{playerPosition.x\}px`;\
    deliveryRadius.style.top = `$\{playerPosition.y\}px`;\
  \}\
\
  function scheduleNextCustomer() \{\
    if (!gameRunning || isPaused) return;\
    clearTimeout(customerSpawnTimeout);\
    const baseSpawnTime = 6000;\
    const minSpawnTime = 2500;\
    const spawnTimeReduction = (level - 1) * 350;\
    const nextSpawnDelay = Math.max(minSpawnTime, baseSpawnTime - spawnTimeReduction);\
    customerSpawnTimeout = setTimeout(spawnCustomer, nextSpawnDelay * (0.8 + Math.random() * 0.4));\
  \}\
\
  function spawnCustomer() \{\
    if (!gameRunning || isPaused) return;\
    const availableTables = Array.from(tables).filter(table => !customers.some(c => c.tableElement === table && c.state !== 'leaving' && c.state !== 'remove'));\
    if (availableTables.length > 0) \{\
      const table = availableTables[Math.floor(Math.random() * availableTables.length)];\
      const seat = table.querySelector('.seat');\
      if (!seat) \{\
        scheduleNextCustomer();\
        return;\
      \}\
      const customerElement = document.createElement('div');\
      customerElement.className = 'customer';\
      customerElement.textContent = customerEmojis[Math.floor(Math.random() * customerEmojis.length)];\
      customerElement.style.opacity = '0';\
      const availableFood = Object.keys(foodItems);\
      const orderedFood = availableFood[Math.floor(Math.random() * availableFood.length)];\
      const foodData = foodItems[orderedFood];\
      const speechBubble = document.createElement('div');\
      speechBubble.className = 'speech-bubble';\
      speechBubble.innerHTML = `<div class="dish-name">$\{orderedFood\}</div><div class="dish-price">$$\{foodData.price\}</div><div class="dish-emoji">$\{foodData.emoji\}</div>`;\
      const moodIndicator = document.createElement('div');\
      moodIndicator.className = 'mood-indicator';\
      moodIndicator.textContent = moodEmojis.happy;\
      customerElement.appendChild(moodIndicator);\
      customerElement.appendChild(speechBubble);\
      seat.appendChild(customerElement);\
      setTimeout(() => \{\
        customerElement.style.opacity = '1';\
        speechBubble.style.transition = 'opacity 0.3s ease';\
        speechBubble.style.opacity = '1';\
      \}, 50);\
      const customerId = `cust-$\{Date.now()\}-$\{Math.random().toString(16).slice(2)\}`;\
      const patience = Math.max(15, customerPatienceBase - (level - 1) * 2);\
      const newCustomer = \{\
        id: customerId,\
        element: customerElement,\
        tableElement: table,\
        order: orderedFood,\
        orderPrice: foodData.price,\
        spawnTime: Date.now(),\
        patienceTotal: patience,\
        patienceCurrent: patience,\
        moodIndicator: moodIndicator,\
        state: 'waiting'\
      \};\
      customers.push(newCustomer);\
      table.classList.add('table-highlight');\
    \}\
    scheduleNextCustomer();\
  \}\
\
  function serveCustomer(customer) \{\
    if (!customer || customer.state !== 'waiting') return;\
    console.log("Serving customer:", customer.id);\
    customer.state = 'served';\
    const table = customer.tableElement;\
    const price = customer.orderPrice;\
    const patienceRatio = Math.max(0, customer.patienceCurrent) / customer.patienceTotal;\
    let tipMultiplier = 0.05;\
    if (patienceRatio > 0.8) tipMultiplier = 0.20;\
    else if (patienceRatio > 0.5) tipMultiplier = 0.15;\
    else if (patienceRatio > 0.2) tipMultiplier = 0.10;\
    const tipAmount = Math.ceil(price * tipMultiplier);\
    const totalEarned = price + tipAmount;\
    money += totalEarned;\
    moneyDisplay.textContent = money;\
    showFeedbackIndicator(table, `+ $$\{price\}<br/>+ $$\{tipAmount\} tip!`, "positive");\
    customer.moodIndicator.textContent = '\uc0\u55357 \u56843 ';\
    const speechBubble = customer.element.querySelector('.speech-bubble');\
    if (speechBubble) speechBubble.innerHTML = "Grazie! \uc0\u55357 \u56396 ";\
    table.classList.remove('table-highlight');\
    carryingFood = null;\
    carryingFoodEmoji = null;\
    carryingDisplay.textContent = '';\
    deliveryRadius.classList.remove('active');\
    if (debugMode) debugFood.textContent = "None";\
    checkLevelUp();\
    if (customer.element) \{\
      customer.element.style.transition = 'opacity 1s ease 0.5s';\
      customer.element.style.opacity = '0.7';\
    \}\
    setTimeout(() => \{\
      if (customer.element && customer.element.parentNode) customer.element.remove();\
      customer.state = 'remove';\
    \}, 2000);\
  \}\
\
  function updateCustomerMood(customer) \{\
    const patienceRatio = Math.max(0, customer.patienceCurrent) / customer.patienceTotal;\
    let mood = moodEmojis.happy;\
    if (patienceRatio <= 0.2) mood = moodEmojis.angry;\
    else if (patienceRatio <= 0.5) mood = moodEmojis.impatient;\
    else if (patienceRatio <= 0.8) mood = moodEmojis.neutral;\
    customer.moodIndicator.textContent = mood;\
  \}\
\
  function checkLevelUp() \{\
    const nextLevel = level;\
    if (nextLevel >= levelThresholds.length) return;\
    const moneyNeeded = levelThresholds[nextLevel];\
    if (money >= moneyNeeded) \{\
      level++;\
      levelDisplay.textContent = level;\
      timeLeft += 20;\
      timerDisplay.textContent = timeLeft;\
      showFeedbackIndicator(player, `Level Up! $\{level\} (+20s)`, "positive", 2500);\
      console.log("Level Up! Reached level", level);\
    \}\
  \}\
\
  function clearCustomersAndIndicators() \{\
    console.log("Clearing customers and indicators...");\
    customers.forEach(customer => \{\
      if (customer.element && customer.element.parentNode) customer.element.remove();\
    \});\
    customers = [];\
    document.querySelectorAll('.money-indicator, .feedback-indicator').forEach(el => el.remove());\
    tables.forEach(table => table.classList.remove('table-highlight'));\
  \}\
\
  function showFeedbackIndicator(targetElement, text, type = "info", duration = 1800) \{\
    const indicator = document.createElement('div');\
    indicator.className = 'feedback-indicator';\
    if (type === "negative") indicator.classList.add('negative');\
    else if (type === "positive") indicator.classList.add('positive');\
    indicator.innerHTML = text;\
    const container = targetElement.classList.contains('table') || targetElement.classList.contains('food-station') ? targetElement : diningArea;\
    container.appendChild(indicator);\
    const targetRect = targetElement.getBoundingClientRect();\
    const containerRect = container.getBoundingClientRect();\
    indicator.style.position = 'absolute';\
    indicator.style.left = `$\{targetRect.left - containerRect.left + targetRect.width / 2\}px`;\
    indicator.style.top = `$\{targetRect.top - containerRect.top + targetRect.height * 0.1\}px`;\
    setTimeout(() => indicator.remove(), duration);\
  \}\
\
  function triggerRandomEvent() \{\
    if (!gameRunning || isPaused || !eventModal.classList.contains('hidden')) return;\
    console.log("Triggering random event...");\
    pauseGame();\
    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];\
    eventTitle.textContent = event.title;\
    eventDescription.textContent = event.description;\
    eventOptionsContainer.innerHTML = '';\
    event.options.forEach((option) => \{\
      const button = document.createElement('button');\
      button.textContent = option.text;\
      button.dataset.effectMoney = option.effect.money;\
      button.dataset.effectTime = option.effect.time;\
      button.dataset.feedback = option.feedback;\
      button.addEventListener('click', handleEventChoice);\
      eventOptionsContainer.appendChild(button);\
    \});\
    eventModal.classList.remove('hidden');\
  \}\
  function handleEventChoice(e) \{\
    const button = e.target;\
    const moneyEffect = parseInt(button.dataset.effectMoney || '0');\
    const timeEffect = parseInt(button.dataset.effectTime || '0');\
    const feedback = button.dataset.feedback || "Okay.";\
    console.log(`Event choice: $\{button.textContent\}, Effect: Money $\{moneyEffect\}, Time $\{timeEffect\}`);\
    money += moneyEffect;\
    timeLeft += timeEffect;\
    money = Math.max(0, money);\
    timeLeft = Math.max(0, timeLeft);\
    moneyDisplay.textContent = money;\
    timerDisplay.textContent = timeLeft;\
    showFeedbackIndicator(player, feedback, moneyEffect < 0 || timeEffect < 0 ? "negative" : "info");\
    eventModal.classList.add('hidden');\
    resumeGame();\
  \}\
\
  function initializeGame() \{\
    console.log("Initializing game UI...");\
    playerPosition.x = restaurantArea.offsetWidth / 2;\
    playerPosition.y = restaurantArea.offsetHeight - 60;\
    updatePlayerPosition();\
    player.style.opacity = '1';\
    player.style.display = 'flex';\
    gameOverScreen.classList.add('hidden');\
    menuModal.classList.add('hidden');\
    eventModal.classList.add('hidden');\
    debugInfo.classList.toggle('hidden', !debugMode);\
    startBtn.style.display = 'inline-block';\
\
    restaurantArea.style.backgroundImage = `url('$\{BACKGROUND_IMAGE_URL\}')`;\
    if (!BACKGROUND_IMAGE_URL) console.warn("BACKGROUND_IMAGE_URL is empty!");\
    else console.log("Attempting to load background:", BACKGROUND_IMAGE_URL);\
\
    console.log("Initialization complete. Ready to start.");\
  \}\
\
  initializeGame();\
\});}