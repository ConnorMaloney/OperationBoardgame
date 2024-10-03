// units.js

// Define all units in an array for easy management and scalability
const unitsData = [
    {
        name: "infantry",
        displayName: "Infantry",
        emoji: "💂‍♂️",
        lightAttack: 1,   // Number of Light Attack Dice
        heavyAttack: 0,   // Number of Heavy Attack Dice
        defence: 0,       // Number of Defence Dice
        strength: 1       // Strength value
    },
    {
        name: "cavalry",
        displayName: "Cavalry",
        emoji: "🏇",
        lightAttack: 2,
        heavyAttack: 0,
        defence: 0,
        strength: 1
    },
    {
        name: "armoredCar",
        displayName: "Armored Car",
        emoji: "🚙",
        lightAttack: 1,
        heavyAttack: 1,
        defence: 1,
        strength: 2
    },
    {
        name: "tank",
        displayName: "Tank",
        emoji: "🚂", // Updated Tank Emoji
        lightAttack: 1,
        heavyAttack: 2,
        defence: 3,
        strength: 3
    },
    {
        name: "general",
        displayName: "General",
        emoji: "👨‍✈️", // New General Emoji
        lightAttack: 1,
        heavyAttack: 1,
        defence: 3,
        strength: 5
    }
    // You can add more units here in the future
];
