import { useState, useEffect, useRef } from "react";
import "../Board.css";
import playerStatus from "../hooks/usePlayer";
import { mineGold, visitBlacksmith, recruitAlly, buildTunnel } from "../utility/Actions";

const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 6;

function Board() {
    const actionLogRef = useRef(null);
    const [tunnelTiles, setTunnelTiles] = useState([]);
    const [actionLog, setActionLog] = useState([]);
    const { playerGold, playerAllies, playerItems, addGold, addAlly, addItem } = playerStatus();
    
    useEffect(() => {
        if (actionLogRef.current) {
            actionLogRef.current.scrollTop = actionLogRef.current.scrollHeight;
        }
    }, [actionLog]);
    
    const getRandomTileType = () => {
        const types = ["mine", "blacksmith", "builder", "empty"];
        return types[Math.floor(Math.random() * types.length)];
    };

    // Initialize board with all tiles hidden
    const [tiles, setTiles] = useState(
        Array(BOARD_HEIGHT)
        .fill()
        .map((_, row) =>
            Array(BOARD_WIDTH).fill().map((_, col) => {
                const isStart = row === 0 && col === 2;
                return {
                    revealed: isStart,
                    type: isStart ? "base" : "unknown",
                };
            })
        )
    );

    const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 2});

    const revealTile = (row, col) => {
        if (tiles[row][col].revealed) {
            return;
        }
        setTiles((prevTiles) =>
          prevTiles.map((r, rIdx) =>
            r.map((tile, cIdx) =>
              rIdx === row && cIdx === col
                ? { ...tile, revealed: true, type: getRandomTileType() }
                : tile
            )
          )
        );
    };

    const movePlayer = (direction) => {
        setCurrentPosition((prevPosition) => {
            let newRow = prevPosition.row;
            let newCol = prevPosition.col;

            if (direction === "up" && newRow > 0) newRow -= 1;
            if (direction === "down" && newRow < BOARD_HEIGHT - 1) newRow += 1;
            if (direction === "left" && newCol > 0) newCol -= 1;
            if (direction === "right" && newCol < BOARD_WIDTH - 1) newCol += 1;
            revealTile(newRow, newCol);

            return { row: newRow, col: newCol };
        });
    };

    const getCurrentTile = () => {
        return tiles[currentPosition.row][currentPosition.col];
    };

    const isAdjacent = (targetRow, targetCol) => {
        const { row: playerRow, col: playerCol } = currentPosition;
        const playerTile = tiles[playerRow][playerCol];
        const targetTile = tiles[targetRow][targetCol];
      
        const isOrthogonal =
          (targetRow === playerRow && Math.abs(targetCol - playerCol) === 1) ||
          (targetCol === playerCol && Math.abs(targetRow - playerRow) === 1);
      
        const playerIsConnected = playerTile.type === "base" || playerTile.type === "tunnel";
        const targetIsConnected = targetTile.type === "base" || targetTile.type === "tunnel";
      
        return isOrthogonal || (playerIsConnected && targetIsConnected);
      };

    const handleTileClick = (row, col) => {
        if (isAdjacent(row, col)) {
            setCurrentPosition({ row, col });
            revealTile(row, col);
        } else {
            setActionLog((prevLog) => [...prevLog, "Please select a tile orthogonal to your current position"])
        }
    };

    return (
        <div className="game-container">
            <div className="main-content">
                <div className="board">
                    {tiles.map((row, rowIndex) => (
                        <div key={rowIndex} className="row">
                            {row.map((tile, colIndex) => {
                                const isPlayerHere =
                                    currentPosition.row === rowIndex &&
                                    currentPosition.col === colIndex;
    
                                return (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className={`tile ${tile.revealed ? tile.type : "hidden"} ${isPlayerHere ? "player-here" : ""}`}
                                        onClick={() => handleTileClick(rowIndex, colIndex)}
                                    >
                                        {tile.revealed ? tile.type.toUpperCase() : "?"}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
    
                <div className="side-panel">
                    <div className="controls">
                        <div>
                            <button onClick={() => movePlayer("up")}>Up</button>
                            <button onClick={() => movePlayer("down")}>Down</button>
                            <button onClick={() => movePlayer("left")}>Left</button>
                            <button onClick={() => movePlayer("right")}>Right</button>
                        </div>
                    </div>
    
                    <div className="contextual-actions">
                        {getCurrentTile().type === "base" && (
                            <button onClick={() =>
                                recruitAlly({ playerAllies, playerGold, addAlly, addGold, setActionLog })
                            }>
                                Recruit Ally - {playerAllies.length > 0 ? `${playerAllies.length} gold` : "Free"}
                            </button>
                        )}
                        {getCurrentTile().type === "mine" && (
                            <button onClick={() =>
                                mineGold({currentPosition, tiles, setTiles, addGold, setActionLog,})
                            }>
                                Mine
                            </button>
                        )}
                        {getCurrentTile().type === "blacksmith" && (
                            <button onClick={() =>
                                visitBlacksmith({ playerGold, addGold, addItem, setActionLog })
                            }>
                                Buy Item - 2 gold
                            </button>
                        )}
                        {getCurrentTile().type === "builder" && (
                            <button onClick={() =>
                                buildTunnel({
                                    currentPosition,
                                    tiles,
                                    setTiles,
                                    tunnelTiles,
                                    setTunnelTiles,
                                    playerGold,
                                    addGold,
                                    setActionLog,
                                })
                            }>
                                Build Tunnel - 1 gold
                            </button>
                        )}
                    </div>

                    <div className="player-status">
                        <p><strong>Gold:</strong> {playerGold}</p>
                        <p><strong>Allies:</strong> {playerAllies.join(", ") || "None"}</p>
                        <p><strong>Items:</strong> {playerItems.join(", ") || "None"}</p>
                    </div>
    
                    <div className="action-log" ref={actionLogRef}>
                        {actionLog.map((entry, i) => (
                            <p key={i}>{entry}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Board;