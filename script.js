// script.js

// Ensure that unitsData is loaded before this script runs
if (typeof unitsData === 'undefined') {
    console.error("unitsData is not defined. Please ensure units.js is loaded before script.js.");
}

// Emojis
const HIT_EMOJI = '💥';
const BLOCK_EMOJI = '🛡️';
const MORALE_EMOJI = '🚩'; // Updated Morale Emoji
const MISS_EMOJI = '⚪';

// Number Emojis
const numberEmojis = {
    '0': '0️⃣',
    '1': '1️⃣',
    '2': '2️⃣',
    '3': '3️⃣',
    '4': '4️⃣',
    '5': '5️⃣',
    '6': '6️⃣',
    '7': '7️⃣',
    '8': '8️⃣',
    '9': '9️⃣'
};

// Damage Arrow Emojis
const cascadeaDamageArrowEmoji = '⬇️';
const kharkhoviaDamageArrowEmoji = '⬆️';

// Function to convert number to emojis
function numberToEmojis(number) {
    return String(number).split('').map(digit => numberEmojis[digit] || digit).join('');
}

// Define the dice
// Light Attack Dice: {Hit, Hit, Hit, Double Hit, Morale, Miss}
const lightAttackDie = [
    { hits: 1, morales: 0, emoji: HIT_EMOJI }, // Hit
    { hits: 1, morales: 0, emoji: HIT_EMOJI }, // Hit
    { hits: 1, morales: 0, emoji: HIT_EMOJI }, // Hit
    { hits: 2, morales: 0, emoji: HIT_EMOJI + HIT_EMOJI }, // Double Hit
    { hits: 0, morales: 1, emoji: MORALE_EMOJI }, // Morale
    { hits: 0, morales: 0, emoji: MISS_EMOJI } // Miss
];

// Defence Dice: {Block, Block, Block, Double Block, Double Morale, Miss}
const defenceDie = [
    { blocks: 1, morales: 0, emoji: BLOCK_EMOJI }, // Block
    { blocks: 1, morales: 0, emoji: BLOCK_EMOJI }, // Block
    { blocks: 1, morales: 0, emoji: BLOCK_EMOJI }, // Block
    { blocks: 2, morales: 0, emoji: BLOCK_EMOJI + BLOCK_EMOJI }, // Double Block
    { blocks: 0, morales: 2, emoji: MORALE_EMOJI + MORALE_EMOJI }, // Double Morale
    { blocks: 0, morales: 0, emoji: MISS_EMOJI } // Miss
];

// Heavy Attack Dice: {Hit, Hit, Double Hit, Triple Hit, Morale, Miss}
const heavyAttackDie = [
    { hits: 1, morales: 0, emoji: HIT_EMOJI }, // Hit
    { hits: 1, morales: 0, emoji: HIT_EMOJI }, // Hit
    { hits: 2, morales: 0, emoji: HIT_EMOJI + HIT_EMOJI }, // Double Hit
    { hits: 3, morales: 0, emoji: HIT_EMOJI + HIT_EMOJI + HIT_EMOJI }, // Triple Hit
    { hits: 0, morales: 1, emoji: MORALE_EMOJI }, // Morale
    { hits: 0, morales: 0, emoji: MISS_EMOJI } // Miss
];

// Unit Strengths
const unitStrength = {};
unitsData.forEach(unit => {
    unitStrength[unit.name] = unit.strength;
});

// Unit counts
const units = {
    cascadea: {},
    kharkhovia: {}
};

// Initialize units with default values (1 Infantry each)
unitsData.forEach(unit => {
    units.cascadea[unit.name] = unit.name === 'infantry' ? 1 : 0;
    units.kharkhovia[unit.name] = unit.name === 'infantry' ? 1 : 0;
});

// Selected Tactics
let selectedTactics = {
    cascadea: null,
    kharkhovia: null
};

// Rolled Dice
let rolledDice = {
    cascadea: null,
    kharkhovia: null
};

