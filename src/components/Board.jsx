import React, { useState, useEffect, useRef } from "react";
import "../Board.css";
import usePlayer from "../hooks/usePlayer";
import { mineGold, visitBlacksmith, recruitAlly, buildTunnel } from "../utility/Actions";
import { supabase } from "../supabaseClient";

const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 6;

function Board({ user }) {
    const actionLogRef = useRef(null);
    const [tunnelTiles, setTunnelTiles] = useState([]);
    const [actionLog, setActionLog] = useState([]);
    const { playerGold, playerAllies, playerItems, addGold, addAlly, addItem, setPlayerGold, setPlayerAllies, setPlayerItems } = usePlayer();
    
    useEffect(() => {
        if (actionLogRef.current) {
            actionLogRef.current.scrollTop = actionLogRef.current.scrollHeight;
        }
    }, [actionLog]);
    
    // Shuffles tiles for game board
    const shuffle = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled;
    };

    const getTierClass = (rowIndex) => {
        if (rowIndex <= 1) return "tier-1";
        if (rowIndex <= 3) return "tier-2";
        return "tier-3";
    }

    // Initialize board with all tiles hidden
    // const [tiles, setTiles] = useState(
    //     Array(BOARD_HEIGHT)
    //     .fill()
    //     .map((_, row) =>
    //         Array(BOARD_WIDTH).fill().map((_, col) => {
    //             const isStart = row === 0 && col === 2;
    //             return {
    //                 revealed: isStart,
    //                 type: isStart ? "base" : "unknown",
    //             };
    //         })
    //     )
    // );

    const generateBoard = () => {
        const tier1 = shuffle([
          ...Array(2).fill("blacksmith"),
          ...Array(3).fill("mine"),
          ...Array(2).fill("builder"),
          ...Array(2).fill("empty"),
        ]);
      
        const tier2 = shuffle([
          ...Array(2).fill("blacksmith"),
          ...Array(5).fill("mine"),
          ...Array(2).fill("builder"),
          "empty",
        ]);
      
        const tier3 = shuffle([
          ...Array(2).fill("blacksmith"),
          ...Array(6).fill("mine"),
          ...Array(2).fill("builder"),
        ]);
      
        let board = [];
        for (let row = 0; row < BOARD_HEIGHT; row++) {
          board.push([]);
          for (let col = 0; col < BOARD_WIDTH; col++) {
            const isBase = row === 0 && col === 2;
            let type = "unknown";
      
            if (isBase) {
              type = "base";
            } else if (row <= 1) {
              type = tier1.pop();
            } else if (row <= 3) {
              type = tier2.pop();
            } else {
              type = tier3.pop();
            }
      
            board[row].push({
              revealed: isBase,
              type: isBase ? "base" : type,
            });
          }
        }
      
        return board;
      };
      
    const [tiles, setTiles] = useState(generateBoard());

    const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 2});

    const revealTile = (row, col) => {
        if (tiles[row][col].revealed) {
            return;
        }
        setTiles((prevTiles) =>
          prevTiles.map((r, rIdx) =>
            r.map((tile, cIdx) =>
              rIdx === row && cIdx === col
                ? { ...tile, revealed: true }
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
            setActionLog((prevLog) => [...prevLog, "Please select a tile adjacent to your current position"])
        }
    };

    const handleSaveGame = async () => {
        const { data, error } = await supabase
            .from('game_state')  // Using the correct table name
            .upsert({
                user_id: user.id,  // Save the user ID to ensure the game belongs to the user
                board: JSON.stringify(tiles),  // Save the board state
                position: JSON.stringify(currentPosition),  // Save the player's position
                gold: playerGold,  // Save the player's gold
                allies: JSON.stringify(playerAllies),  // Save the player's allies
                items: JSON.stringify(playerItems),  // Save the player's items
            })
            .eq('user_id', user.id);  // Ensure the correct user ID is used for the upsert operation
    
        if (error) {
            console.error("Error saving game:", error);
            setActionLog((prevLog) => [...prevLog, "Error saving game."]);
        } else {
            setActionLog((prevLog) => [...prevLog, "Game saved successfully!"]);
        }
    };

    const handleLoadGame = async () => {
        const { data, error } = await supabase
            .from('game_state')  // Using the correct table name
            .select('board, position, gold, allies, items')
            .eq('user_id', user.id)  // Fetch data only for the current user
            .order('created_at', { ascending: false })  // Order by created_at, most recent first
            .limit(1);  // Only fetch the most recent game state
    
        if (error) {
            console.error("Error loading game:", error);
            setActionLog((prevLog) => [...prevLog, "Error loading game."]);
        } else if (data && data.length > 0) {
            // Handle the case when the game data is found
            const gameData = data[0];  // Take the first (most recent) game state
            setTiles(JSON.parse(gameData.board));  // Deserialize the board state
            setCurrentPosition(JSON.parse(gameData.position));  // Deserialize the position
            setPlayerGold(gameData.gold);  // Set the player's gold
            setPlayerAllies(JSON.parse(gameData.allies));  // Deserialize allies
            setPlayerItems(JSON.parse(gameData.items));  // Deserialize items
    
            setActionLog((prevLog) => [...prevLog, "Game loaded successfully!"]);
        } else {
            setActionLog((prevLog) => [...prevLog, "No saved game found for this user."]);
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
                                        className={`tile ${tile.revealed ? tile.type : "hidden"} ${isPlayerHere ? "player-here" : ""} ${getTierClass(rowIndex)}`}

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
                            <button onClick={handleSaveGame}>Save</button>
                            <button onClick={handleLoadGame}>Load</button>
                            <p>(or tap on an adjacent space to move)</p>
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