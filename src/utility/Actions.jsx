export function mineGold({ currentPosition, tiles, setTiles, addGold, setActionLog }) {
    const { row, col } = currentPosition;
    const tile = tiles[row][col];

    if (tile.type !== "mine") return;

    const roll = Math.ceil(Math.random() * 6);
    let resultMessage = "";

    if (roll <= 2) {
        const updatedTiles = tiles.map((r, rIdx) =>
            r.map((t, cIdx) =>
                rIdx === row && cIdx === col ? {...t, type: "empty" } : t
            )
        );
        setTiles(updatedTiles);
        resultMessage = `Rolled a ${roll}: The mine collapsed!`;
    } else if (roll == 3) {
        resultMessage = `Rolled a ${roll}: You found nothing.`;
    } else {
        addGold(1);
        resultMessage = `Rolled a ${roll}: You gained 1 gold!`;
    }

    setActionLog((prev) => [...prev, resultMessage]);
}