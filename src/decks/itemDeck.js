const items = [
    { name: "Pickaxe", effect: "Mine yields +1 gold" },
    { name: "Torch", effect: "Reveal adjacent tiles" },
];

let shuffledItems = [];

function shuffleDeck() {
    shuffledItems = [...items].sort(() => Math.random() - 0.5);
}

function drawItem() {
    if (shuffledItems.length === 0) shuffleDeck();
    return shuffledItems.pop();
}

export { drawItem, shuffleDeck };