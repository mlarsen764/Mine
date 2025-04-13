const allies = [
    { type: "Fighter", effect: "Adds 1 to battle rolls" },
    { type: "Miner", effect: "Adds 1 to mining rolls" },
]

let shuffledAllies = [];

function shuffleDeck() {
    shuffledAllies = [...allies].sort(() => Math.random() - 0.5);
}

function drawAlly() {
    if (shuffledAllies.length === 0) shuffleDeck();
    return shuffledAllies.pop();
}

export { drawAlly, shuffleDeck };