// Function to create unit controls dynamically
function createUnitControls() {
    ['cascadea', 'kharkhovia'].forEach(faction => {
        const controlsContainer = document.getElementById(`${faction}-unit-controls`);
        unitsData.forEach(unit => {
            // Create unit group
            const unitGroup = document.createElement('div');
            unitGroup.classList.add('unit-group');

            // Unit label
            const unitLabel = document.createElement('span');
            unitLabel.classList.add('unit-label');
            unitLabel.textContent = `${unit.displayName}:`;
            unitGroup.appendChild(unitLabel);

            // Add Button
            const addButton = document.createElement('button');
            addButton.textContent = `+1 ${unit.emoji}`;
            addButton.onclick = () => changeUnits(faction, unit.name, 1);
            unitGroup.appendChild(addButton);

            // Unit Count
            const unitCount = document.createElement('span');
            unitCount.id = `${faction}-${unit.name}`;
            unitCount.textContent = units[faction][unit.name];
            unitGroup.appendChild(unitCount);

            // Remove Button
            const removeButton = document.createElement('button');
            removeButton.textContent = `-1 ${unit.emoji}`;
            removeButton.onclick = () => changeUnits(faction, unit.name, -1);
            unitGroup.appendChild(removeButton);

            // Append unit group to controls container
            controlsContainer.appendChild(unitGroup);
        });
    });

    // Initialize Tactics Selection
    initializeTacticsSelection();
}

// Call the function to generate unit controls on page load
createUnitControls();

// Function to change units
function changeUnits(faction, unitType, delta) {
    units[faction][unitType] = Math.max(units[faction][unitType] + delta, 0);
    document.getElementById(`${faction}-${unitType}`).innerText = units[faction][unitType];
    updateBoardUnits();
}

// Update units on the board
function updateBoardUnits() {
    ['cascadea', 'kharkhovia'].forEach(faction => {
        let unitIcons = '';
        unitsData.forEach(unit => {
            unitIcons += unit.emoji.repeat(units[faction][unit.name]);
        });
        document.getElementById(`${faction}-hex-units`).textContent = unitIcons;
    });
}

// Function to roll a die
function rollDie(die) {
    return die[Math.floor(Math.random() * die.length)];
}

// Function to roll attack and defence for a faction
function rollForFaction(faction, unitCounts) {
    let attackRolls = [];
    let defenceRolls = [];
    let totalHits = 0;
    let totalBlocks = 0;
    let totalMorales = 0;

    unitsData.forEach(unit => {
        const count = unitCounts[unit.name];
        // Light Attack
        for (let i = 0; i < unit.lightAttack * count; i++) {
            const attackRoll = rollDie(lightAttackDie);
            attackRolls.push(attackRoll);
            totalHits += attackRoll.hits;
            totalMorales += attackRoll.morales;
        }

        // Heavy Attack
        for (let i = 0; i < unit.heavyAttack * count; i++) {
            const attackRoll = rollDie(heavyAttackDie);
            attackRolls.push(attackRoll);
            totalHits += attackRoll.hits;
            totalMorales += attackRoll.morales;
        }

        // Defence
        for (let i = 0; i < unit.defence * count; i++) {
            const defenceRoll = rollDie(defenceDie);
            defenceRolls.push(defenceRoll);
            totalBlocks += defenceRoll.blocks || 0;
            totalMorales += defenceRoll.morales || 0;
        }
    });

    return {
        attackRolls,
        defenceRolls,
        totalHits,
        totalBlocks,
        totalMorales
    };
}

// Function to simulate Dice Roll
function rollDice() {
    rolledDice = {
        cascadea: rollForFaction('cascadea', units.cascadea),
        kharkhovia: rollForFaction('kharkhovia', units.kharkhovia)
    };

    let output = '';

    // Display rolled dice for Cascadea
    output += `<h2>Rolled Dice Results</h2>`;
    output += `<h3><span class="cascadea">Cascadea's Rolls:</span></h3>`;
    output += `Attack Rolls: ${rolledDice.cascadea.attackRolls.map(roll => roll.emoji).join(', ')}<br>`;
    output += `Defence Rolls: ${rolledDice.cascadea.defenceRolls.map(roll => roll.emoji).join(', ')}<br>`;
    output += `Total Hits: ${rolledDice.cascadea.totalHits} ${HIT_EMOJI}<br>`;
    output += `Total Blocks: ${rolledDice.cascadea.totalBlocks} ${BLOCK_EMOJI}<br>`;
    output += `Total Morales: ${rolledDice.cascadea.totalMorales} ${MORALE_EMOJI}<br><br>`;

    // Display rolled dice for Kharkhovia
    output += `<h3><span class="kharkhovia">Kharkhovia's Rolls:</span></h3>`;
    output += `Attack Rolls: ${rolledDice.kharkhovia.attackRolls.map(roll => roll.emoji).join(', ')}<br>`;
    output += `Defence Rolls: ${rolledDice.kharkhovia.defenceRolls.map(roll => roll.emoji).join(', ')}<br>`;
    output += `Total Hits: ${rolledDice.kharkhovia.totalHits} ${HIT_EMOJI}<br>`;
    output += `Total Blocks: ${rolledDice.kharkhovia.totalBlocks} ${BLOCK_EMOJI}<br>`;
    output += `Total Morales: ${rolledDice.kharkhovia.totalMorales} ${MORALE_EMOJI}<br>`;

    // Update Output Section
    document.getElementById('output').innerHTML = output;
}

