import { drawAlly } from "../decks/allyDeck"
import { drawItem } from "../decks/itemDeck";

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

export function visitBlacksmith({ playerGold, addGold, addItem, setActionLog }) {
    if (playerGold >= 2) {
        const item = drawItem();
        addGold(-2);
        addItem(item.name);
        setActionLog((prev) => [...prev, `You bought ${item.name} from the blacksmith`]);
    } else {
        setActionLog((prev) => [...prev, "Not enough gold (2 gold needed)"]);
    }
}

export function recruitAlly({ playerAllies, playerGold, addAlly, addGold, setActionLog }) {
    const cost = playerAllies.length;

    if (playerGold >= cost) {
        const ally = drawAlly();
        addAlly(ally.type);
        addGold(-cost);
        setActionLog((prev) => [
            ...prev,
            cost > 0
                ? `You spent ${cost} gold to recruit ${ally.type}`
                : `You recruited ${ally.type}`
        ]);
    } else {
        setActionLog((prev) => [...prev, `You need ${cost} gold to recruit another ally`]);
    }
}

export function buildTunnel({
    currentPosition,
    tiles,
    setTiles,
    tunnelTiles,
    setTunnelTiles,
    playerGold,
    addGold,
    setActionLog,

}) {
    const { row, col } = currentPosition;
    const tile = tiles[row][col]
    
    if (tile.type !== "builder") return;

    const cost = 1;
    if (playerGold < cost) {
        setActionLog((prev) => [
            ...prev,
            `You need ${cost} gold to build a tunnel`,
        ]);
        return;
    }

    addGold(-cost);

    const newTunnel = { row, col };
    const updatedTunnels = [...tunnelTiles, newTunnel];
    setTunnelTiles(updatedTunnels);

    const updatedTiles = tiles.map((r, rIdx) =>
        r.map((t, cIdx) =>
            rIdx === row && cIdx === col ? {...t, type: "tunnel" } : t
        )
    );
    setTiles(updatedTiles);
    setActionLog((prev) => [...prev, `Tunnel built! This space is now considered adjacent to the base and other tunnels`])
}