// Function to simulate combat without tactics
function simulateCombat() {
    // Automatically roll dice
    rollDice();

    if (!rolledDice.cascadea || !rolledDice.kharkhovia) {
        alert("Failed to roll dice.");
        return;
    }

    let output = '';

    // Header
    output += `<h2>Combat Simulation</h2>`;

    // Calculate damage
    const cascadeaDamage = Math.max(rolledDice.kharkhovia.totalHits - rolledDice.cascadea.totalBlocks, 0);
    const kharkhoviaDamage = Math.max(rolledDice.cascadea.totalHits - rolledDice.kharkhovia.totalBlocks, 0);

    // Output Damage Dealt
    output += `<h3>Damage Dealt:</h3>`;
    output += `<span class="cascadea">Cascadea</span> deals ${kharkhoviaDamage} damage to <span class="kharkhovia">Kharkhovia</span>.<br>`;
    output += `<span class="kharkhovia">Kharkhovia</span> deals ${cascadeaDamage} damage to <span class="cascadea">Cascadea</span>.<br>`;

    // Update damage arrows
    updateDamageArrows(cascadeaDamage, kharkhoviaDamage);

    // Combat Resolution
    output += `<h3>Combat Resolution:</h3>`;
    const cascadeaResolution = resolveDamage('cascadea', cascadeaDamage);
    const kharkhoviaResolution = resolveDamage('kharkhovia', kharkhoviaDamage);
    output += cascadeaResolution.output;
    output += kharkhoviaResolution.output;

    // Update unit losses display
    updateUnitLosses('cascadea', cascadeaResolution.unitsLost);
    updateUnitLosses('kharkhovia', kharkhoviaResolution.unitsLost);

    // Determine Winner
    const cascadeaTotalUnits = totalUnits(units.cascadea);
    const kharkhoviaTotalUnits = totalUnits(units.kharkhovia);

    if (cascadeaTotalUnits > 0 && kharkhoviaTotalUnits === 0) {
        output += `<h2 class="cascadea">Cascadea Wins!</h2>`;
    } else if (kharkhoviaTotalUnits > 0 && cascadeaTotalUnits === 0) {
        output += `<h2 class="kharkhovia">Kharkhovia Wins!</h2>`;
    } else if (cascadeaTotalUnits === 0 && kharkhoviaTotalUnits === 0) {
        output += `<h2>It's a Tie!</h2>`;
    } else {
        output += `<p>Both armies survive the battle.</p>`;
    }

    // Update unit counts and board
    updateUnitDisplays();
    updateBoardUnits();

    // Update output
    document.getElementById('output').innerHTML += output;

    // Clear rolledDice after combat simulation
    rolledDice = {
        cascadea: null,
        kharkhovia: null
    };

    // Clear selected tactics
    clearSelectedTactics();
}

// Function to simulate Tactics
// Note: Simulate Tactics should resolve combat based on rolledDice and selectedTactics
// It should not reroll the dice
// Assumes that rolledDice has been rolled and tactics are selected
// Resolves combat and updates units
function simulateTactics() {
    if (!rolledDice.cascadea || !rolledDice.kharkhovia) {
        alert("Please roll dice before simulating tactics.");
        return;
    }

    if (!selectedTactics.cascadea || !selectedTactics.kharkhovia) {
        alert("Please select one tactic for each faction before simulating tactics.");
        return;
    }

    let output = '';

    // Header
    output += `<h2>Tactics Simulation</h2>`;

    // Display selected tactics
    output += `<p><span class="cascadea">Cascadea's Tactic:</span> Tactic ${selectedTactics.cascadea}</p>`;
    output += `<p><span class="kharkhovia">Kharkhovia's Tactic:</span> Tactic ${selectedTactics.kharkhovia}</p>`;

    // Apply Tactics Effects
    let cascadeaAttackBonus = tacticsEffects.cascadea[selectedTactics.cascadea].attackBonus || 0;
    let cascadeaDefenceBonus = tacticsEffects.cascadea[selectedTactics.cascadea].defenceBonus || 0;

    let kharkhoviaAttackBonus = tacticsEffects.kharkhovia[selectedTactics.kharkhovia].attackBonus || 0;
    let kharkhoviaDefenceBonus = tacticsEffects.kharkhovia[selectedTactics.kharkhovia].defenceBonus || 0;

    // Modify total hits and blocks based on Tactics
    const modifiedCascadeaHits = rolledDice.cascadea.totalHits + cascadeaAttackBonus;
    const modifiedKharkhoviaHits = rolledDice.kharkhovia.totalHits + kharkhoviaAttackBonus;

    const modifiedCascadeaBlocks = rolledDice.cascadea.totalBlocks + cascadeaDefenceBonus;
    const modifiedKharkhoviaBlocks = rolledDice.kharkhovia.totalBlocks + kharkhoviaDefenceBonus;

    // Display modifiers
    output += `<p><span class="cascadea">Cascadea's Attack Bonus:</span> +${cascadeaAttackBonus}</p>`;
    output += `<p><span class="cascadea">Cascadea's Defence Bonus:</span> +${cascadeaDefenceBonus}</p>`;
    output += `<p><span class="kharkhovia">Kharkhovia's Attack Bonus:</span> +${kharkhoviaAttackBonus}</p>`;
    output += `<p><span class="kharkhovia">Kharkhovia's Defence Bonus:</span> +${kharkhoviaDefenceBonus}</p>`;

    // Calculate damage with Tactics
    const cascadeaDamage = Math.max(modifiedKharkhoviaHits - modifiedCascadeaBlocks, 0);
    const kharkhoviaDamage = Math.max(modifiedCascadeaHits - modifiedKharkhoviaBlocks, 0);

    // Output Damage Dealt
    output += `<h3>Damage Dealt:</h3>`;
    output += `<span class="cascadea">Cascadea</span> deals ${kharkhoviaDamage} damage to <span class="kharkhovia">Kharkhovia</span>.<br>`;
    output += `<span class="kharkhovia">Kharkhovia</span> deals ${cascadeaDamage} damage to <span class="cascadea">Cascadea</span>.<br>`;

    // Update damage arrows
    updateDamageArrows(cascadeaDamage, kharkhoviaDamage);

    // Combat Resolution
    output += `<h3>Combat Resolution:</h3>`;
    const cascadeaResolution = resolveDamage('cascadea', cascadeaDamage);
    const kharkhoviaResolution = resolveDamage('kharkhovia', kharkhoviaDamage);
    output += cascadeaResolution.output;
    output += kharkhoviaResolution.output;

    // Update unit losses display
    updateUnitLosses('cascadea', cascadeaResolution.unitsLost);
    updateUnitLosses('kharkhovia', kharkhoviaResolution.unitsLost);

    // Determine Winner
    const cascadeaTotalUnits = totalUnits(units.cascadea);
    const kharkhoviaTotalUnits = totalUnits(units.kharkhovia);

    if (cascadeaTotalUnits > 0 && kharkhoviaTotalUnits === 0) {
        output += `<h2 class="cascadea">Cascadea Wins!</h2>`;
    } else if (kharkhoviaTotalUnits > 0 && cascadeaTotalUnits === 0) {
        output += `<h2 class="kharkhovia">Kharkhovia Wins!</h2>`;
    } else if (cascadeaTotalUnits === 0 && kharkhoviaTotalUnits === 0) {
        output += `<h2>It's a Tie!</h2>`;
    } else {
        output += `<p>Both armies survive the battle.</p>`;
    }

    // Update unit counts and board
    updateUnitDisplays();
    updateBoardUnits();

    // Update output
    document.getElementById('output').innerHTML += output;

    // Clear rolledDice after tactics simulation
    rolledDice = {
        cascadea: null,
        kharkhovia: null
    };

    // Clear selected tactics
    clearSelectedTactics();
}

// Function to resolve damage for a faction
function resolveDamage(faction, damage) {
    let output = '';
    let unitsLost = {};
    unitsData.forEach(unit => {
        unitsLost[unit.name] = 0;
    });
    let unitTypes = unitsData.map(unit => unit.name);

    // Sort unitTypes by strength ascending
    unitTypes.sort((a, b) => unitStrength[a] - unitStrength[b]);

    unitTypes.forEach(unitType => {
        let unitStrengthVal = unitStrength[unitType];
        let unitCount = units[faction][unitType];
        while (unitCount > 0 && damage >= unitStrengthVal) {
            damage -= unitStrengthVal;
            unitsLost[unitType]++;
            units[faction][unitType]--;
            unitCount--;
        }
    });

    // Output damage resolution
    const lostUnits = unitsData.filter(unit => unitsLost[unit.name] > 0);
    if (lostUnits.length > 0) {
        if (totalUnits(units[faction]) === 0) {
            output += `<p class="${faction}">${capitalizeFirstLetter(faction)}'s units are eliminated!</p>`;
        } else {
            // Build a string that lists units lost
            let losses = lostUnits.map(unit => `${unitsLost[unit.name]} ${unit.displayName}`).join(', ');
            output += `<p>${capitalizeFirstLetter(faction)} loses ${losses}.</p>`;
        }
    } else {
        output += `<p>${capitalizeFirstLetter(faction)} did not lose any units.</p>`;
    }

    return { output: output, unitsLost: unitsLost };
}

// Function to calculate total units
function totalUnits(factionUnits) {
    return unitsData.reduce((total, unit) => total + factionUnits[unit.name], 0);
}

// Function to calculate total strength
function calculateTotalStrength(faction) {
    let total = 0;
    unitsData.forEach(unit => {
        total += units[faction][unit.name] * unit.strength;
    });
    return total;
}

// Function to update unit displays
function updateUnitDisplays() {
    ['cascadea', 'kharkhovia'].forEach(faction => {
        unitsData.forEach(unit => {
            document.getElementById(`${faction}-${unit.name}`).innerText = units[faction][unit.name];
        });
    });
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize board units on page load
updateBoardUnits();

// Function to initialize Tactics Selection
function initializeTacticsSelection() {
    // Add event listeners to all tactic cards
    const tacticCards = document.querySelectorAll('.tactic-card');
    tacticCards.forEach(card => {
        card.addEventListener('click', () => {
            const faction = card.getAttribute('data-faction');
            const tactic = card.getAttribute('data-tactic');

            // Deselect previously selected tactic for the faction
            const factionCards = document.querySelectorAll(`.tactic-card[data-faction="${faction}"]`);
            factionCards.forEach(fc => fc.classList.remove('selected'));

            // Select the clicked tactic
            card.classList.add('selected');

            // Store the selected tactic
            selectedTactics[faction] = tactic;
        });
    });
}

// Function to clear selected tactics after simulation
function clearSelectedTactics() {
    ['cascadea', 'kharkhovia'].forEach(faction => {
        selectedTactics[faction] = null;
        const factionCards = document.querySelectorAll(`.tactic-card[data-faction="${faction}"]`);
        factionCards.forEach(fc => fc.classList.remove('selected'));
    });
}

// Function to update damage arrows
function updateDamageArrows(cascadeaDamage, kharkhoviaDamage) {
    // Cascadea deals damage to Kharkhovia
    const cascadeaDamageEmojis = cascadeaDamageArrowEmoji + numberToEmojis(kharkhoviaDamage);
    document.getElementById('cascadea-damage-arrow').textContent = cascadeaDamageEmojis;

    // Kharkhovia deals damage to Cascadea
    const kharkhoviaDamageEmojis = kharkhoviaDamageArrowEmoji + numberToEmojis(cascadeaDamage);
    document.getElementById('kharkhovia-damage-arrow').textContent = kharkhoviaDamageEmojis;
}

// Function to update unit losses display
function updateUnitLosses(faction, unitsLost) {
    let lossesDisplay = '';
    const minusEmoji = '➖';

    unitsData.forEach(unit => {
        if (unitsLost[unit.name] > 0) {
            lossesDisplay += `${minusEmoji}${unit.emoji.repeat(unitsLost[unit.name])}<br>`;
        }
    });

    // Remove the last <br> if exists
    if (lossesDisplay.endsWith('<br>')) {
        lossesDisplay = lossesDisplay.slice(0, -4);
    }

    document.getElementById(`${faction}-unit-losses`).innerHTML = lossesDisplay;
}
